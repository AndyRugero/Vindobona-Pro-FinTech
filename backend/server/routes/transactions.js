const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import the auth guard middleware
const { authenticator } = require('otplib'); // 📱 Import otplib for PSD2 transaction verification
const { logAuditEntry } = require('../services/auditService'); // 📜 Import our secure audit logger

// 📤 We export a function that accepts the database connection 'db'
module.exports = (db) => {

    // 📖 GET: Fetch and filter transactions for the logged-in user (Lesson 53a)
    // Path: GET http://localhost:5001/api/transactions
    router.get('/', authenticateToken, async (req, res) => {
        try {
            // 📥 1. Read query parameters from the URL (search, category, and type)
            const { search, category, type } = req.query;

            // 🏗️ 2. Base SQL Query (Starts by querying transactions for the current user)
            let sqlQuery = 'SELECT * FROM transactions WHERE user_id = ?';
            const queryParams = [req.user.userId]; // Start parameters list with the user's ID

            // 🔍 3. Search Filter (checks if search word is in receiver or category)
            if (search) {
                // We use += to append the filter, and notice the space before 'AND'
                sqlQuery += ' AND (receiver LIKE ? OR category LIKE ?)';
                const searchPattern = `%${search}%`; // e.g. "%bill%" matches "Billa"
                queryParams.push(searchPattern, searchPattern); // We push twice because we have two '?' placeholders
            }

            // 📁 4. Category Filter (filters by exact category name, e.g. "Food" or "Rent")
            if (category) {
                sqlQuery += ' AND category = ?';
                queryParams.push(category); // We push one parameter for the '?' placeholder
            }

            // 🔄 5. Type Filter (income vs expense)
            if (type) {
                const lowerType = type.toLowerCase();
                if (lowerType === 'expense') {
                    sqlQuery += ' AND is_negative = 1'; // 1 means spending (negative)
                } else if (lowerType === 'income') {
                    sqlQuery += ' AND is_negative = 0'; // 0 means earning (positive)
                }
            }

            // 🗄️ 6. Run the dynamically built query in our SQLite database
            const rows = await db.all(sqlQuery, queryParams);

            // 🗺️ 7. Map database fields to what React expects (camelCase and string types)
            const transactions = rows.map(row => ({
                id: row.id,
                date: row.date,
                receiver: row.receiver,
                amount: row.amount.toString(), // Convert numeric amount to string to avoid crash in React
                category: row.category,
                isNegative: row.is_negative === 1, // Convert 1/0 back to boolean
                status: row.status
            }));

            // 📤 8. Send the final filtered list back to the frontend
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

    // POST: Safe funds transfer between users using SQL transactions
    // Path: POST http://localhost:5001/api/transactions/transfer
    router.post('/transfer', authenticateToken, async (req, res) => {
        const { receiverUsername, amount, twoFactorCode } = req.body;
        const senderId = req.user.userId;
        const senderUsername = req.user.username;

        // Basic validation checks
        if (!receiverUsername || !amount) {
            return res.status(400).json({ error: 'Receiver username and amount are required.' });
        }
        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return res.status(400).json({ error: 'Invalid transfer amount.' });
        }
        if (receiverUsername.trim().toLowerCase() === senderUsername.trim().toLowerCase()) {
            return res.status(400).json({ error: 'You cannot transfer to yourself Money' });
        }

        try {
            // Database query to find receiver if they exist
            const receiver = await db.get(
                'SELECT id, username FROM users WHERE LOWER(username) = ?',
                receiverUsername.trim().toLowerCase()
            );

            if (!receiver) {
                return res.status(404).json({ error: 'Receiver not found' });
            }

            // Fetch the sender's current balance and 2FA settings
            const sender = await db.get('SELECT balance, two_factor_enabled, two_factor_secret FROM users WHERE id = ?', senderId);
            if (!sender) {
                return res.status(404).json({ error: 'Sender not found' });
            }

            // Wallet Check: if the balance is less than the transfer amount, block transfer
            if (sender.balance < transferAmount) {
                return res.status(400).json({ error: 'Insufficient balance' });
            }

            // 📱 PSD2 Security Check: If sender has 2FA enabled, verify their transaction signing code
            if (sender.two_factor_enabled === 1) {
                if (!twoFactorCode) {
                    return res.status(403).json({ error: 'Two-factor authentication code is required to sign this transaction.' });
                }
                const isValid = authenticator.verify({
                    token: twoFactorCode,
                    secret: sender.two_factor_secret
                });
                if (!isValid) {
                    return res.status(403).json({ error: 'Invalid two-factor authentication code.' });
                }
            }

            // ----------------------------------------------------
            // 🏦 STEP 3: TRANSACTION & DATABASE UPDATES (Stage 1)
            // ----------------------------------------------------

            // A. Open the secure transaction envelope
            await db.run('BEGIN TRANSACTION');

            // 📜 1. Log that the transfer was signed/authorized in the ledger
            const signDetails = sender.two_factor_enabled === 1
                ? `Transfer of €${transferAmount} to ${receiver.username} was signed with 2FA.`
                : `Transfer of €${transferAmount} to ${receiver.username} was authorized.`;
            await logAuditEntry(db, senderId, 'TRANSFER_SIGNED', signDetails, req.ip);

            // B. Subtract transfer amount from the sender's balance
            await db.run(
                'UPDATE users SET balance = balance - ? WHERE id = ?',
                [transferAmount, senderId]
            );

            // C. Add transfer amount to the receiver's balance
            await db.run(
                'UPDATE users SET balance = balance + ? WHERE id = ?',
                [transferAmount, receiver.id]
            );

            // Create an outgoing ledger record for the sender (is_negative = 1)
            const senderTxId = Date.now().toString() + '-send';
            await db.run(
                `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    senderTxId,
                    new Date().toLocaleDateString('en-US', { weekday: 'short' }),
                    receiver.username,
                    transferAmount,
                    'Transfer',
                    1, // 1 = negative (expense)
                    'Complete',
                    senderId
                ]
            );

            // Create an incoming ledger record for the receiver (is_negative = 0)
            const receiverTxId = (Date.now() + 1).toString() + '-recv';
            await db.run(
                `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    receiverTxId,
                    new Date().toLocaleDateString('en-US', { weekday: 'short' }),
                    senderUsername,
                    transferAmount,
                    'Transfer',
                    0, // 0 = positive (incoming)
                    'Complete',
                    receiver.id
                ]
            );

            // 📜 2. Log outgoing transfer for sender
            await logAuditEntry(db, senderId, 'TRANSFER_SENT', `Sent €${transferAmount} to ${receiver.username}`, req.ip);

            // 📜 3. Log incoming transfer for receiver
            await logAuditEntry(db, receiver.id, 'TRANSFER_RECEIVED', `Received €${transferAmount} from ${senderUsername}`, req.ip);

            // D. Seal the transaction envelope and write changes permanently to disk
            await db.run('COMMIT');

            // E. Return successful response
            return res.status(200).json({
                message: 'Balance transfer completed successfully!',
                amount: transferAmount,
                receiver: receiver.username
            });

        } catch (error) {
            console.error('Error during balance safety checks', error);
            try {
                // If anything failed inside the transaction, undo all balance updates
                await db.run('ROLLBACK');
            } catch (rollbackError) {
                console.error('Failed to rollback transaction:', rollbackError);
            }
            return res.status(500).json({ error: 'Database verification failed' });
        }
    });

    return router;
};
