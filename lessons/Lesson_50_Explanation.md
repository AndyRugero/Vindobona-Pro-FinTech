# Lesson 50 Explanation: Automated Testing (Unit & Integration) 🧪🚦🛡️

Welcome to the comprehensive guide for Lesson 50! In this lesson, we transitioned our application from manual testing (where you click buttons in React or send POST requests using thunderclient/postman) to **Automated Testing**. 

Automated testing is the absolute standard in professional full-stack development and enterprise banking. If you want to work at institutions like **Erste Group** or **Raiffeisen Bank International (RBI)**, you must prove that you can write clean, automated test suites that safeguard database values and router parameters.

---

## 📍 1. Real-World Analogies for Testing

To understand the difference between **Unit Testing** and **Integration Testing**, we use these two models:

### 🔋 The Multimeter vs. The Dashboard Analogy (Unit vs. Integration)
Imagine you are building a new sports car:
*   **Unit Testing (The Multimeter) ⚡:** 
    *   Before you install the car's headlights, you put the bulb on a workbench, hook it up to a standalone battery, and use a multimeter to check the voltage and current. You are testing **one single component (the bulb)** in complete isolation. If the bulb shines, the unit test passes.
    *   *In Code:* Testing helper functions in [authHelpers.js](file:///c:/Vindobona-Pro-FinTech/backend/server/utils/authHelpers.js) (e.g., verifying if a regex correctly validates emails) without running the Express server or connecting to the SQLite database.
*   **Integration Testing (The Car Dashboard) 🚘:**
    *   You wire the bulb into the car's electrical harness, connect it to the steering column switch, start the alternator, and click the high-beam lever. You are testing how **multiple components work together** (switch + wiring + battery + bulb + dashboard indicators). 
    *   *In Code:* Testing if sending an HTTP registration request actually routes to [auth.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.js), checks email syntax helpers, writes a new user row in SQLite, and fires a mock activation email.

---

## 📍 2. Core Testing Tools Explained

We installed two industry-standard tools inside our `backend/package.json` file:

1.  **Jest 🃏 (The Runner & Inspector):**
    *   Jest is a JavaScript testing framework developed by Meta (Facebook). It is responsible for scanning our project files, executing test blocks, providing mock utilities (`jest.fn()`), and asserting that outputs match expectations.
    *   **Syntax Structure:**
        *   `describe('Group Name', () => { ... })`: Groups related test cases together for easy reading.
        *   `test('should do X', () => { ... })` or `it('should do X')`: Defines an individual test case.
        *   `expect(value).toBe(expected)`: The assertion check. If it fails, Jest stops and marks the test red.
2.  **Supertest 🦸‍♂️ (The HTTP Mocking Agent):**
    *   In integration testing, we don't want to boot a real HTTP listener on port `5001` (which might conflict with another running app or throw firewall warnings).
    *   Supertest lets us pass our Express `app` block directly in-memory. It simulates incoming HTTP requests (`GET`, `POST`, `DELETE`), sends JSON payloads, and returns responses exactly as if they had travelled across the internet.

---

## 📍 3. Key CommonJS vs. ESM & Jest Issues Resolved

During implementation, we encountered three major environment bottlenecks that commonly crash Jest suites in Node/Express setups:

### A. The ESM "export" Syntax Crash
*   **The Issue:** The 2FA library `otplib` uses `@scure/base` under the hood, which is published using modern ES Modules (`export const utils...`). Because Jest runs in CommonJS mode (`require`) in our project, it throws a `SyntaxError: Unexpected token 'export'` on startup.
*   **The Solution:** We mocked `otplib` at the very top of [auth.test.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.test.js) using:
    ```javascript
    jest.mock('otplib', () => ({
        authenticator: {
            generateSecret: () => 'MOCK_SECRET_123',
            keyuri: () => 'otpauth://totp/mock',
            verify: () => true
        }
    }));
    ```
    This intercepts Node's import call and returns a fake JavaScript object, preventing Node from ever loading the real, broken `node_modules` package.

### B. The Google OAuth `clientID` Crash
*   **The Issue:** Our authentication router configures Google OAuth. Google's strategy requires a valid Client ID during instantiation, failing with `TypeError: OAuth2Strategy requires a clientID option` if the environment variable is missing.
*   **The Solution:** We added `require('dotenv').config()` at the very top of [auth.test.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.test.js) to load variables, and configured safe fallback keys so tests run cleanly even if no `.env` file exists:
    ```javascript
    process.env.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
    ```

### C. Nodemailer Open Handles and Logging Warning
*   **The Issue:** When testing registration, the router calls `sendEmail()` in the background (un-awaited). After Jest finished validating the HTTP response, Nodemailer's connection pool remained open, causing Jest to log warnings: `Jest did not exit one second after the test run has completed.`
*   **The Solution:** We mocked the email service:
    ```javascript
    jest.mock('../services/emailService', () => ({
        sendEmail: jest.fn().mockResolvedValue({ messageId: 'mock-email-id' })
    }));
    ```
    This completely stops real SMTP network requests during tests, speeds up runs to under 1.5 seconds, and lets Jest exit cleanly.

---

## 📍 4. Complete Code Breakdown

### 📂 Unit Testing File: [authHelpers.test.js](file:///c:/Vindobona-Pro-FinTech/backend/server/utils/authHelpers.test.js)
```javascript
// 📥 Import helper functions we want to test from the sibling file
const { validateEmail, validatePassword, validateUsername } = require('./authHelpers');

// 📂 Group 1: Email validation tests
describe('Email Validation Helper', () => {
    test('Should return true for a valid email', () => {
        expect(validateEmail('andy@example.com')).toBe(true);
    });

    test('should return false for invalid email if "@" or "." is missing', () => {
        expect(validateEmail('andyexample.com')).toBe(false); // Missing '@'
        expect(validateEmail('andy@examplecom')).toBe(false); // Missing '.'
    });
});

// 📂 Group 2: Password validation tests
describe('Password Validation Helper', () => {
    test('should return true for passwords with 6 or more characters', () => {
        expect(validatePassword('123456')).toBe(true);
    });

    test('should return false if password is less than 6 characters', () => {
        expect(validatePassword('12345')).toBe(false);
    });
});

// 📂 Group 3: Username validation tests
describe('Username Validation Helper', () => {
    test('should return true for a valid username', () => {
        expect(validateUsername('andy')).toBe(true);
    });

    test('should return false if username has spaces or is under 3 characters', () => {
        expect(validateUsername('an')).toBe(false); // Too short
        expect(validateUsername('andy rugero')).toBe(false); // Contains spaces
    });
});
```

### 📂 Integration Testing File: [auth.test.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.test.js)
```javascript
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
                email: 'invalid-email', // Missing '@' and '.'
                password: 'securepassword123'
            });

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

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Username is already taken');
    });
});
```

---

## 🚦 5. Command Runner Checklist
When verifying automated testing locally on Windows:
1.  Make sure you save **[package.json](file:///c:/Vindobona-Pro-FinTech/backend/package.json)** configuration to point to `"test": "jest --runInBand"`.
2.  Open PowerShell inside the `backend` folder and run `npm.cmd test` to bypass PowerShell's Execution Policies regarding `.ps1` script blocks.
