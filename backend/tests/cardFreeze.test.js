require('dotenv').config();

// 🛡️ Safe Defaults: Prevent config errors from throwing during tests
process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
process.env.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dummy-jwt-secret';

// 📥 Import testing and database libraries
const request = require('supertest'); // Simulates HTTP requests
const express = require('express'); // Express framework for the test server
const sqlite3 = require('sqlite3'); // SQLite database driver
const { open } = require('sqlite'); // Promise wrapper for SQLite

// 🎭 MOCK 1: otplib (Bypasses real TOTP validation issues under Jest)
jest.mock('otplib', () => ({
    authenticator: {
        generateSecret: () => 'MOCK_SECRET_123',
        keyuri: () => 'otpauth://totp/mock',
        verify: () => true
    }
}));

// 🎭 MOCK 2: emailService (Prevents actual emails from being dispatched)
jest.mock('../server/services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
}));

// 🎭 MOCK 3: express-rate-limit (Rate limiting passthrough for testing)
jest.mock('express-rate-limit', () => ({
    rateLimit: () => (req, res, next) => next()
}));

// 📥 Import routers under test
const authRouter = require('../server/routes/auth');
const transactionsRouter = require('../server/routes/transactions');

let db;  // Global reference to the in-memory SQLite database
let app; // Global reference to the Express application

// =========================================================================
// 🗄️ DATABASE & SERVER LIFECYCLE HOOKS
// =========================================================================

beforeAll(async () => {
    // 1. Open a clean, isolated in-memory SQLite database instance
    db = await open({
        filename: ':memory:', // Using ':memory:' ensures it runs completely in RAM
        driver: sqlite3.Database
    });

    // 2. Build the standard table schemas including is_card_frozen column
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

    // 3. Initialize Express and mount the routes
    app = express();
    app.use(express.json());
    app.use('/api', authRouter(db));
    app.use('/api/transactions', transactionsRouter(db));
});

afterAll(async () => {
    // Close the database connection when all tests finish to avoid memory leaks
    if (db) {
        await db.close();
    }
});

// =========================================================================
// ❄️ TEST SUITE: Card Freeze Operations
// =========================================================================
describe('Card freeze Integration Tests', () => {
    let userToken;     // JWT Token for User A (sender)
    let userId;        // Database ID for User A
    let otherUserId;   // Database ID for User B (receiver)

    // Seed test users A and B in the database
    beforeAll(async () => {
        // A. Register User A (sender)
        await request(app).post('/api/users/register').send({
            username: 'freezetester',
            email: 'freezetester@example.com',
            password: 'password123'
        });

        // Verify User A, set balance to 500.00, and ensure card is active (0)
        await db.run(
            "UPDATE users SET is_verified = 1, balance = 500.00, is_card_frozen = 0 WHERE username = 'freezetester'"
        );
        
        const senderRow = await db.get("SELECT id FROM users WHERE username = 'freezetester'");
        userId = senderRow.id;

        // Log in User A to retrieve the authentication token
        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'freezetester',
            password: 'password123'
        });
        userToken = loginRes.body.token;

        // B. Register User B (receiver)
        await request(app).post('/api/users/register').send({
            username: 'freezereceiver',
            email: 'freezereceiver@example.com',
            password: 'password123'
        });

        // Verify User B and set balance to 100.00
        await db.run(
            "UPDATE users SET is_verified = 1, balance = 100.00 WHERE username = 'freezereceiver'"
        );

        const receiverRow = await db.get("SELECT id FROM users WHERE username = 'freezereceiver'");
        otherUserId = receiverRow.id;
    });

    // Reset User A's card state to active/unfrozen before each individual test case
    beforeEach(async () => {
        await db.run("UPDATE users SET is_card_frozen = 0 WHERE id = ?", [userId]);
        // Also clear any previous transactions to keep tests clean
        await db.run("DELETE FROM transactions");
    });

    // 🧪 Test Case 1: Toggle Freeze & Unfreeze
    test('POST /api/users/freeze should toggle card freeze status and log audits', async () => {
        // 1. Send request to freeze the card
        const freezeRes = await request(app)
            .post('/api/users/freeze')
            .set('Authorization', `Bearer ${userToken}`)
            .send();

        expect(freezeRes.status).toBe(200);
        expect(freezeRes.body.isCardFrozen).toBe(true);
        expect(freezeRes.body.message).toContain('frozen successfully');

        // Verify DB updates to 1 (frozen)
        let dbUser = await db.get("SELECT is_card_frozen FROM users WHERE id = ?", [userId]);
        expect(dbUser.is_card_frozen).toBe(1);

        // Verify security audit log for CARD_FROZEN is written
        let auditLog = await db.get(
            "SELECT action, details FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1",
            [userId]
        );
        expect(auditLog.action).toBe('CARD_FROZEN');

        // 2. Send request to unfreeze the card
        const unfreezeRes = await request(app)
            .post('/api/users/freeze')
            .set('Authorization', `Bearer ${userToken}`)
            .send();

        expect(unfreezeRes.status).toBe(200);
        expect(unfreezeRes.body.isCardFrozen).toBe(false);
        expect(unfreezeRes.body.message).toContain('unfrozen successfully');

        // Verify DB updates back to 0 (unfrozen)
        dbUser = await db.get("SELECT is_card_frozen FROM users WHERE id = ?", [userId]);
        expect(dbUser.is_card_frozen).toBe(0);

        // Verify security audit log for CARD_UNFROZEN is written
        auditLog = await db.get(
            "SELECT action FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1",
            [userId]
        );
        expect(auditLog.action).toBe('CARD_UNFROZEN');
    });

    // 🧪 Test Case 2: Block standard payments when card is frozen
    test('POST /api/transactions should block payments if card is frozen', async () => {
        // Manually freeze card in the database
        await db.run("UPDATE users SET is_card_frozen = 1 WHERE id = ?", [userId]);

        // Attempt to create a standard payment
        const txRes = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                receiver: 'Billa Supermarket',
                amount: '-50.00',
                category: 'Food'
            });

        expect(txRes.status).toBe(403);
        expect(txRes.body.error).toContain('card is frozen');

        // Verify no transaction record was added
        const countRow = await db.get("SELECT count(*) as count FROM transactions WHERE user_id = ?", [userId]);
        expect(countRow.count).toBe(0);
    });

    // 🧪 Test Case 3: Allow standard payments when card is active
    test('POST /api/transactions should allow payments if card is active', async () => {
        const txRes = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                receiver: 'Billa Supermarket',
                amount: '-50.00',
                category: 'Food'
            });

        expect(txRes.status).toBe(201);
        expect(txRes.body.receiver).toBe('Billa Supermarket');

        // Verify the transaction record was saved successfully in the database
        const savedTx = await db.get("SELECT amount FROM transactions WHERE user_id = ? LIMIT 1", [userId]);
        expect(savedTx.amount).toBe(-50.00);
    });

    // 🧪 Test Case 4: Block transfers when card is frozen
    test('POST /api/transactions/transfer should block transfer if card is frozen', async () => {
        // Manually freeze card in the database
        await db.run("UPDATE users SET is_card_frozen = 1 WHERE id = ?", [userId]);

        // Attempt a balance transfer
        const transferRes = await request(app)
            .post('/api/transactions/transfer')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                receiverUsername: 'freezereceiver',
                amount: '30.00'
            });

        expect(transferRes.status).toBe(403);
        expect(transferRes.body.error).toContain('card is frozen');

        // Verify balances remain untouched
        const sender = await db.get("SELECT balance FROM users WHERE id = ?", [userId]);
        const receiver = await db.get("SELECT balance FROM users WHERE id = ?", [otherUserId]);
        expect(sender.balance).toBe(500.00);
        expect(receiver.balance).toBe(100.00);
    });

    // 🧪 Test Case 5: Allow transfers when card is active
    test('POST /api/transactions/transfer should allow transfer if card is active', async () => {
        const transferRes = await request(app)
            .post('/api/transactions/transfer')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                receiverUsername: 'freezereceiver',
                amount: '30.00'
            });

        expect(transferRes.status).toBe(200);

        // Fetch balances to ensure transaction updates completed successfully
        const sender = await db.get("SELECT balance FROM users WHERE id = ?", [userId]);
        const receiver = await db.get("SELECT balance FROM users WHERE id = ?", [otherUserId]);
        
        expect(sender.balance).toBe(470.00); // 500 - 30
        expect(receiver.balance).toBe(130.00); // 100 + 30
    });
});
