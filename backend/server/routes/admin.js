const express = require('express');
const router = express.Router(); 
const authenticateToken = require('../middleware/authGuard'); // Middleware to ensure the user is logged in
const requireRole = require('../middleware/roleGuard'); // Middleware to ensure the user has the 'admin' role

module.exports = (db) => {

    // 👤 GET: Retrieve the directory of all registered users (Admin only)
    // Path: GET http://localhost:5001/api/admin/users
    router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            // We fetch the 'is_card_frozen' status along with standard profile info
            const users = await db.all('SELECT id, username, email, role, balance, is_card_frozen FROM users');
            res.status(200).json(users);
        } catch (error) {
            console.error('Admin Fetch Users Error:', error);
            res.status(500).json({ error: 'Failed to retrieve user directory.' });
        }
    });

    // ❄️ POST: Toggle card freeze status for another user (Admin only)
    // Path: POST http://localhost:5001/api/admin/users/:id/freeze
    router.post('/users/:id/freeze', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            const targetUserId = req.params.id;

            // 1. Verify the target user exists in the database
            const user = await db.get('SELECT is_card_frozen, username FROM users WHERE id = ?', targetUserId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // 2. Toggle the freeze state (if 1 then set to 0, if 0 then set to 1)
            const newFrozenState = user.is_card_frozen === 1 ? 0 : 1;

            // 3. Update the database record
            await db.run('UPDATE users SET is_card_frozen = ? WHERE id = ?', [newFrozenState, targetUserId]);

            // 4. Log this administrative event to the audit ledger for accountability
            const auditAction = newFrozenState === 1 ? 'ADMIN_CARD_FREEZE' : 'ADMIN_CARD_UNFREEZE';
            const auditDetails = `Admin ${req.user.username} toggled card freeze for user ${user.username} (New State: ${newFrozenState === 1 ? 'Frozen' : 'Unfrozen'})`;
            const auditId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
            
            await db.run(
                'INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                [auditId, req.user.userId, auditAction, auditDetails, req.ip, new Date().toISOString()]
            );

            return res.status(200).json({
                message: newFrozenState === 1 
                    ? `User ${user.username}'s card has been frozen.` 
                    : `User ${user.username}'s card has been unfrozen.`,
                isCardFrozen: newFrozenState === 1
            });
        } catch (error) {
            console.error('Admin Card freeze error:', error);
            return res.status(500).json({ error: 'Failed to toggle card freeze status.' });
        }
    });

    // 👑 POST: Promote/Demote another user's role (Admin only)
    // Path: POST http://localhost:5001/api/admin/users/:id/role
    router.post('/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            const targetUserId = req.params.id;
            const { role } = req.body;

            // 1. Validate the proposed role input
            if (!role || (role !== 'admin' && role !== 'user')) {
                return res.status(400).json({ error: 'Invalid role. Must be admin or user.' });
            }

            // 2. Verify the target user exists
            const user = await db.get('SELECT username FROM users WHERE id = ?', targetUserId);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // 3. Update the user's role field in the DB
            await db.run('UPDATE users SET role = ? WHERE id = ?', [role, targetUserId]);

            // 4. Log this administrative action to the audit logs
            const auditId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
            await db.run(
                'INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    auditId, 
                    req.user.userId, 
                    'ADMIN_ROLE_CHANGE', 
                    `Admin ${req.user.username} changed role of user ${user.username} to ${role}`, 
                    req.ip, 
                    new Date().toISOString()
                ]
            );

            return res.status(200).json({
                message: `User ${user.username} has been updated to role ${role}.`
            });
        } catch (error) {
            console.error('Admin Role change error:', error);
            return res.status(500).json({ error: 'Failed to update user role.' });
        }
    });

    // 🔍 GET: Fetch all audit logs (Admin only)
    // Path: GET http://localhost:5001/api/admin/audit-logs
    router.get('/audit-logs', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            // We join audit_logs with the users table to retrieve usernames associated with user IDs
            const logs = await db.all(`
                SELECT audit_logs.*, users.username
                FROM audit_logs
                LEFT JOIN users ON audit_logs.user_id = users.id
                ORDER BY audit_logs.timestamp DESC
            `);
            res.status(200).json(logs);
        } catch (error) {
            console.error('Admin Fetch audit logs Error:', error);
            res.status(500).json({ error: "Failed to retrieve audit logs." });
        }
    });

    // 📊 GET: Retrieve all transactions in the system (Admin only)
    // Path: GET http://localhost:5001/api/admin/transactions
    router.get('/transactions', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            const transactions = await db.all(`
                SELECT t.id, t.date, t.receiver, t.amount, t.category, t.is_negative, t.status, t.user_id, u.username as sender_username
                FROM transactions t
                LEFT JOIN users u ON t.user_id = u.id
                ORDER BY t.id DESC
            `);
            res.status(200).json(transactions);
        } catch (error) {
            console.error('Admin Fetch Transactions Error:', error);
            res.status(500).json({ error: 'Failed to retrieve system transactions.' });
        }
    });

    // 📢 POST: Add a new announcement (Admin only)
    // Path: POST http://localhost:5001/api/admin/announcements
    router.post('/announcements', authenticateToken, requireRole(['admin']), async (req, res) => {
        try {
            const { title, content } = req.body;
            if (!title || !content) {
                return res.status(400).json({ error: 'Title and content are required.' });
            }
            const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
            await db.run('INSERT INTO announcements (id, title, content, created_at) VALUES (?, ?, ?, ?)', [id, title, content, Date.now()]);
            
            // Also insert an audit log event
            const auditId = Date.now().toString() + 'ann';
            await db.run(
                'INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                [auditId, req.user.userId, 'ADMIN_CREATE_ANNOUNCEMENT', `Admin ${req.user.username} posted a new update: "${title}"`, req.ip, new Date().toISOString()]
            );

            res.status(201).json({ message: 'Announcement posted successfully!', id });
        } catch (error) {
            console.error('Admin Add Announcement Error:', error);
            res.status(500).json({ error: error.message });
        }
    });

    return router; 
};