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
const adminRouter = require('./admin'); // Import our admin routing module
const transactionsRouter = require('./transactions'); // 💳 Import our transaction routing module (corrected path with 's')

let db;
let app;

// Setup hook: Runs once before any test cases start
beforeAll(async () => {
    // 1. Open an in-memory SQLite database (erased when tests finish)
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // 2. Create the users and audit_logs tables needed for tests
    await db.exec(`
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT NOT NULL,
            is_verified INTEGER NOT NULL DEFAULT 0,
            verification_code TEXT,
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

    // 3. Initialize the Express application and mount routers
    app = express();
    app.use(express.json()); // Enable JSON body parsing middleware
    app.use('/api', authRouter(db)); // Mount under '/api' prefix
    app.use('/api/admin', adminRouter(db));// Mount admin router under '/api/admin' prefix
    app.use('/api/transactions', transactionsRouter(db)); // 💳 Mount transactions router under '/api/transactions'
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

            // mock verifying the email directly in the db so we can login
            await db.run("UPDATE users SET is_verified = 1 WHERE username = 'normalclient'");

            // login to get standard user JWT
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'normalclient',
                    password: 'securepassword123'
                });
            const userToken = loginRes.body.token;

            // try to access admin endpoint with standard user token
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

            // verifying the email and set role to admin in the db
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

    // 📜 Test Suite for Admin Audit Logs Endpoint
    describe('GET /api/admin/audit-logs Integration', () => {
        test('should reject requests without a JWT token with 401 Unauthorized', async () => {
            const response = await request(app).get('/api/admin/audit-logs');
            expect(response.status).toBe(401);
            expect(response.body.error).toContain('No token provided');
        });

        test('should reject requests from standard users with 403 Forbidden', async () => {
            // Register a standard user
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'standardauditor',
                    email: 'auditor@example.com',
                    password: 'securepassword123'
                });

            // Set as verified
            await db.run("UPDATE users SET is_verified = 1 WHERE username = 'standardauditor'");

            // Login to get token
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'standardauditor',
                    password: 'securepassword123'
                });
            const userToken = loginRes.body.token;

            // Try to view audit logs
            const response = await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Access denied');
        });

        test('should allow access for admin and return the logs in order', async () => {
            // Register an admin user
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'adminauditor',
                    email: 'adminauditor@example.com',
                    password: 'securepassword123'
                });

            // Make them an admin
            await db.run("UPDATE users SET is_verified = 1, role = 'admin' WHERE username = 'adminauditor'");

            // Login
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'adminauditor',
                    password: 'securepassword123'
                });
            const adminToken = loginRes.body.token;

            // Fetch the logs
            const response = await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            // Check that we have log entries and the username is populated
            expect(response.body.length).toBeGreaterThan(0);
            const loginSuccessLog = response.body.find(log => log.action === 'LOGIN_SUCCESS');
            expect(loginSuccessLog).toBeDefined();
            expect(loginSuccessLog.username).toBe('adminauditor');
        });
    });

    // 📜 Test Suite for PSD2 2FA Transaction Signing & Transfer Audit Logging
    describe('POST /api/transactions/transfer Integration with 2FA & Audit Logs', () => {
        let senderToken;
        let adminToken;

        beforeAll(async () => {
            // A. Register receiver
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'transferreceiver',
                    email: 'recv@example.com',
                    password: 'securepassword123'
                });
            await db.run("UPDATE users SET is_verified = 1 WHERE username = 'transferreceiver'");

            // B. Register sender with a balance of €500
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'transfersender',
                    email: 'send@example.com',
                    password: 'securepassword123'
                });
            await db.run("UPDATE users SET is_verified = 1, balance = 500.0 WHERE username = 'transfersender'");

            // C. Register admin
            await request(app)
                .post('/api/users/register')
                .send({
                    username: 'auditboss',
                    email: 'boss@example.com',
                    password: 'securepassword123'
                });
            await db.run("UPDATE users SET is_verified = 1, role = 'admin' WHERE username = 'auditboss'");

            // D. Login sender to get token
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'transfersender',
                    password: 'securepassword123'
                });
            senderToken = loginRes.body.token;

            // E. Login admin to get token
            const adminLoginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'auditboss',
                    password: 'securepassword123'
                });
            adminToken = adminLoginRes.body.token;
        });

        test('should block transfer with 403 Forbidden if sender has 2FA enabled but code is missing', async () => {
            // Enable 2FA for sender directly in the test database
            await db.run("UPDATE users SET two_factor_enabled = 1, two_factor_secret = 'MOCK_SECRET_123' WHERE username = 'transfersender'");

            const response = await request(app)
                .post('/api/transactions/transfer')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    receiverUsername: 'transferreceiver',
                    amount: '100.0'
                });

            expect(response.status).toBe(403);
            expect(response.body.error).toContain('Two-factor authentication code is required');
        });

        test('should allow transfer and save TRANSFER_SIGNED, SENT, and RECEIVED logs when 2FA code is provided', async () => {
            // Transfer with valid 2FA code (mocked otplib automatically returns true for Jest)
            const response = await request(app)
                .post('/api/transactions/transfer')
                .set('Authorization', `Bearer ${senderToken}`)
                .send({
                    receiverUsername: 'transferreceiver',
                    amount: '100.0',
                    twoFactorCode: '123456'
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('completed successfully');

            // Fetch the audit logs using the Admin Token
            const logsRes = await request(app)
                .get('/api/admin/audit-logs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(logsRes.status).toBe(200);

            // 🔍 1. Search through the list of logs retrieved from the database to find each specific action
            // .find() is like walking through a stack of receipts and pulling out the ones we want:
            const signedLog = logsRes.body.find(log => log.action === 'TRANSFER_SIGNED');
            const sentLog = logsRes.body.find(log => log.action === 'TRANSFER_SENT');
            const recvLog = logsRes.body.find(log => log.action === 'TRANSFER_RECEIVED');

            // 🛡️ 2. Test Check: Make sure all three logs actually exist in the database.
            // If any log is missing (undefined), the test will fail right here.
            expect(signedLog).toBeDefined();
            expect(sentLog).toBeDefined();
            expect(recvLog).toBeDefined();

            // 👤 3. Test Check: Verify that the logs are linked to the correct usernames.
            // - The signature log must belong to the sender.
            // - The sent log must belong to the sender.
            // - The received log must belong to the receiver.
            expect(signedLog.username).toBe('transfersender');
            expect(sentLog.username).toBe('transfersender');
            expect(recvLog.username).toBe('transferreceiver');
        });
    });
});
