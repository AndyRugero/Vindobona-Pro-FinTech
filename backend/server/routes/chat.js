// 💬 chat.js - Step 3b (Sub-step 2)
// This file serves as the API route '/api/chat' that the browser calls.

const express = require('express'); // 📥 Import Express
const router = express.Router(); // 🏗️ Initialize the Express Router
const authenticateToken = require('../middleware/authGuard'); // 🛡️ Import authentication guard
const { askAi } = require('../services/chatService'); // 🤖 Import our AI service helper

// We export a function that accepts the database connection 'db'
module.exports = (db) => {

    // 📬 POST endpoint: Handles messages sent to http://localhost:5001/api/chat
    // We add 'authenticateToken' so ONLY logged-in users can message the assistant.
    router.post('/', authenticateToken, async (req, res) => {
        try {
            // A. Get the message typed by the user from the request body
            const { message } = req.body;

            // B. Safety Check: If the message is empty, return a 400 Bad Request error
            if (!message) {
                return res.status(400).json({ error: 'Message content is required.' });
            }

            // C. Retrieve the user's real username and balance from the database
            const user = await db.get('SELECT username, balance FROM users WHERE id = ?', req.user.userId);

            // D. Safety Check: If the user is not found, return a 404 Not Found error
            if (!user) {
                return res.status(404).json({ error: 'User account details not found.' });
            }

            // E. Retrieve the last 20 transactions for this user
            // We sort by transaction ID in descending order to get the most recent ones first
            const transactions = await db.all(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 20',
                req.user.userId
            );

            // Build the transaction summary text for the OpenAI system prompt
            const transactionListText = transactions.map(t => {
                const typeLabel = t.is_negative === 1 ? 'Spent' : 'Received';
                return `- ${t.date}: ${typeLabel} €${t.amount} to/from ${t.receiver} [${t.category || 'Uncategorized'}]`;
            }).join('\n');

            // System prompt for OpenAI (used when API key is present)
            const systemPrompt = `
            You are Andy, a helpful and polite financial assistant for "Vindobona Pro FinTech Bank".
            Client profile:
            - Username: ${user.username}
            - Current Balance: €${user.balance.toFixed(2)}
            Recent transactions (newest first):
            ${transactionListText || 'No transactions found.'}
            Rules:
            1. Always be polite, professional and friendly.
            2. Only answer finance or account-related questions using the data above.
            3. For balance or transaction questions, refer to the real numbers above.
            4. For unrelated questions, politely explain you only assist with account matters.
            `;

            // Pass real userData as third argument so the smart local engine can use it
            const userData = { username: user.username, balance: user.balance, transactions };
            const botReply = await askAi(systemPrompt, message, userData);

            res.json({ reply: botReply });


        } catch (error) {
            // If any database or server crash occurs, catch it here
            console.error('❌ Error inside chat router:', error);
            res.status(500).json({ error: 'Failed to process chat request' });
        }
    });

    // Return the configured router back to the main server app
    return router;
};
