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

            // ⚠️ Placeholder: In Sub-step 3, we will send this data to OpenAI.
            // For now, let's return a success message to verify our database lookup works!
            const transactionListText = transactions.map(t => {
                const typeLabel = t.is_negative === 1 ? 'Spent' : 'Received';
                return `-${t.date}: ${typeLabel} €${t.amount} to/from ${t.receiver} [category: ${t.category}]`;
            }).join('\n');


            //hidden system
            const systemPrompt = `
            you are a helpful and Polite finacial chatbot assistant for the "Vindoboba
            pro Fintect Bank".
            Here is the clien's account profile:
            -Username :${user.username}
            -current Balance: ${user.balance.toFixed(2)} Euro

            Here is the most 20 recent transactions(newest First):${transactionListText || 'No transaction found.'}

            strict Rules:
            1:Always be polite, proffesssionall and freindly.
            2. Only answer financial or account-related questions based on the provided profile and transaction list above.
            3. If they ask about their balance or transaction history, refer to the numbers above.
            4. If they ask to make a transfer, politely guide them to use the "Transfer" tab on their screen.
            5. If they ask about things unrelated to their bank account, politely tell them that you can only help with account-related finance questions.
            `
            // call the askAi helper (sends everything to OpenAi)
            const botReply = await askAi(systemPrompt, message)

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
