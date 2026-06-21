const db = require('./backend/server/utils/db');

async function promote() {
    try {
        await db.connect();
        // Update all accounts to admin status for local development
        await db.run("UPDATE users SET role = 'admin'");
        console.log("🛡️ Success: All accounts in your local database are now ADMINS!");
    } catch (err) {
        console.error("Failed to update database:", err);
    }
}

promote();
