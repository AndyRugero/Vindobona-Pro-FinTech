// 📥 1. IMPORT NECESSARY MODULES
require('dotenv').config(); // 📥 Load environment variables from the .env file!
const express = require('express'); // 📥 Core framework for building our backend API routes
const cors = require('cors'); // 📥 Allows our React frontend to talk to this backend
const path = require('path'); // 📥 Builds safe file paths compatible with Windows and Mac
const sqlite3 = require('sqlite3'); // 📥 Core SQLite3 database driver
const { open } = require('sqlite'); // 📥 Promise wrapper to allow using async/await with SQLite

//  2. SERVER CONFIGURATION
const app = express(); // 🏗️ Create an instance of the Express application
const PORT = 5001; // 🔌 The door number (port) our server will listen on
let db; // 🗄️ A global variable to store our active database connection once opened

// 🏗️ 3. DATABASE INITIALIZATION
// This function runs when the server boots to connect to the database and setup tables
const initializeDatabase = async () => {
    // Open the sqlite database file (creates database.db in backend folder if it doesn't exist)
    db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database // Use the correct SQLite3 database driver property
    });

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
            verification_code TEXT -- 🔑 Email verification code
        );
    `);
    console.log('Database connected and tables initialized successfully! 🎉');
};

// ⚙️ 4. GLOBAL MIDDLEWARES
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Allow reading JSON body data in POST requests

// 🚀 5. START DATABASE & BIND ROUTERS
// Connect to the database first, then mount routes and start listening for requests
initializeDatabase()
    .then(() => {
        // Mount Auth Router under /api (handles /api/users/register and /api/auth/login)
        const authRouter = require('./routes/auth')(db);
        app.use('/api', authRouter);

        // Mount Transactions Router under /api/transactions
        const transactionsRouter = require('./routes/transactions')(db);
        app.use('/api/transactions', transactionsRouter);

        // Start listening
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT} 🚀`);
        });
    })
    .catch((error) => {
        console.error('Failed to start the server due to database error:', error);
    });