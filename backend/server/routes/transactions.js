const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import the auth guard middleware
const { authenticator } = require('otplib'); // 📱 Import otplib for PSD2 transaction verification
const { logAuditEntry } = require('../services/auditService'); // 📜 Import our secure audit logger
const { sendEmail } = require('../services/emailService'); // 📧 Import email service for OTP
const PDFDocument = require('pdfkit'); // 📑 Import PDFKit for generating PDF bank statements

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

            //card freeze check: Query db to see if the card is frozen
            const user = await db.get('SELECT is_card_frozen FROM users WHERE id = ?', req.user.userId);
            if (user && user.is_card_frozen == 1) {
                return res.status(403).json({ error: 'Transaction declined. your card is frozen!' });
            }
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

            // 📊 Budget Limit Verification: Check if this expense triggers an over-budget alert
            const budget = await db.get(
                'SELECT amount FROM budgets WHERE user_id = ? AND category = ?',
                [req.user.userId, dbTx.category]
            );

            if (budget && isNegativeBool) {
                // Sum all expenses in this category (including the one we just inserted)
                const spentRow = await db.get(
                    `SELECT SUM(ABS(amount)) as spent 
                     FROM transactions 
                     WHERE user_id = ? AND category = ? AND is_negative = 1`,
                    [req.user.userId, dbTx.category]
                );

                const totalSpent = spentRow.spent || 0;

                // If total monthly expenditures exceed the limit, add a warning object
                if (totalSpent > budget.amount) {
                    responseTx.budgetWarning = {
                        exceeded: true,
                        spent: totalSpent,
                        limit: budget.amount
                    };
                }
            }



            res.status(201).json(responseTx);
        } catch (error) {
            console.error('Error inserting transaction:', error);
            res.status(500).json({ error: 'Failed to insert transaction' });
        }
    });

    // 🗑️ DELETE: Remove a transaction by ID (or rollback if it is a transfer)
    // Path: DELETE http://localhost:5001/api/transactions/:id
    router.delete('/:id', authenticateToken, async (req, res) => {
        try {
            const { id } = req.params;
            const currentUserId = req.user.userId || req.user.id;
            const currentUserRole = req.user.role;

            // 1. Fetch the transaction details first to check if it's a transfer
            const tx = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
            if (!tx) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            // 2. If it is a transfer, verify if the user is an admin
            if (tx.category === 'Transfer') {
                if (currentUserRole !== 'admin') {
                    return res.status(403).json({ error: 'Transaction declined. Transfers can only be rolled back by an administrator.' });
                }

                // Admins are allowed to rollback transfers!
                // To rollback a transfer:
                // A. We find the matching transaction record on the other side.
                // Since outgoing transfers are stored as negative (is_negative = 1) for the sender,
                // and incoming transfers are positive (is_negative = 0) for the receiver.
                // Let's find both transactions!
                let senderId = null;
                let receiverId = null;
                let amountVal = tx.amount;
                let senderTx = null;
                let receiverTx = null;

                if (tx.is_negative === 1) {
                    senderId = tx.user_id;
                    senderTx = tx;
                    // The receiver is the user with the username stored in tx.receiver
                    const recUser = await db.get('SELECT id FROM users WHERE username = ?', [tx.receiver]);
                    if (recUser) {
                        receiverId = recUser.id;
                        // Find the matching receiver transaction
                        receiverTx = await db.get(
                            "SELECT * FROM transactions WHERE user_id = ? AND category = 'Transfer' AND amount = ? AND is_negative = 0",
                            [receiverId, tx.amount]
                        );
                    }
                } else {
                    receiverId = tx.user_id;
                    receiverTx = tx;
                    // The sender is the user with the username stored in tx.receiver
                    const sndUser = await db.get('SELECT id FROM users WHERE username = ?', [tx.receiver]);
                    if (sndUser) {
                        senderId = sndUser.id;
                        // Find the matching sender transaction
                        senderTx = await db.get(
                            "SELECT * FROM transactions WHERE user_id = ? AND category = 'Transfer' AND amount = ? AND is_negative = 1",
                            [senderId, tx.amount]
                        );
                    }
                }

                // B. Open transaction envelope
                await db.run('BEGIN TRANSACTION');

                // C. Revert balances
                if (senderId) {
                    await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amountVal, senderId]);
                }
                if (receiverId) {
                    await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [amountVal, receiverId]);
                }

                // D. Delete both transaction records
                if (senderTx) {
                    await db.run('DELETE FROM transactions WHERE id = ?', [senderTx.id]);
                }
                if (receiverTx) {
                    await db.run('DELETE FROM transactions WHERE id = ?', [receiverTx.id]);
                }

                // E. Log to audit log
                const auditDetails = `Admin ${req.user.username} rolled back transfer of €${amountVal} between sender (ID: ${senderId}) and receiver (ID: ${receiverId})`;
                const auditId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
                await db.run(
                    'INSERT INTO audit_logs (id, user_id, action, details, ip_address, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
                    [auditId, currentUserId, 'ADMIN_TRANSFER_ROLLBACK', auditDetails, req.ip, new Date().toISOString()]
                );

                await db.run('COMMIT');
                return res.status(200).json({ message: 'Transfer successfully rolled back by administrator and balances restored!' });

            } else {
                // If it is a normal transaction, verify that it belongs to the logged-in user (unless admin)
                if (tx.user_id !== currentUserId && currentUserRole !== 'admin') {
                    return res.status(403).json({ error: 'Unauthorized to delete this transaction' });
                }

                // Execute normal deletion
                await db.run('DELETE FROM transactions WHERE id = ?', [id]);
                return res.status(200).json({ message: `Transaction ${id} deleted successfully` });
            }

        } catch (error) {
            try {
                await db.run('ROLLBACK');
            } catch (rbErr) {}
            console.error('Error deleting transaction:', error);
            res.status(500).json({ error: `Failed to delete transaction: ${error.message}` });
        }
    });

    // POST: Safe funds transfer between users using SQL transactions
    // Path: POST http://localhost:5001/api/transactions/transfer
    router.post('/transfer', authenticateToken, async (req, res) => {
        const { receiverUsername, amount, twoFactorCode, otpCode } = req.body;
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

            // Fetch the sender's current balance, email and 2FA settings
            const sender = await db.get('SELECT email, balance, two_factor_enabled, two_factor_secret , is_card_frozen FROM users WHERE id = ?', senderId);
            if (!sender) {
                return res.status(404).json({ error: 'Sender not found' });
            }

            // card freeze check : rejects the transfer if the sender's card id frozen
            if (sender.is_card_frozen === 1) {
                return res.status(403).json({ error: 'Transaction declined , your card is frozen' })
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

            // 📧 Email Verification (OTP) Check - Bypassed during test suite execution
            if (process.env.NODE_ENV !== 'test') {
                if (!otpCode) {
                    // Generate random 6-digit verification code
                    const code = Math.floor(100000 + Math.random() * 900000).toString();

                    // Delete existing OTP and insert the new authorization code
                    await db.run('DELETE FROM transfer_otps WHERE user_id = ?', [senderId]);
                    await db.run(
                        `INSERT INTO transfer_otps (user_id, otp_code, receiver_username, amount, created_at)
                         VALUES (?, ?, ?, ?, ?)`,
                        [senderId, code, receiver.username, transferAmount, Date.now()]
                    );

                    // Compile HTML message template with professional banking theme
                    const emailHtml = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 550px; margin: 20px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                            <div style="text-align: center; margin-bottom: 25px;">
                                <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Vindobona Pro FinTech</h1>
                                <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #64748b;">Secure Transaction Authorization</span>
                            </div>
                            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
                            <p style="font-size: 15px; line-height: 1.6; color: #334155;">Hallo <strong>${senderUsername}</strong>,</p>
                            <p style="font-size: 15px; line-height: 1.6; color: #334155;">Sie haben eine Überweisung initiiert. Bitte autorisieren Sie die Transaktion mit dem folgenden Einmalpasswort (OTP):</p>
                            
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; text-align: center; margin: 25px 0; border-radius: 8px;">
                                <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #2563eb; font-family: monospace;">${code}</div>
                            </div>
                            
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin-bottom: 25px;">
                                <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 4px 0; font-weight: 600;">Empfänger:</td>
                                        <td style="padding: 4px 0; text-align: right;">${receiver.username}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 4px 0; font-weight: 600;">Betrag:</td>
                                        <td style="padding: 4px 0; text-align: right; font-weight: bold; color: #0f172a;">€${transferAmount.toFixed(2)}</td>
                                    </tr>
                                </table>
                            </div>
                            
                            <p style="font-size: 12px; line-height: 1.5; color: #94a3b8; margin-top: 25px;">
                                Dieser Freigabecode ist für 5 Minuten gültig. Falls Sie diese Überweisung nicht in Auftrag gegeben haben, ändern Sie bitte unverzüglich Ihre Kontoeinstellungen.
                            </p>
                        </div>
                    `;

                    await sendEmail(sender.email || 'mock@vindobona.com', 'Überweisungsverifizierung - Vindobona Pro', emailHtml);

                    return res.status(200).json({
                        requiresOtp: true,
                        message: 'Verification code sent to your email.'
                    });
                } else {
                    // Extract and verify the submitted OTP code
                    const savedOtp = await db.get('SELECT * FROM transfer_otps WHERE user_id = ?', [senderId]);
                    if (!savedOtp || savedOtp.otp_code !== otpCode.trim() || (Date.now() - savedOtp.created_at) > 5 * 60 * 1000) {
                        return res.status(403).json({ error: 'Invalid or expired verification code.' });
                    }
                    if (savedOtp.receiver_username !== receiver.username || Math.abs(savedOtp.amount - transferAmount) > 0.01) {
                        return res.status(400).json({ error: 'Transaction details do not match the authorized verification code.' });
                    }
                    // Clean code to enforce single-use protection
                    await db.run('DELETE FROM transfer_otps WHERE user_id = ?', [senderId]);
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
            return res.status(500).json({ error: `Database verification failed: ${error.message}` });
        }
    });
    // =========================================================================
    // 📊 GET: Export transactions as a CSV spreadsheet (Lesson 54)
    // =========================================================================
    router.get('/export/csv', authenticateToken, async (req, res) => {
        try {
            // A. Fetch all transactions belonging to the logged-in user from the database
            const rows = await db.all(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
                [req.user.userId]
            );

            // B. Define the CSV header row
            const csvHeaders = 'ID,Date,Receiver,Amount,Category,Type,Status\n';

            // C. Build CSV rows, wrapping text fields in double quotes to prevent comma splits
            const csvRows = rows.map(row => {
                // Determine transaction type (Expense if is_negative is 1, else Income)
                const typeLabel = row.is_negative === 1 ? 'Expense' : 'Income';

                // Escape internal quotes in receiver and category names
                const cleanReceiver = row.receiver ? row.receiver.replace(/"/g, '""') : '';
                const cleanCategory = row.category ? row.category.replace(/"/g, '""') : '';

                return `"${row.id}","${row.date}","${cleanReceiver}","${row.amount}","${cleanCategory}","${typeLabel}","${row.status}"`;
            }).join('\n');

            const csvContent = csvHeaders + csvRows;

            // D. Set file attachment headers to force browser download
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=vindobona_transactions.csv');

            // E. Send the CSV payload back as a text response
            return res.status(200).send(csvContent);
        } catch (error) {
            console.error('❌ CSV Export Failure:', error);
            return res.status(500).json({ error: 'Failed to generate CSV export.' });
        }

    });
    // =========================================================================
    // 📑 GET: Export transactions as a PDF bank statement (Lesson 54)
    // =========================================================================
    router.get('/export/pdf', authenticateToken, async (req, res) => {
        try {
            // A. Fetch all transactions belonging to the logged-in user
            const rows = await db.all(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
                [req.user.userId]
            );

            // B. Fetch username to personalize the bank statement
            const userRow = await db.get('SELECT username FROM users WHERE id = ?', [req.user.userId]);
            const username = userRow ? userRow.username : 'Customer';

            // C. Configure PDF download response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=vindobona_statement_${username}.pdf`);

            // D. Initialize PDF document with professional A4 margins
            const doc = new PDFDocument({ margin: 50, size: 'A4' });

            // E. Stream the PDF layout directly into the Express HTTP response
            doc.pipe(res);

            // F. Premium Styling & Header Layout (Belvedere, Vienna Office)
            doc.fillColor('#1a365d').fontSize(26).text('Vindobona Pro FinTech', { align: 'left' });
            doc.fontSize(10).fillColor('#718096').text('Am Belvedere 1, 1100 Wien, Austria', { align: 'left' });
            doc.text('support@vindobonafintech.com', { align: 'left' });
            doc.moveDown(2);

            // G. Statement Metadata Box
            doc.fillColor('#2d3748').fontSize(16).text('OFFICIAL ACCOUNT STATEMENT', { underline: true });
            doc.fontSize(10).fillColor('#4a5568');
            doc.text(`Account Holder: ${username}`);
            doc.text(`Statement Date: ${new Date().toLocaleDateString('de-AT')}`);
            doc.text(`Total Transactions: ${rows.length}`);
            doc.moveDown(2);

            // Draw horizontal dividing line
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
            doc.moveDown(1.5);

            // H. Transaction Table Headers
            doc.fillColor('#1a365d').fontSize(11);
            let yPosition = doc.y;
            doc.text('Date', 50, yPosition, { width: 80 });
            doc.text('Receiver', 130, yPosition, { width: 150 });
            doc.text('Category', 280, yPosition, { width: 100 });
            doc.text('Type', 380, yPosition, { width: 80 });
            doc.text('Amount', 460, yPosition, { width: 80, align: 'right' });
            doc.moveDown(0.5);

            // Draw line under table header
            doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e0').lineWidth(1).stroke();
            doc.moveDown(1);

            // I. Write transaction entries
            doc.fillColor('#2d3748').fontSize(10);
            for (const row of rows) {
                // If drawing exceeds safety margins (close to bottom), create a new page
                if (doc.y > 700) {
                    doc.addPage();
                    // Redraw headers on new page
                    doc.fillColor('#1a365d').fontSize(11);
                    yPosition = doc.y;
                    doc.text('Date', 50, yPosition, { width: 80 });
                    doc.text('Receiver', 130, yPosition, { width: 150 });
                    doc.text('Category', 280, yPosition, { width: 100 });
                    doc.text('Type', 380, yPosition, { width: 80 });
                    doc.text('Amount', 460, yPosition, { width: 80, align: 'right' });
                    doc.moveDown(0.5);
                    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#cbd5e0').stroke();
                    doc.moveDown(1);
                    doc.fillColor('#2d3748').fontSize(10);
                }

                yPosition = doc.y;
                const typeLabel = row.is_negative === 1 ? 'Expense' : 'Income';
                const formattedAmount = `${row.is_negative === 1 ? '-' : '+'}${row.amount.toFixed(2)} EUR`;

                // Dynamic coloring: Green for income, red for expense
                const amountColor = row.is_negative === 1 ? '#e53e3e' : '#38a169';

                doc.text(row.date, 50, yPosition, { width: 80 });
                doc.text(row.receiver || 'N/A', 130, yPosition, { width: 150 });
                doc.text(row.category || 'General', 280, yPosition, { width: 100 });
                doc.text(typeLabel, 380, yPosition, { width: 80 });

                doc.fillColor(amountColor);
                doc.text(formattedAmount, 460, yPosition, { width: 80, align: 'right' });
                doc.fillColor('#2d3748'); // Reset font color for next rows

                doc.moveDown(1.5);
            }

            // J. Finalize and output stream to client
            doc.end();
        } catch (error) {
            console.error('❌ PDF Export Failure:', error);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to generate PDF statement.' });
            }
        }
    });

    // 💱 POST: Exchange money between different currency wallets (Lesson 54c)
    // Path: POST http://localhost:5001/api/transactions/exchange
    // Importance: Securely moves funds between currency slots using atomic database transactions.
    router.post('/exchange', authenticateToken, async (req, res) => {
        const { fromCurrency, toCurrency, amount, rate } = req.body;
        const userId = req.user.userId;

        // 1. Basic validation: Make sure currencies, amount, and rate are provided
        if (!fromCurrency || !toCurrency || !amount || !rate) {
            return res.status(400).json({ error: 'Source currency, target currency, amount, and rate are required.' });
        }

        const exchangeAmount = parseFloat(amount);
        const exchangeRate = parseFloat(rate);

        if (isNaN(exchangeAmount) || exchangeAmount <= 0) {
            return res.status(400).json({ error: 'Invalid exchange amount.' });
        }
        if (isNaN(exchangeRate) || exchangeRate <= 0) {
            return res.status(400).json({ error: 'Invalid exchange rate.' });
        }
        if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
            return res.status(400).json({ error: 'Cannot exchange between the same currency.' });
        }

        try {
            // A. Recalculate real balance from transactions and sync the EUR wallet balance
            const txSum = await db.get(
                'SELECT SUM(CASE WHEN is_negative = 1 THEN -ABS(amount) ELSE ABS(amount) END) as total FROM transactions WHERE user_id = ?',
                [userId]
            );
            const realBalance = txSum ? (txSum.total || 0.0) : 0.0;

            const eurWallet = await db.get(
                "SELECT id FROM wallets WHERE user_id = ? AND currency = 'EUR'",
                [userId]
            );

            if (eurWallet) {
                await db.run(
                    "UPDATE wallets SET balance = ? WHERE user_id = ? AND currency = 'EUR'",
                    [realBalance, userId]
                );
            } else {
                await db.run(
                    "INSERT INTO wallets (id, user_id, currency, balance) VALUES (?, ?, 'EUR', ?)",
                    [Date.now().toString() + Math.random().toString(), userId, realBalance]
                );
            }

            await db.run(
                "UPDATE users SET balance = ? WHERE id = ?",
                [realBalance, userId]
            );

            // 2. Security Check: Block exchanges if the user's debit card is frozen
            const user = await db.get('SELECT is_card_frozen FROM users WHERE id = ?', userId);
            if (user && user.is_card_frozen === 1) {
                return res.status(403).json({ error: 'Transaction declined. Your card is frozen!' });
            }

            // 3. Verify the user has the source wallet (e.g., 'EUR') and enough funds
            const sourceWallet = await db.get(
                'SELECT balance FROM wallets WHERE user_id = ? AND currency = ?',
                [userId, fromCurrency.toUpperCase()]
            );

            if (!sourceWallet || sourceWallet.balance < exchangeAmount) {
                return res.status(400).json({ error: `Insufficient balance in your ${fromCurrency.toUpperCase()} wallet.` });
            }

            // 4. Ensure the target wallet exists (create it with 0.0 balance if it doesn't exist yet)
            let targetWallet = await db.get(
                'SELECT id, balance FROM wallets WHERE user_id = ? AND currency = ?',
                [userId, toCurrency.toUpperCase()]
            );

            if (!targetWallet) {
                const newWalletId = Date.now().toString() + '-' + Math.random().toString();
                await db.run(
                    'INSERT INTO wallets (id, user_id, currency, balance) VALUES (?, ?, ?, 0.0)',
                    [newWalletId, userId, toCurrency.toUpperCase()]
                );
                targetWallet = { id: newWalletId, balance: 0.0 };
            }

            const convertedAmount = parseFloat((exchangeAmount * exchangeRate).toFixed(2));

            // 🏦 5. Open a secure SQL Transaction to update balances atomically
            await db.run('BEGIN TRANSACTION');

            // A. Subtract amount from the source wallet
            await db.run(
                'UPDATE wallets SET balance = balance - ? WHERE user_id = ? AND currency = ?',
                [exchangeAmount, userId, fromCurrency.toUpperCase()]
            );

            // B. Add the converted amount to the target wallet
            await db.run(
                'UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND currency = ?',
                [convertedAmount, userId, toCurrency.toUpperCase()]
            );

            // C. Log the audit ledger entry for security tracking
            const auditDetails = `Exchanged ${exchangeAmount} ${fromCurrency.toUpperCase()} for ${convertedAmount} ${toCurrency.toUpperCase()} at rate ${exchangeRate}`;
            await logAuditEntry(db, userId, 'CURRENCY_EXCHANGE', auditDetails, req.ip);

            // D. Insert a standard transaction record so it shows up in the user's ledger log
            const txId = Date.now().toString() + '-fx';
            const txDate = new Date().toLocaleDateString('en-US', { weekday: 'short' });
            await db.run(
                `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id) 
                 VALUES (?, ?, ?, ?, 'Exchange', 1, 'Complete', ?)`,
                [txId, txDate, `FX Exchange: ${fromCurrency.toUpperCase()} to ${toCurrency.toUpperCase()}`, exchangeAmount, userId]
            );

            // Commit the transaction
            await db.run('COMMIT');

            return res.status(200).json({
                message: `Exchanged ${exchangeAmount} ${fromCurrency.toUpperCase()} to ${convertedAmount} ${toCurrency.toUpperCase()} successfully! 💱`,
                sourceBalance: sourceWallet.balance - exchangeAmount,
                targetBalance: targetWallet.balance + convertedAmount
            });

        } catch (error) {
            // Rollback the transaction in case of SQL failures to prevent money from disappearing
            await db.run('ROLLBACK');
            console.error('❌ Currency exchange route failure:', error);
            return res.status(500).json({ error: 'Failed to complete currency exchange.' });
        }
    });

    // 📖 GET: Fetch all currency wallets and balances for the logged-in user
    // Path: GET http://localhost:5001/api/transactions/wallets
    // Importance: Allows the React frontend to display the user's balances.
    router.get('/wallets', authenticateToken, async (req, res) => {
        try {
            const userId = req.user.userId;

            // 1. Calculate the user's real balance from the transactions table
            const txSum = await db.get(
                'SELECT SUM(CASE WHEN is_negative = 1 THEN -ABS(amount) ELSE ABS(amount) END) as total FROM transactions WHERE user_id = ?',
                [userId]
            );
            const realBalance = txSum ? (txSum.total || 0.0) : 0.0;

            // 2. Ensure the EUR wallet exists and matches the real balance
            const eurWallet = await db.get(
                "SELECT id FROM wallets WHERE user_id = ? AND currency = 'EUR'",
                [userId]
            );

            if (eurWallet) {
                await db.run(
                    "UPDATE wallets SET balance = ? WHERE user_id = ? AND currency = 'EUR'",
                    [realBalance, userId]
                );
            } else {
                await db.run(
                    "INSERT INTO wallets (id, user_id, currency, balance) VALUES (?, ?, 'EUR', ?)",
                    [Date.now().toString() + Math.random().toString(), userId, realBalance]
                );
            }

            // Also keep users.balance synchronized
            await db.run(
                "UPDATE users SET balance = ? WHERE id = ?",
                [realBalance, userId]
            );

            // 3. Retrieve all wallet records belonging to this user
            const wallets = await db.all(
                'SELECT currency, balance FROM wallets WHERE user_id = ? ORDER BY currency ASC',
                [userId]
            );

            return res.status(200).json({ wallets });
        } catch (error) {
            console.error('❌ Failed to fetch wallets:', error);
            return res.status(500).json({ error: 'Failed to retrieve wallet balances.' });
        }
    });

    // 📥 POST: Bulk import transactions
    // Path: POST http://localhost:5001/api/transactions/bulk
    router.post('/bulk', authenticateToken, async (req, res) => {
        try {
            const { transactions } = req.body;
            if (!Array.isArray(transactions)) {
                return res.status(400).json({ error: 'Transactions array is required' });
            }

            await db.run('BEGIN TRANSACTION');

            const presets = ['Groceries', 'Utilities', 'Leisure & Entertainment', 'Travel', 'Healthcare', 'Shopping', 'Rent', 'Other'];

            for (const tx of transactions) {
                const amountVal = parseFloat(tx.amount.replace(/[^\d.-]/g, ''));
                const isNegative = tx.amount.includes('-') || amountVal < 0;
                
                let matchedCategory = tx.category || 'General';
                const found = presets.find(p => p.toLowerCase() === matchedCategory.trim().toLowerCase());
                if (found) {
                    matchedCategory = found;
                } else {
                    matchedCategory = matchedCategory.trim();
                }

                const dbTx = {
                    id: tx.id || Date.now().toString() + Math.random().toString(36).substring(2, 5),
                    date: tx.date || new Date().toLocaleDateString('en-US', { weekday: 'short' }),
                    receiver: tx.receiver || 'Unknown',
                    amount: isNegative ? -Math.abs(amountVal) : Math.abs(amountVal),
                    category: matchedCategory,
                    is_negative: isNegative ? 1 : 0,
                    status: 'Complete',
                    user_id: req.user.userId
                };

                await db.run(
                    `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status, user_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [dbTx.id, dbTx.date, dbTx.receiver, dbTx.amount, dbTx.category, dbTx.is_negative, dbTx.status, dbTx.user_id]
                );
            }

            await db.run('COMMIT');
            return res.status(201).json({ message: `${transactions.length} transactions imported successfully!` });
        } catch (error) {
            await db.run('ROLLBACK');
            console.error('Error importing bulk transactions:', error);
            return res.status(500).json({ error: 'Failed to import transactions' });
        }
    });

    return router;
};