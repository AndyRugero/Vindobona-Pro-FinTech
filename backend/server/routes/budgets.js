const express = require('express'); // 📥 Import Express framework
const router = express.Router(); // 🏗️ Create a new Router instance
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import JWT Authentication Middleware

module.exports = (db) => {

    // ✍️ POST: Create a new budget limit or update an existing one
    // Path: POST http://localhost:5001/api/budgets
    router.post('/', authenticateToken, async (req, res) => {
        try {
            // A. Extract category name and limit amount from the request body
            const { category, amount } = req.body;

            // B. Validation: Make sure both fields exist
            if (!category || amount === undefined) {
                return res.status(400).json({ error: 'Category and amount are required' });
            }

            // C. Validation: Parse amount and ensure it is a valid, positive float
            const limitAmount = parseFloat(amount);
            if (isNaN(limitAmount) || limitAmount <= 0) {
                return res.status(400).json({ error: 'Limit amount must be a positive number' });
            }

            // D. Query: Check if the user already has a budget cap set for this specific category
            const existing = await db.get(
                'SELECT id FROM budgets WHERE user_id = ? AND category = ?',
                [req.user.userId, category]
            );

            if (existing) {
                // E. Update: If it exists, update the spending cap limit for that record
                await db.run(
                    'UPDATE budgets SET amount = ? WHERE id = ?',
                    [limitAmount, existing.id]
                );
                return res.status(200).json({ message: `Budget for ${category} updated to €${limitAmount}` });
            } else {
                // F. Insert: If it doesn't exist, create a new budget entry
                const id = Date.now().toString(); // Generate unique string ID
                await db.run(
                    'INSERT INTO budgets (id, user_id, category, amount) VALUES (?, ?, ?, ?)',
                    [id, req.user.userId, category, limitAmount]
                );
                return res.status(201).json({ message: `Budget for ${category} set to €${limitAmount}` });
            }
        } catch (error) {
            console.error('Error saving budget limit:', error);
            return res.status(500).json({ error: 'Failed to save budget limit.' });
        }
    });

    // 📖 GET: Fetch all active budgets and calculate current progress
    // Path: GET http://localhost:5001/api/budgets
    router.get('/', authenticateToken, async (req, res) => {
        try {
            // A. Retrieve all budget configurations set up by this user
            const budgets = await db.all(
                'SELECT * FROM budgets WHERE user_id = ?',
                [req.user.userId]
            );

            // B. Aggregate expenditures by summing absolute values of negative (expense) transactions
            const spentData = await db.all(
                `SELECT category, SUM(ABS(amount)) as totalSpent 
                 FROM transactions 
                 WHERE user_id = ? AND is_negative = 1 
                 GROUP BY category`,
                [req.user.userId]
            );

            // C. Create a lookup map (e.g. { Food: 120, Entertainment: 45 }) for simple mapping
            const spentMap = {};
            spentData.forEach(row => {
                spentMap[row.category] = row.totalSpent;
            });

            // D. Map each budget config to its calculated progress metrics
            const results = budgets.map(b => {
                const spent = spentMap[b.category] || 0;
                return {
                    id: b.id,
                    category: b.category,
                    limit: b.amount,
                    spent: spent,
                    remaining: Math.max(0, b.amount - spent),
                    isExceeded: spent > b.amount
                };
            });

            // E. Return the populated array
            return res.json(results);
        } catch (error) {
            console.error('Error fetching budgets summary:', error);
            return res.status(500).json({ error: 'Failed to fetch budgets summary.' });
        }
    });

    // 📤 Return router back to main server.js file
    return router;
};
