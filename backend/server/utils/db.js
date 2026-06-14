// backend/server/utils/db.js

// 📥 1. IMPORT NODE MODULES AND DRIVERS
const path = require('path'); // Core Node.js module used to handle file paths reliably on Windows/Mac/Linux
const sqlite3 = require('sqlite3'); // Core driver for reading/writing SQLite flat files
const { open } = require('sqlite'); // Promise-based wrapper for SQLite, letting us use async/await
const { Pool } = require('pg'); // PostgreSQL client connection pool to manage multiple queries concurrently

// 🗄️ 2. DATABASE CONFIGURATION STATE
let sqliteDb = null; // Stored reference to the open SQLite connection (file-based)
let pgPool = null;   // Stored reference to the active PostgreSQL connection pool (server-based)
const dbType = process.env.DB_TYPE || 'sqlite'; // Detect engine type. Default to 'sqlite' if no env variable is set

/**
 * 🔄 SQL QUERY DIALECT TRANSLATOR
 * 
 * Why: 
 *   - SQLite parameters use "?" -> e.g., "WHERE id = ?"
 *   - PostgreSQL parameters use numbered identifiers "$1, $2" -> e.g., "WHERE id = $1"
 * 
 * How:
 *   If the active database is PostgreSQL, we use a regular expression (.replace) to look 
 *   for every "?" symbol and replace it with "$1", then "$2", then "$3" dynamically, 
 *   incrementing our index counter by 1 each time.
 */
function translateQuery(query) {
    if (dbType !== 'postgres') {
        // If we are in SQLite mode, return the query exactly as it is (no translation needed)
        return query; 
    }
    let index = 1;
    // Replace each '?' with '$' + current index, then increment index
    return query.replace(/\?/g, () => `$${index++}`);
}

const dbWrapper = {
    // 🔌 Connect to the database
    async connect(config = {}) {
        if (dbType === 'postgres') {
            console.log('🔌 Connecting to PostgreSQL Database...');
            
            // Create a PostgreSQL Pool. Pools hold a collection of reusable connections to avoid 
            // the overhead of opening and closing connections for every single query.
            pgPool = new Pool({
                connectionString: process.env.DATABASE_URL, // e.g., postgresql://username:password@host/db
                // In production (like on Azure), we force SSL encryption to protect banking data over the web
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false
            });
            return this;
        } else {
            console.log('🔌 Connecting to SQLite Database...');
            
            // Open the file-based SQLite database.
            sqliteDb = await open({
                // Locate the SQLite file. We use path.join and __dirname (the directory of this file) 
                // to build an absolute path to "../database.db", making it robust against terminal startup location.
                filename: config.filename || path.join(__dirname, '..', 'database.db'),
                driver: sqlite3.Database // The core engine driver SQLite needs
            });
            return this;
        }
    },

    // 🔍 GET: Fetch a single row
    async get(query, ...params) {
        const sql = translateQuery(query); // Translate "?" to "$1" if in Postgres mode
        const flatParams = params.flat(); // In case arguments are passed inside a nested array, flatten them

        if (dbType === 'postgres') {
            // Run the translated query with PostgreSQL
            const res = await pgPool.query(sql, flatParams);
            // pgPool returns an array of rows on the .rows property. 
            // SQLite's db.get returns the row object directly or undefined. 
            // So we return the first element (res.rows[0]) to match SQLite's behavior.
            return res.rows[0]; 
        } else {
            // Pass directly to SQLite
            return sqliteDb.get(sql, flatParams);
        }
    },

    // 📋 ALL: Fetch multiple rows
    async all(query, ...params) {
        const sql = translateQuery(query);
        const flatParams = params.flat();

        if (dbType === 'postgres') {
            const res = await pgPool.query(sql, flatParams);
            // Return the entire array of matched rows
            return res.rows;
        } else {
            return sqliteDb.all(sql, flatParams);
        }
    },

    // ✍️ RUN: Execute INSERT, UPDATE, or DELETE
    async run(query, ...params) {
        const sql = translateQuery(query);
        const flatParams = params.flat();

        if (dbType === 'postgres') {
            const res = await pgPool.query(sql, flatParams);
            // SQLite's db.run returns an object with details about changes. 
            // We mock this object structure using PostgreSQL's rowCount so route files don't break.
            return {
                changes: res.rowCount, // Number of rows inserted, updated, or deleted
                lastID: null // PostgreSQL uses database sequences (e.g. SERIAL), so lastID is handled differently
            };
        } else {
            return sqliteDb.run(sql, flatParams);
        }
    },

    // ⚙️ EXEC: Run a block of raw SQL commands (like schema setups)
    async exec(query) {
        if (dbType === 'postgres') {
            // Send the raw SQL script directly to PostgreSQL
            await pgPool.query(query);
        } else {
            // Send the raw SQL script directly to SQLite
            return sqliteDb.exec(query);
        }
    }
};

module.exports = dbWrapper;
