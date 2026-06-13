// 🔌 Load environment variables
require('dotenv').config();
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';

// 📥 Import necessary dependencies
const request = require('supertest');
const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// 🎭 Mock otplib to bypass ES Modules parsing issues in Jest
jest.mock('otplib', () => ({
    authenticator: {
        generateSecret: () => 'MOCK_SECRET_123',
        keyuri: () => 'otpauth://totp/mock',
        verify: () => true
    }
}));

// 🎭 Mock emailService to avoid sending real emails and open handles during tests
jest.mock('../server/services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));

// 🎭 Mock express-rate-limit to prevent test calls from getting blocked
jest.mock('express-rate-limit', () => {
    return {
        rateLimit: () => (req, res, next) => next()
    };
});

const authRouter = require('../server/routes/auth');

let db;
let app;

beforeAll(async () => {
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

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

    app = express();
    app.use(express.json());
    app.use('/api', authRouter(db));
});

afterAll(async () => {
    await db.close();
});

describe('POST /api/users/register Integration', () => {

    test('Should successfully register a new unverified user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'securepassword123'
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message');
        expect(response.body.requiresVerification).toBe(true);
    });

    test('should fail to register if email is invalid', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'invalid-email',
                password: 'securepassword123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Please enter a valid email address');
    });

    test('should fail to register if username is taken', async () => {
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'duplicateuser',
                email: 'first@example.com',
                password: 'securepassword123'
            });

        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'duplicateuser',
                email: 'second@example.com',
                password: 'differentpassword123'
            });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Username is already taken');
    });
});
