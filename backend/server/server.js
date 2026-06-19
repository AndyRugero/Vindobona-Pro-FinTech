// 📥 1. IMPORT NECESSARY MODULES
require('dotenv').config({ override: true }); // Load environment variables from the .env file!
const express = require('express'); // Core framework for building our backend API routes
const cors = require('cors'); // Allows our React frontend to talk to this backend
const path = require('path'); // Builds safe file paths compatible with Windows and Mac
const db = require('./utils/db');
const { rateLimit } = require('express-rate-limit');

// 2. SERVER CONFIGURATION
const app = express(); // Create an instance of the Express application
const PORT = 5001; // The door number (port) our server will listen on
// let db; // A global variable to store our active database connection once opened

// 🏗️ 3. DATABASE INITIALIZATION
// This function runs when the server boots to connect to the database and setup tables
const initializeDatabase = async () => {
    await db.connect();
    // Create the transactions and users tables if they don't exist (DDL queries)
    await db.exec(`
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY, -- Unique string identifier for each transaction
            date TEXT NOT NULL, -- Date string showing when the transaction occurred
            receiver TEXT NOT NULL, -- Who received or sent the money
            amount REAL NOT NULL, -- The transaction amount (decimal number)
            category TEXT DEFAULT 'General', -- Category of expense
            is_negative INTEGER NOT NULL, -- SQLite has no Boolean; 1 = negative, 0 = positive
            status TEXT DEFAULT 'Complete', -- Current status of the transaction
            user_id TEXT -- Link to the user who created it
        );
        
        -- Users table for authentication
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY, -- Unique ID for each user
            username TEXT UNIQUE NOT NULL, -- Unique username (no duplicates allowed)
            email TEXT UNIQUE, -- 🔑 User email address
            password_hash TEXT NOT NULL, -- Secure, hashed password
            google_id TEXT UNIQUE, -- 🔑 Google OAuth ID (can be null for local accounts)
            is_verified INTEGER NOT NULL DEFAULT 0, -- 🔑 Verified status
            verification_code TEXT ,-- 🔑 Email verification code
            reset_token TEXT ,-- 🔑 Temporary reset token for forgotenPass
            reset_token_expiry INTEGER,-- 🔑 Expiry time for the reset token
            two_factor_secret TEXT, -- 🔑 2FA secret key
            two_factor_enabled INTEGER NOT NULL DEFAULT 0, -- 1 =2FA enabled, 0 = disabled
            balance REAL NOT NULL DEFAULT 0.0, -- 🏦 Set default balance of $0 for new users
            role TEXT NOT NULL DEFAULT 'user', -- 🛡️ Set default role to 'user' for new accounts
            is_card_frozen INTEGER NOT NULL DEFAULT 0 -- 🛡️ 1 = card frozen, 0 = card active/unfrozen
        );

        -- audit_logs table
        CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY, -- UNIQUE LOG ENTRY ID
            user_id TEXT,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            timestamp TEXT NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );

        -- 📊 budgets table for monthly spending caps (Lesson 53d)
        CREATE TABLE IF NOT EXISTS budgets (
            id TEXT PRIMARY KEY,                       -- Unique identifier for each budget setting
            user_id TEXT,                              -- Links the budget to a specific user ID
            category TEXT NOT NULL,                    -- The category name (e.g. 'Food', 'Travel')
            amount REAL NOT NULL,                      -- The maximum monthly spending limit (REAL means decimal)
            FOREIGN KEY(user_id) REFERENCES users(id), -- Connects user_id to the users table
            UNIQUE(user_id, category)                  -- Prevents duplicate budgets for the same category
        );

        -- 💱 Wallets table creation holding the dynamic currency world-wide (e.g. USD, EUR, etc.)
        CREATE TABLE IF NOT EXISTS wallets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            currency TEXT NOT NULL,
            balance REAL NOT NULL DEFAULT 0.0,
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(user_id, currency)
        );
    `);

    // 🏦 Safe Schema Migration: Add balance column to existing users table if it doesn't exist
    try {
        await db.run('ALTER TABLE users ADD COLUMN balance REAL NOT NULL DEFAULT 0.0');
        console.log('Database Schema Migration: Added balance column to users table! 🏦');
    } catch (error) {
        // If it already exists, SQLite will throw an error. We catch it and ignore it safely!
    }

    // Safe Migration : add role column existing users table if it doesnt exist
    try {
        await db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
        console.log("Database schema Migration: Added role column to users table!");
    } catch (error) {
        // If it already exists, ignore it
    }

    // SAFE MIGRATION : is_card_frozen
    try {
        await db.run("ALTER TABLE users ADD COLUMN is_card_frozen INTEGER NOT NULL DEFAULT 0");
        console.log("Database schema Migration: Added is_card_frozen column to users table!");
    } catch (error) {
        // If column already exists, ignore error
    }

    // SAFE MIGRATION: Initialize primary EUR wallets for existing users
    // Importance: Transfers existing user balances into the modular wallets system.
    try {
        const users = await db.all("SELECT id, balance FROM users");
        for (const user of users) {
            // Check if this user already has a EUR wallet setup
            const existingWallet = await db.get(
                "SELECT id FROM wallets WHERE user_id = ? AND currency = 'EUR'",
                [user.id]
            );

            // If they don't have a EUR wallet yet, create one using their existing balance
            if (!existingWallet) {
                await db.run(
                    "INSERT INTO wallets (id, user_id, currency, balance) VALUES (?, ?, 'EUR', ?)",
                    [Date.now().toString() + Math.random().toString(), user.id, user.balance]
                );
                console.log(`Generated primary EUR wallet for user ID: ${user.id}`);
            }
        }
    } catch (error) {
        console.error("❌ Failed to migrate user wallets:", error);
    }


    console.log('Database connected and tables initialized successfully!');
};

// ⚙️ 4. GLOBAL MIDDLEWARES
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow reading JSON body data in POST requests

// Global Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', globalLimiter);

// 🚀 5. START DATABASE & BIND ROUTERS
// Connect to the database first, then mount routes and start listening for requests
initializeDatabase()
    .then(() => {
        // 🚀 HEALTH CHECK ENDPOINT (Added for Kubernetes Lesson 57)
        // Kubernetes will periodically call this endpoint to check if our backend is up and running.
        // If this returns HTTP 200, Kubernetes knows our server is healthy.
        app.get('/api/health', (req, res) => { 
            res.status(200).json({ status: 'UP', timestamp: new Date() }); 
        });
        // Mount Auth Router under /api (handles /api/users/register and /api/auth/login)
        const authRouter = require('./routes/auth')(db);
        app.use('/api', authRouter);

        // Mount Admin Router under /api/admin
        const adminRouter = require('./routes/admin')(db);
        app.use('/api/admin', adminRouter);

        // Mount Transactions Router under /api/transactions
        const transactionsRouter = require('./routes/transactions')(db);
        app.use('/api/transactions', transactionsRouter);

        // Mount Chat Router under /api/chat (Lesson 53b)
        const chatRouter = require('./routes/chat')(db);
        app.use('/api/chat', chatRouter);

        // Mount Locations Router under /api/locations (Lesson 53c)
        const locationsRouter = require('./routes/locations')(db);
        app.use('/api/locations', locationsRouter);

        // Mount Budgets Router under /api/budgets (Lesson 53d)
        const budgetsRouter = require('./routes/budgets')(db);
        app.use('/api/budgets', budgetsRouter);

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT} 🚀`);
        });
    })
    .catch((error) => {
        console.error('Failed to start the server due to database error:', error);
    });