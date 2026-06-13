// 🔌 Load environment variables from .env file
require('dotenv').config();

// 🛡️ Safe Defaults: Prevents initialization errors
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';

// 📥 Import testing and database libraries
const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// 🎭 MOCK: otplib (TOTP Bypass)
jest.mock('otplib', () => ({
    authenticator: {
        generateSecret: () => 'MOCK_SECRET_123',
        keyuri: () => 'otpauth://totp/mock',
        verify: () => true
    }
}));

// 🎭 MOCK: emailService (Email Transmission)
jest.mock('../server/services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));

// 🎭 MOCK: express-rate-limit (Passthrough middleware)
jest.mock('express-rate-limit', () => ({
    rateLimit: () => (req, res, next) => next()
}));

const authRouter = require('../server/routes/auth');
const locationsRouter = require('../server/routes/locations');

let db;
let app;

// Setup hook: Runs once before any tests start
beforeAll(async () => {
    // A. Open clean, isolated in-memory SQLite database
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // B. Build the users table schema (needed for Auth Guard validation)
    await db.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            is_verified INTEGER NOT NULL DEFAULT 0,
            verification_code TEXT,
            two_factor_secret TEXT,
            two_factor_enabled INTEGER NOT NULL DEFAULT 0,
            balance REAL NOT NULL DEFAULT 1000.0,
            role TEXT NOT NULL DEFAULT 'user'
        );
    `);

    // C. Initialize Express and mount routes
    app = express();
    app.use(express.json());
    app.use('/api', authRouter(db));
    app.use('/api/locations', locationsRouter(db));
});

// Teardown hook: Close database after tests
afterAll(async () => {
    await db.close();
});

// =========================================================================
// 🗺️ TEST SUITE: GET /api/locations (Vienna ATM Finder Verification)
// =========================================================================
describe('GET /api/locations Integration (Vienna ATM Finder)', () => {
    let userToken;

    // Pre-test Seed hook: Setup verified account to obtain JWT token
    beforeAll(async () => {
        await request(app).post('/api/users/register').send({
            username: 'mapuser',
            email: 'mapuser@example.com',
            password: 'password123'
        });
        await db.run("UPDATE users SET is_verified = 1 WHERE username = 'mapuser'");

        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'mapuser',
            password: 'password123'
        });
        userToken = loginRes.body.token;
    });

    // 🧪 Test Case 1: Route Protection / Authentication Guard
    // Verifies that request is blocked with 401 Unauthorized if the token header is missing.
    test('should reject requests without a JWT token with 401 Unauthorized', async () => {
        const response = await request(app).get('/api/locations');
        expect(response.status).toBe(401);
    });

    // 🧪 Test Case 2: Location Properties & Coordinate Formats
    // Verifies that the locator endpoint successfully returns coordinates formatted 
    // as standard decimal floats (numbers) rather than strings (which would crash maps).
    test('should fetch ATM locations with correct properties and float lat/lng schema', async () => {
        const response = await request(app)
            .get('/api/locations')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0); // Should return list of pins

        // Pick the first location returned by the API
        const firstLoc = response.body[0];
        
        // Assert compliance with maps coordinates properties
        expect(firstLoc).toHaveProperty('id');
        expect(firstLoc).toHaveProperty('name');
        expect(firstLoc).toHaveProperty('type');
        expect(typeof firstLoc.lat).toBe('number'); // Critical: Must be float number, not string
        expect(typeof firstLoc.lng).toBe('number');
    });
});
