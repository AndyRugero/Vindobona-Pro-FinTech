// 🔌 Load environment variables from .env file
require('dotenv').config();

// 🛡️ Safe Defaults: Fallback variables to prevent authentication middleware 
// or OAuth clients from throwing "missing key" configuration errors during tests.
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';

// 📥 Import testing and database libraries
const request = require('supertest'); // Supertest simulates HTTP requests against Express apps without starting a real network server
const express = require('express');   // Express framework to instantiate a mock test server instance
const sqlite3 = require('sqlite3');   // SQLite database driver
const { open } = require('sqlite');   // sqlite wrapper that provides async/await promise support

// 🎭 MOCK 1: otplib (TOTP Generation & Verification)
// Why: otplib uses modern ES modules (like @scure/base) which Jest cannot parse by default without Babel.
// Mocking it bypasses parsing issues and returns standard values (2FA code verification is forced to pass).
jest.mock('otplib', () => ({
    authenticator: {
        generateSecret: () => 'MOCK_SECRET_123',
        keyuri: () => 'otpauth://totp/mock',
        verify: () => true
    }
}));

// 🎭 MOCK 2: emailService (Email Transmission)
// Why: Prevents Jest from attempting to establish real SMTP connections to mail servers,
// and ensures no TCP connections (open handles) remain active to hang the test suite runner.
jest.mock('../server/services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));

// 🎭 MOCK 3: express-rate-limit (Brute-force Protection)
// Why: Production routes block users after multiple sequential requests (returning 429 Too Many Requests).
// We mock this as a simple passthrough middleware so test sweeps do not trigger rate limiting blocks.
jest.mock('express-rate-limit', () => {
    return {
        rateLimit: () => (req, res, next) => next()
    };
});

// 📥 Import the actual backend routers under test
const authRouter = require('../server/routes/auth');
const adminRouter = require('../server/routes/admin');
const transactionsRouter = require('../server/routes/transactions');

let db;
let app;

// =========================================================================
// 🗄️ DATABASE & SERVER LIFECYCLE HOOKS
// =========================================================================

// Runs once before any tests in this file execute
beforeAll(async () => {
    // 1. Open a clean, isolated in-memory SQLite database instance.
    // In-memory databases exist only in RAM and are automatically deleted when tests finish.
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // 2. Build the standard table schemas.
    // Must exactly match the production schemas in schema.sql to ensure columns are mapped correctly.
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
            is_card_frozen INTEGER NOT NULL DEFAULT 0 -- Added: 1 = card frozen, 0 = card active/unfrozen
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

        CREATE TABLE budgets (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(user_id, category)
        );
    `);

    // 3. Initialize Express and mount the routers under their production API prefix.
    app = express();
    app.use(express.json()); // Enable JSON parsing for request bodies
    app.use('/api', authRouter(db));
    app.use('/api/admin', adminRouter(db));
    app.use('/api/transactions', transactionsRouter(db));
});

// Runs once after all tests in this file finish executing
afterAll(async () => {
    await db.close(); // Close connection to prevent memory leaks
});

// =========================================================================
// 🏦 TEST SUITE A: POST /api/transactions/transfer (Secure Funds Transfers)
// =========================================================================
describe('POST /api/transactions/transfer Integration with 2FA & Audit Logs', () => {
    let senderToken;
    let adminToken;

    // Pre-test Seed hook: Setup accounts and tokens needed for transfer operations
    beforeAll(async () => {
        // A. Register and verify the funds receiver account
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'transferreceiver',
                email: 'recv@example.com',
                password: 'securepassword123'
            });
        await db.run("UPDATE users SET is_verified = 1 WHERE username = 'transferreceiver'");

        // B. Register and verify the funds sender account (seed with a balance of €500.0)
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'transfersender',
                email: 'send@example.com',
                password: 'securepassword123'
            });
        await db.run("UPDATE users SET is_verified = 1, balance = 500.0 WHERE username = 'transfersender'");

        // C. Register and verify an administrator account to view audit logs
        await request(app)
            .post('/api/users/register')
            .send({
                username: 'auditboss',
                email: 'boss@example.com',
                password: 'securepassword123'
            });
        await db.run("UPDATE users SET is_verified = 1, role = 'admin' WHERE username = 'auditboss'");

        // D. Authenticate the sender to fetch their JWT access token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'transfersender',
                password: 'securepassword123'
            });
        senderToken = loginRes.body.token;

        // E. Authenticate the administrator to fetch their JWT access token
        const adminLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'auditboss',
                password: 'securepassword123'
            });
        adminToken = adminLoginRes.body.token;
    });

    // 🧪 Test 1: Block transfer when Strong Customer Authentication (SCA) is missing.
    // Verifies that when a sender has 2FA enabled, the system enforces PSD2 regulations by 
    // blocking transactions that do not submit a 2FA verification token.
    test('should block transfer with 403 Forbidden if sender has 2FA enabled but code is missing', async () => {
        // A. Turn on 2FA directly in the test database for the transfersender user
        await db.run("UPDATE users SET two_factor_enabled = 1, two_factor_secret = 'MOCK_SECRET_123' WHERE username = 'transfersender'");

        // B. Send the POST transfer request WITHOUT providing the twoFactorCode parameter
        const response = await request(app)
            .post('/api/transactions/transfer')
            .set('Authorization', `Bearer ${senderToken}`)
            .send({
                receiverUsername: 'transferreceiver',
                amount: '100.0'
            });

        // C. Assertions: Should return 403 Forbidden and require the two-factor authentication code
        expect(response.status).toBe(403);
        expect(response.body.error).toContain('Two-factor authentication code is required');
    });

    // 🧪 Test 2: Successful transfer authorization & logging.
    // Verifies that supplying a valid 2FA verification code successfully updates bank balances, 
    // registers outgoing/incoming ledger entries, and writes all safety audits to the secure log table.
    test('should allow transfer and save TRANSFER_SIGNED, SENT, and RECEIVED logs when 2FA code is provided', async () => {
        // A. Post transfer WITH a valid mock code ('123456' is mocked to automatically return true by otplib mock)
        const response = await request(app)
            .post('/api/transactions/transfer')
            .set('Authorization', `Bearer ${senderToken}`)
            .send({
                receiverUsername: 'transferreceiver',
                amount: '100.0',
                twoFactorCode: '123456'
            });

        // B. Assertions: Balance transfer completes successfully with 200 OK
        expect(response.status).toBe(200);
        expect(response.body.message).toContain('completed successfully');

        // C. Audit Trail Verification: Retrieve system logs via admin endpoint to verify ledger safety writes
        const logsRes = await request(app)
            .get('/api/admin/audit-logs')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(logsRes.status).toBe(200);

        // D. Look through the logs array to verify that all 3 required audit lines exist:
        // - SIGNED (proof of customer authentication authorization)
        // - SENT (outgoing ledger confirmation)
        // - RECEIVED (incoming ledger confirmation)
        const signedLog = logsRes.body.find(log => log.action === 'TRANSFER_SIGNED');
        const sentLog = logsRes.body.find(log => log.action === 'TRANSFER_SENT');
        const recvLog = logsRes.body.find(log => log.action === 'TRANSFER_RECEIVED');

        expect(signedLog).toBeDefined();
        expect(sentLog).toBeDefined();
        expect(recvLog).toBeDefined();

        // E. Security Verification: Ensure logs are bound to the correct accounts
        expect(signedLog.username).toBe('transfersender');
        expect(sentLog.username).toBe('transfersender');
        expect(recvLog.username).toBe('transferreceiver');
    });
});

// =========================================================================
// 🔍 TEST SUITE: GET /api/transactions (Search & Filters Verification)
// =========================================================================
describe('GET /api/transactions Integration Search & Filters', () => {
    let userToken;

    beforeAll(async () => {
        // A. Register a brand-new user specifically for search isolation
        await request(app).post('/api/users/register').send({
            username: 'searchuser',
            email: 'searchuser@example.com',
            password: 'Password123'
        });

        // B. Manually mark the user as verified in the database so login succeeds
        await db.run("UPDATE users SET is_verified = 1 WHERE username = 'searchuser'");

        // C. Fetch the user's actual database ID (UUID) rather than using the 'searchuser' string
        const user = await db.get("SELECT id FROM users WHERE username = 'searchuser'");
        const searchUserId = user.id;

        // D. Authenticate the user to fetch their JWT access token
        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'searchuser',
            password: 'Password123'
        });
        userToken = loginRes.body.token;

        // E. Seed isolated test transactions belonging to this search user using their actual user UUID
        await db.run(
            `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id) 
             VALUES 
             ('tx-search-1', 'Mon', 'Billa Supermarket', 45.00, 'Food', 1, 'Complete', ?),
             ('tx-search-2', 'Tue', 'Salary Erste Bank', 3000.00, 'Salary', 0, 'Complete', ?),
             ('tx-search-3', 'Wed', 'Spar Markt', 12.50, 'Food', 1, 'Complete', ?)`,
            [searchUserId, searchUserId, searchUserId]
        );
    });

    // 🧪 Test 1: Fetch all transactions for this user.
    // Verifies that GET /api/transactions without query parameters returns all records belonging to the authenticated user.
    test('should fetch all transactions for the logged-in user', async () => {
        const response = await request(app)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(3); // Should return all 3 seeded items (Billa, Salary, Spar)
    });

    // 🧪 Test 2: Free text search on receiver name.
    // Verifies query param ?search=Billa returns only transactions where the receiver name contains 'Billa' (case-insensitive).
    test('should filter transactions by search term (Billa)', async () => {
        const response = await request(app)
            .get('/api/transactions?search=Billa')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].receiver).toBe('Billa Supermarket');
    });

    // 🧪 Test 3: Category filtering.
    // Verifies query param ?category=Food returns only transactions categorized exact match as 'Food'.
    test('should filter transactions by category (Food)', async () => {
        const response = await request(app)
            .get('/api/transactions?category=Food')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(2); // Spar Markt and Billa Supermarket
    });

    // 🧪 Test 4: Transaction type filtering.
    // Verifies query param ?type=income returns transactions where amount is positive (is_negative = 0).
    test('should filter transactions by type (income)', async () => {
        const response = await request(app)
            .get('/api/transactions?type=income')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].receiver).toBe('Salary Erste Bank');
    });

    // =========================================================================
    // 📊 TEST SUITE: Export Transactions (CSV & PDF) Verification
    // =========================================================================

    // 🧪 Test 5: Verify CSV Export endpoint returns correct headers and CSV text data
    test('should export transactions as CSV with correct headers and text data', async () => {
        const response = await request(app)
            .get('/api/transactions/export/csv')
            .set('Authorization', `Bearer ${userToken}`);

        // A. Assert success response status
        expect(response.status).toBe(200);

        // B. Assert correct download headers
        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.headers['content-disposition']).toContain('attachment; filename=vindobona_transactions.csv');

        // C. Assert that content matches CSV header structure and includes our test transactions
        expect(response.text).toContain('ID,Date,Receiver,Amount,Category,Type,Status');
        expect(response.text).toContain('Billa Supermarket');
        expect(response.text).toContain('Salary Erste Bank');
        expect(response.text).toContain('Spar Markt');
    });

    // 🧪 Test 6: Verify PDF Export endpoint returns binary PDF stream starting with %PDF signature
    test('should export transactions as PDF with correct content headers and PDF magic signature', async () => {
        const response = await request(app)
            .get('/api/transactions/export/pdf')
            .set('Authorization', `Bearer ${userToken}`)
            .responseType('blob'); // Tells Supertest to preserve the response as a binary buffer

        // A. Assert success response status
        expect(response.status).toBe(200);

        // B. Assert correct PDF download headers
        expect(response.headers['content-type']).toContain('application/pdf');
        expect(response.headers['content-disposition']).toContain('attachment; filename=vindobona_statement_searchuser.pdf');

        // C. Assert binary signature: PDF files must start with '%PDF' in their buffer
        const isPdf = response.body.toString('binary').startsWith('%PDF');
        expect(isPdf).toBe(true);
    });
});
