// 🔌 Load environment variables
require('dotenv').config();
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';

// 📥 Import necessary dependencies
const request = require('supertest'); // Supertest for mock HTTP requests
const express = require('express');  // Express to instantiate a mock test server
const sqlite3 = require('sqlite3'); // SQLite database driver
const { open } = require('sqlite'); // SQLite wrapper for promises
// 🎭 Mock otplib to bypass ES Modules parsing issues in Jest
jest.mock('otplib', () => ({
    authenticator: {
        generateSecret: () => 'MOCK_SECRET_123',
        keyuri: () => 'otpauth://totp/mock',
        verify: () => true
    }
}));

// 🎭 Mock emailService to avoid sending real emails and open handles during tests
jest.mock('../services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));

const authRouter = require('./auth'); // Import our actual auth routing module

let db;
let app;

// Setup hook: Runs once before any test cases start
beforeAll(async () => {
    // 1. Open an in-memory SQLite database (erased when tests finish)
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // 2. Create the users table schema needed for registration/login
    await db.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            is_verified INTEGER NOT NULL DEFAULT 0,
            verification_code TEXT,
            two_factor_enabled INTEGER NOT NULL DEFAULT 0
        )
    `);

    // 3. Initialize the Express application and mount the auth router
    app = express();
    app.use(express.json()); // Enable JSON body parsing middleware
    app.use('/api', authRouter(db)); // Mount under '/api' prefix
});

// Teardown hook: Runs once after all tests complete
afterAll(async () => {
    await db.close(); // Close database connection
});

describe('POST /api/users/register Integration', () => {

    test('Should successfully register a new unverified user', async () => {
        // Send a mock POST request to the registration endpoint
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'securepassword123'
            });

        // Assertions: check status code, properties, and values
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body.requiresVerification).toBe(true);
    });

    test('should fail to register if email is invalid', async () => {
        // Send a mock POST request with an invalid email address
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'invalid-email', // Missing '@' and '.'
                password: 'securepassword123'
            });

        // Assertions: check for 400 Bad Request and validation message
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Please enter a valid email address');
    });

    test('should fail to register if username is taken', async () => {
        // 1. Register the first user successfully
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'duplicateuser',
                email: 'first@example.com',
                password: 'securepassword123'
            });

        // 2. Try to register a second user with the same username
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'duplicateuser',
                email: 'second@example.com',
                password: 'differentpassword123'
            });

        // Assertions: check that username duplication is blocked
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Username is already taken');
    });
});
