# Lesson 49 Explanation: Database Integrity & ACID Transactions 🏦⚖️

In this explanation, we document how we implemented secure database transactions in our backend to protect financial operations, prevent money from vanishing, and ensure enterprise compliance.

---

## 📍 1. Real-World Analogies for Transactions

To understand database transactions, we use these two models:

### ✉️ The Secure Envelope Analogy (How transactions write)
*   **The Problem:** You want to send a €50 cash note and a handwritten card to your sibling. If you drop the cash and the card separately into the mailbox, the card might arrive but the cash could fall out. You lose €50 and your sibling is disappointed.
*   **The Solution:** You put both the card and the cash inside a single **secure envelope** ✉️, seal it, and mail it. The envelope either arrives with *both* items intact, or the post office returns the sealed envelope to you unopened. It is completely "all-or-nothing."
*   **The Mapping:**
    *   **The Envelope** = `BEGIN TRANSACTION` (opens tracking).
    *   **The Letter & Cash** = SQL queries (debiting and crediting).
    *   **Sealing & Shipping** = `COMMIT` (permanent save).
    *   **Shredding the envelope** = `ROLLBACK` (undo everything on error).

---

## 📍 2. What is ACID Compliance? 🔬

Banks require database transactions to follow the **ACID** standards of reliability:

1.  **Atomicity (All-or-Nothing):**
    *   A transaction cannot be divided. Either *all* balance updates and history logs write successfully, or *none* do. If one fails, the entire transaction rolls back.
2.  **Consistency (Data Integrity):**
    *   The database remains valid before and after. Total bank balances must match, and balance values cannot break rules (e.g., negative balances).
3.  **Isolation (Concurrency):**
    *   If two transactions happen at the same millisecond, they run in isolation so they do not corrupt each other's calculations.
4.  **Durability (Permanence):**
    *   Once a transaction is committed, it is written directly to the hard drive (`database.db`) and will not be lost even if the server immediately loses power.

---

## 📍 3. Code Implementation Walkthrough

We wrote the secure `/transfer` route in [transactions.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/transactions.js):

### Step 1: Safety & Balance Checks
Before touching any money, we verify the target account exists and the sender has a sufficient balance:
```javascript
// A. Locate the receiver
const receiver = await db.get(
    'SELECT id, username FROM users WHERE LOWER(username) = ?',
    receiverUsername.trim().toLowerCase()
);
if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

// B. Fetch sender balance
const sender = await db.get('SELECT balance FROM users WHERE id = ?', senderId);
if (sender.balance < transferAmount) {
    return res.status(400).json({ error: 'Insufficient balance' });
}
```

### Step 2: The SQL Transaction Envelope
We wrap all database modifications inside a `try-catch` block:
```javascript
try {
    // 1. Open the envelope
    await db.run('BEGIN TRANSACTION');

    // 2. Subtract from sender
    await db.run('UPDATE users SET balance = balance - ? WHERE id = ?', [transferAmount, senderId]);

    // 3. Add to receiver
    await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [transferAmount, receiver.id]);

    // 4. Log transactions for history timelines
    await db.run('INSERT INTO transactions ...'); // Outgoing log
    await db.run('INSERT INTO transactions ...'); // Incoming log

    // 5. Seal envelope (Commit)
    await db.run('COMMIT');
} catch (error) {
    // 6. Shred envelope (Rollback)
    await db.run('ROLLBACK');
}
```

---

## 📍 4. Rollback Verification Test

To prove the database is ACID compliant, we conducted a manual verification:
1.  We introduced a typo into the receiver's query: `UPDATE users_typo SET...`
2.  We triggered a transfer. SQLite successfully subtracted money from the sender, but crashed on the typo line.
3.  The backend caught the error and ran `ROLLBACK`.
4.  We queried the database and verified the sender's balance was **not** changed, proving the rollback successfully protected the funds!
5.  We reverted `users_typo` back to `users` to restore functionality.

---

## 📍 5. Banking Interview Questions

Here are the questions Viennese bank technical interviewers ask about this topic:

*   **Question:** *"What is the difference between `COMMIT` and `ROLLBACK`?"*
    *   **Answer:** *"COMMIT makes all temporary changes permanent in the database database.db file. ROLLBACK discards all database changes made since the transaction started, restoring the tables to their original state."*
*   **Question:** *"How does your application prevent double-spending or money disappearing during a transfer?"*
    *   **Answer:** *"I use SQL Transactions (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`). I group the sender debit, receiver credit, and transaction logging into one single transaction block. If any query crashes, the ROLLBACK automatically reverts all previous queries in that block."*
*   **Question:** *"What database isolation level does SQLite default to?"*
    *   **Answer:** *"SQLite defaults to Serialized transaction isolation, which guarantees that transactions behave as if they were run one after the other, protecting concurrency issues."*
