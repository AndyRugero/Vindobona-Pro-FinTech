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
const budgetsRouter = require('../server/routes/budgets');
const transactionsRouter = require('../server/routes/transactions');

let db;
let app;

// Setup hook: Runs once before any tests start
beforeAll(async () => {
    // A. Open clean, isolated in-memory SQLite database
    db = await open({
        filename: ':memory:',
        driver: sqlite3.Database
    });

    // B. Build the users, budgets, and transactions tables (needed for budget checks)
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

        CREATE TABLE budgets (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(user_id, category)
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

    // C. Initialize Express and mount routes
    app = express();
    app.use(express.json());
    app.use('/api', authRouter(db));
    app.use('/api/budgets', budgetsRouter(db));
    app.use('/api/transactions', transactionsRouter(db));
});

// Teardown hook: Close database after tests
afterAll(async () => {
    await db.close();
});

// =========================================================================
// 📊 TEST SUITE: /api/budgets & Warnings (Category Spending Verification)
// =========================================================================
describe('Category Budgets & Alerts Integration', () => {
    let userToken;

    // Pre-test Seed hook: Setup verified account with balance
    beforeAll(async () => {
        await request(app).post('/api/users/register').send({
            username: 'budgetuser',
            email: 'budgetuser@example.com',
            password: 'password123'
        });
        await db.run("UPDATE users SET is_verified = 1, balance = 1000.0 WHERE username = 'budgetuser'");

        const loginRes = await request(app).post('/api/auth/login').send({
            username: 'budgetuser',
            password: 'password123'
        });
        userToken = loginRes.body.token;
    });

    // 🧪 Test Case 1: Route Protection / Authentication Guard
    // Verifies that a client cannot post a budget limit without logging in first.
    test('should reject requests without a JWT token with 401 Unauthorized', async () => {
        const response = await request(app)
            .post('/api/budgets')
            .send({ category: 'Food', amount: 200.00 });
        expect(response.status).toBe(401);
    });

    // 🧪 Test Case 2: Setting Category Caps
    // Verifies that posting category limits successfully creates a budget mapping record in the DB.
    test('should set a new category budget cap limit', async () => {
        const response = await request(app)
            .post('/api/budgets')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ category: 'Food', amount: '100.00' });

        expect(response.status).toBe(201);
        expect(response.body.message).toContain('set to €100');
    });

    // 🧪 Test Case 3: Summary Sheet aggregates
    // Verifies that fetching active budgets calculates current category progress (spent vs remaining).
    test('should fetch active budget metrics showing progress aggregates', async () => {
        const response = await request(app)
            .get('/api/budgets')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].category).toBe('Food');
        expect(response.body[0].limit).toBe(100.00);
        expect(response.body[0].spent).toBe(0); // No transactions yet
    });

    // 🧪 Test Case 4: Real-time warnings when exceeding budget limits
    // Verifies that transaction records sum up monthly expenditure in real-time,
    // appending a warning object to the receipt payload once the budget limit is breached.
    test('should return budget exceeded warning when spending goes over the cap limit', async () => {
        // A. Spend €40 of the €100 budget (Total spent: €40 <= €100 cap - no warning expected)
        await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ receiver: 'Billa Wien', amount: '-40.0', category: 'Food' });

        // B. Spend €70 more (Total spent: €110 > €100 cap - warning expected!)
        const response = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${userToken}`)
            .send({ receiver: 'Spar Wien', amount: '-70.0', category: 'Food' });

        // C. Assertions: Transaction is created, but includes the over-budget warning payload
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('budgetWarning');
        expect(response.body.budgetWarning.exceeded).toBe(true);
        expect(response.body.budgetWarning.spent).toBe(110.00);
        expect(response.body.budgetWarning.limit).toBe(100.00);
    });
});
