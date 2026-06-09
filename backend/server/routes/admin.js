const express = require('express');
const router = express.Router(); // Capital R
const authenticateToken = require('../middleware/authGuard'); // Checkpoint 1
const requireRole = require('../middleware/roleGuard'); // Checkpoint 2

module.exports = (db) => {
    // GET: fetch all users (admin only)
    // Path: GET http://localhost:5001/api/admin/users
    router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            const users = await db.all('SELECT id, username, email, role, balance FROM users');
            res.status(200).json(users);
        } catch (error) {
            console.error('Admin Fetch Users Error:', error);
            res.status(500).json({ error: 'Failed to retrieve user directory' });
        }
    });
    // GET: fetch all audit logs (admin only)
    // Path: GET http://localhost:5001/api/admin/audit-logs
    router.get('/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            // 🔍 Fetch all logs and link with users table to get their usernames
            const logs = await db.all(`
                SELECT audit_logs.*, users.username
                FROM audit_logs
                LEFT JOIN users ON audit_logs.user_id = users.id
                ORDER BY audit_logs.timestamp DESC
            `);

            res.status(200).json(logs);
        } catch (error) {
            // Log the actual error to the server console if it fails
            console.error('Admin Fetch audit logs Error:', error);
            res.status(500).json({ error: "Failed to retrieve audit logs." });
        }
    });

    return router; // Return the router back to server.js
};