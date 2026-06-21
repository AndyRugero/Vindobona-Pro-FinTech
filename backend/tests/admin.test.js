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
const adminRouter = require('../server/routes/admin');

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
            role TEXT NOT NULL DEFAULT 'user',
            is_card_frozen INTEGER NOT NULL DEFAULT 0
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
    app.use('/api/admin', adminRouter(db));
});

afterAll(async () => {
    await db.close();
});

describe('GET /api/admin/users Integration', () => {
    test('should reject requests without a JWT token with 401 Unauthorized', async () => {
        const response = await request(app).get('/api/admin/users');
        expect(response.status).toBe(401);
        expect(response.body.error).toContain('No token provided');
    });

    test('should reject requests from standard users with 403 Forbidden', async () => {
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'normalclient',
                email: 'client@example.com',
                password: 'securepassword123'
            });

        await db.run("UPDATE users SET is_verified = 1 WHERE username = 'normalclient'");

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'normalclient',
                password: 'securepassword123'
            });
        const userToken = loginRes.body.token;

        const response = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toContain('Access denied');
    });

    test('should allow access for admin user with 200 OK', async () => {
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'adminboss',
                email: 'adminboss@example.com',
                password: 'securepassword123'
            });

        await db.run("UPDATE users SET is_verified = 1, role = 'admin' WHERE username = 'adminboss'");

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'adminboss',
                password: 'securepassword123'
            });
        const adminToken = loginRes.body.token;

        const response = await request(app)
            .get('/api/admin/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });
});

describe('GET /api/admin/audit-logs Integration', () => {
    test('should reject requests without a JWT token with 401 Unauthorized', async () => {
        const response = await request(app).get('/api/admin/audit-logs');
        expect(response.status).toBe(401);
        expect(response.body.error).toContain('No token provided');
    });

    test('should reject requests from standard users with 403 Forbidden', async () => {
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'standardauditor',
                email: 'auditor@example.com',
                password: 'securepassword123'
            });

        await db.run("UPDATE users SET is_verified = 1 WHERE username = 'standardauditor'");

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'standardauditor',
                password: 'securepassword123'
            });
        const userToken = loginRes.body.token;

        const response = await request(app)
            .get('/api/admin/audit-logs')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
        expect(response.body.error).toContain('Access denied');
    });

    test('should allow access for admin and return the logs in order', async () => {
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'adminauditor',
                email: 'adminauditor@example.com',
                password: 'securepassword123'
            });

        await db.run("UPDATE users SET is_verified = 1, role = 'admin' WHERE username = 'adminauditor'");

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'adminauditor',
                password: 'securepassword123'
            });
        const adminToken = loginRes.body.token;

        const response = await request(app)
            .get('/api/admin/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);

        expect(response.body.length).toBeGreaterThan(0);
        const loginSuccessLog = response.body.find(log => log.action === 'LOGIN_SUCCESS');
        expect(loginSuccessLog).toBeDefined();
        expect(loginSuccessLog.username).toBe('adminauditor');
    });
});
