const crypto = require('crypto');

/**
 * Saves a security event to the audit_logs database table.
 * 
 * @param {object} db - The active SQLite database connection.
 * @param {string|null} userId - The unique identifier of the user (null for anonymous/failed login attempts).
 * @param {string} action - The label representing the event (e.g., 'LOGIN_SUCCESS', 'TRANSFER_FUNDS').
 * @param {string} details - Human-readable explanation containing specifics of what happened.
 * @param {string|null} ipAddress - The client's IP address where the request originated.
 */
const logAuditEntry = async (db, userId, action, details, ipAddress) => {
    try {
        // 🆔 1. Generate a cryptographically secure, unique ID for this log record
        const logId = crypto.randomUUID();
        
        // ⏰ 2. Generate the current UTC timestamp in ISO 8601 format
        const timestamp = new Date().toISOString();

        // 💾 3. Write the log record to our database table
        await db.run(
            `INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [logId, userId, action, details, ipAddress, timestamp]
        );

        console.log(`[Audit Log Saved] Action: ${action} | User: ${userId || 'Guest'}`);
    } catch (error) {
        // ⚠️ Print logging failures to the server console so admins know, but don't crash the server/request!
        console.error('⚠️ Failed to save audit log entry to database:', error);
    }
};

module.exports = { logAuditEntry };