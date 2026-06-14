// backend/server/utils/migrationToPg.js

const path = require('path');
// Load environment variables from backend/.env relative to this script
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');

// 🔌 1. CONFIGURATION
// Absolute path to the local SQLite database file
const sqlitePath = path.join(__dirname, '..', 'database.db');
// PostgreSQL connection string read from environment variables
const pgConnectionString = process.env.DATABASE_URL;

if (!pgConnectionString) {
    console.error(' Error: DATABASE_URL environment variable is missing!');
    process.exit(1);
}

async function startMigration() {
    console.log(' Starting SQLite to PostgreSQL Migration...');

    // 🔌 2. CONNECT TO BOTH DATABASES
    const sqliteDb = await open({
        filename: sqlitePath,
        driver: sqlite3.Database
    });

    const pgPool = new Pool({
        connectionString: pgConnectionString
    });

    try {
        // 🔄 3. MIGRATE USERS TABLE
        console.log('👤 Migrating users...');
        const users = await sqliteDb.all('SELECT * FROM users');

        for (const user of users) {
            const query = `
                INSERT INTO users (
                    id, username, email, password_hash, google_id, 
                    is_verified, verification_code, reset_token, 
                    reset_token_expiry, two_factor_secret, 
                    two_factor_enabled, balance, role, is_card_frozen
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
                ) ON CONFLICT (id) DO NOTHING;
            `;

            // Map SQLite 0/1 integers to Boolean values (true/false) for PostgreSQL compatibility
            // Pass integers (0 or 1) directly, since PostgreSQL expects INTEGER types
            const values = [
                user.id,
                user.username,
                user.email,
                user.password_hash,
                user.google_id,
                user.is_verified,
                user.verification_code,
                user.reset_token,
                user.reset_token_expiry,
                user.two_factor_secret,
                user.two_factor_enabled,
                user.balance,
                user.role,
                user.is_card_frozen
            ];

            await pgPool.query(query, values);
        }
        console.log(`✅ Successfully migrated ${users.length} users!`);

        // 🔄 4. MIGRATE TRANSACTIONS TABLE
        console.log('💸 Migrating transactions...');
        const transactions = await sqliteDb.all('SELECT * FROM transactions');

        for (const tx of transactions) {
            const query = `
                INSERT INTO transactions (
                    id, date, receiver, amount, category, is_negative, status, user_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8
                ) ON CONFLICT (id) DO NOTHING;
            `;

            // Pass the raw 0 or 1 integer directly
            const values = [
                tx.id,
                tx.date,
                tx.receiver,
                tx.amount,
                tx.category,
                tx.is_negative,
                tx.status,
                tx.user_id
            ];

            await pgPool.query(query, values);
        }
        console.log(`✅ Successfully migrated ${transactions.length} transactions!`);

        // 🔄 5. MIGRATE WALLETS TABLE
        console.log('💱 Migrating wallets...');
        const wallets = await sqliteDb.all('SELECT * FROM wallets');

        for (const wallet of wallets) {
            const query = `
                INSERT INTO wallets (
                    id, user_id, currency, balance
                ) VALUES (
                    $1, $2, $3, $4
                ) ON CONFLICT (user_id, currency) DO NOTHING;
            `;

            const values = [
                wallet.id,
                wallet.user_id,
                wallet.currency,
                wallet.balance
            ];

            await pgPool.query(query, values);
        }
        console.log(`✅ Successfully migrated ${wallets.length} wallets!`);

        // 🔄 6. MIGRATE BUDGETS TABLE
        console.log('📊 Migrating budgets...');
        const budgets = await sqliteDb.all('SELECT * FROM budgets');

        for (const budget of budgets) {
            const query = `
                INSERT INTO budgets (
                    id, user_id, category, amount
                ) VALUES (
                    $1, $2, $3, $4
                ) ON CONFLICT (user_id, category) DO NOTHING;
            `;

            const values = [
                budget.id,
                budget.user_id,
                budget.category,
                budget.amount
            ];

            await pgPool.query(query, values);
        }
        console.log(` Successfully migrated ${budgets.length} budgets!`);

        // 🔄 7. MIGRATE AUDIT LOGS TABLE
        console.log('📜 Migrating audit logs...');
        const logs = await sqliteDb.all('SELECT * FROM audit_logs');

        for (const log of logs) {
            const query = `
                INSERT INTO audit_logs (
                    id, user_id, action, details, ip_address, timestamp
                ) VALUES (
                    $1, $2, $3, $4, $5, $6
                ) ON CONFLICT (id) DO NOTHING;
            `;

            const values = [
                log.id,
                log.user_id,
                log.action,
                log.details,
                log.ip_address,
                log.timestamp
            ];

            await pgPool.query(query, values);
        }
        console.log(`✅ Successfully migrated ${logs.length} audit logs!`);
        console.log('🎉 All tables migrated successfully!');

    } catch (err) {
        console.error('❌ Migration failed with error:', err);
    } finally {
        // Close database connection pools safely
        await sqliteDb.close();
        await pgPool.end();
    }
}

// Execute the migration function
startMigration();