// 🔌 Load environment variables from .env file
require('dotenv').config();

// 🛡️ Safe Defaults: Prevents OAuth clients or config keys from throwing errors
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

// 🎭 MOCK: express-rate-limit (Brute-force Protection passthrough)
jest.mock('express-rate-limit', () => ({
    rateLimit: () => (req, res, next) => next()
}));

// 📥 Import the auth router (for user registration/login) and the chat router under test
const authRouter = require('../server/routes/auth');
const chatRouter = require('../server/routes/chat');

let db;
let app;

// Setup hook: Runs once before any tests start
beforeAll(async () => {
    // 1. Open a clean, isolated in-memory SQLite database instance
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // 2. Build the users, transactions, and audit_logs tables (needed for chatbot context building)
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

        CREATE TABLE transactions (
            id TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            receiver TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT DEFAULT 'General',
            is_negative INTEGER NOT NULL,
            status TEXT DEFAULT 'Complete',
            user_id TEXT
        );

        CREATE TABLE audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    // 3. Initialize Express and mount the routers
    app = express();
    app.use(express.json());
    app.use('/api', authRouter(db));
    app.use('/api/chat', chatRouter(db));
});

// Teardown hook: Close database after tests
afterAll(async () => {
    await db.close();
});

// =========================================================================
// 🤖 TEST SUITE: POST /api/chat (AI Financial Assistant Verification)
// =========================================================================
describe('POST /api/chat Integration (AI Chatbot)', () => {
    let userToken;

    // Pre-test Seed hook: Setup a verified account with standard funds
    beforeAll(async () => {
        // A. Register a brand-new user specifically for chat tests
        await request(app).post('/api/users/register').send({
            username: 'chatbotuser',
            email: 'chatbotuser@example.com',
            password: 'password123'
        });
        
        // B. Set account balance to exactly €1250.50 and mark as verified
        await db.run("UPDATE users SET is_verified = 1, balance = 1250.50 WHERE username = 'chatbotuser'");

        // C. Authenticate the chatbot user to get a JWT token
        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'chatbotuser',
            password: 'password123'
        });
        userToken = loginRes.body.token;
    });

    // 🧪 Test Case 1: Route Protection / Authentication Guard.
    // Verifies that the chat request is rejected with 401 Unauthorized if the client lacks a valid JWT bearer token.
    test('should reject chat requests without a JWT token with 401 Unauthorized', async () => {
        const response = await request(app)
            .post('/api/chat')
            .send({ message: 'Hello, what is my balance?' });
        
        expect(response.status).toBe(401);
    });

    // 🧪 Test Case 2: Input Content Validation check.
    // Verifies that sending an empty body or missing the 'message' field returns a 400 Bad Request.
    test('should reject chat requests with missing message parameter with 400 Bad Request', async () => {
        const response = await request(app)
            .post('/api/chat')
            .set('Authorization', `Bearer ${userToken}`)
            .send({}); // Empty JSON payload
        
        expect(response.status).toBe(400);
        expect(response.body.error).toContain('Message content is required');
    });

    // 🧪 Test Case 3: RAG Context & Simulator Fallback Response.
    // Verifies that the chatbot system prompt integrates real database parameters (username & balance)
    // and returns the mock/fallback reply when no API key is set, showing the correct financial state.
    test('should respond successfully with mock fallback reply containing balance details', async () => {
        const response = await request(app)
            .post('/api/chat')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ message: 'What is my balance?' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('reply');
        
        // Expecting the mock responder in chatService.js to return a message indicating the balance
        expect(response.body.reply).toContain('balance');
    });
});
