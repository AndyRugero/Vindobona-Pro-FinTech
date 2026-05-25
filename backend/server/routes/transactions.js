const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import the auth guard middleware

// 📤 We export a function that accepts the database connection 'db'
module.exports = (db) => {

    // 📖 GET: Fetch all transactions for the logged-in user
    // Path: GET http://localhost:5001/api/transactions
    router.get('/', authenticateToken, async (req, res) => {
        try {
            // Query only transactions belonging to the logged-in user
            const rows = await db.all('SELECT * FROM transactions WHERE user_id = ?', req.user.userId);

            // 🗺️ Map database fields to what React expects (camelCase and string types)
            const transactions = rows.map(row => ({
                id: row.id,
                date: row.date,
                receiver: row.receiver,
                amount: row.amount.toString(), // Convert numeric amount to string to avoid crash in React
                category: row.category,
                isNegative: row.is_negative === 1, // Convert 1/0 back to boolean
                status: row.status
            }));

            res.json(transactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            res.status(500).json({ error: 'Failed to fetch transactions' });
        }
    });

    // ✍️ POST: Insert a new transaction into the SQLite database (linked to the logged-in user)
    // Path: POST http://localhost:5001/api/transactions
    router.post('/', authenticateToken, async (req, res) => {
        try {
            const { receiver, amount, category } = req.body;
            const isNegativeBool = amount.includes('-');

            const dbTx = {
                id: Date.now().toString(),
                date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
                receiver: receiver,
                amount: parseFloat(amount), // SQLite stores as numeric REAL
                category: category || 'General',
                is_negative: isNegativeBool ? 1 : 0, // SQLite stores boolean as 1 or 0
                status: 'Complete',
                user_id: req.user.userId // Link transaction to logged-in user
            };

            // Run SQL INSERT query including user_id
            await db.run(
                `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [dbTx.id, dbTx.date, dbTx.receiver, dbTx.amount, dbTx.category, dbTx.is_negative, dbTx.status, dbTx.user_id]
            );

            // Map back to what React expects
            const responseTx = {
                id: dbTx.id,
                date: dbTx.date,
                receiver: dbTx.receiver,
                amount: amount, // Keep original string amount (e.g. "-150") for React
                isNegative: isNegativeBool,
                category: dbTx.category,
                status: dbTx.status
            };

            res.status(201).json(responseTx);
        } catch (error) {
            console.error('Error inserting transaction:', error);
            res.status(500).json({ error: 'Failed to insert transaction' });
        }
    });

    // 🗑️ DELETE: Remove a transaction by ID (only if it belongs to the logged-in user)
    // Path: DELETE http://localhost:5001/api/transactions/:id
    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;

            // Execute SQL query to delete the row matching the ID AND user_id
            const result = await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', id, req.user.userId);

            if (result.changes > 0) {
                res.status(200).json({ message: `Transaction ${id} deleted successfully` });
            } else {
                res.status(404).json({ error: `Transaction ${id} not found or unauthorized` });
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            res.status(500).json({ error: 'Failed to delete transaction' });
        }
    });

    return router; // 📤 Return the router back to server.js
};
