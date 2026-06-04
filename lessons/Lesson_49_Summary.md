# Lesson 49: Database Integrity & ACID Transactions 🏦⚖️

Welcome to Lesson 49! Now that our backend is safely containerized, we must look at how data is written to our database. 

In professional banking systems, transaction errors cannot happen. If a user transfers money, the money must either arrive fully at the destination or be returned completely to the sender. This lesson covers **SQL Transactions** and **ACID compliance**.

---

## 1. What are SQL Transactions? ✉️

### 🗺️ The Analogy:
Imagine you want to mail a birthday card containing a **€50 note** and a **letter** to your sibling:
- **Without a transaction (Loose items):** You throw the loose bill and the letter into the mailbox. The letter arrives, but the cash falls out on the way. You have lost €50, and your sibling is disappointed.
- **With a transaction (The Envelope):** You put both the letter and the €50 inside a single **secure envelope** ✉️, seal it, and mail it. Either the entire envelope arrives with all contents, or the post office returns the sealed envelope to you because the address was wrong. It is "all-or-nothing."

In databases, a **SQL Transaction** is that secure envelope. It groups multiple SQL queries together. Either all queries succeed and are saved (`COMMIT`), or if one fails, the database undoes everything (`ROLLBACK`).

---

## 2. What is ACID Compliance? 🔬
Banks require databases to follow the **ACID** security properties:

1. **Atomicity (All-or-Nothing):** 
   - A transaction cannot be divided. Either all SQL updates happen, or none do.
2. **Consistency (Data Integrity):**
   - The database remains valid. Balance rules (e.g. balances cannot be negative, or total money must remain equal) are never broken.
3. **Isolation (Privacy):**
   - If two users transfer money at the same millisecond, the database runs them separately so they don't corrupt each other's accounts.
4. **Durability (Permanence):**
   - Once a transaction is successfully written, the data is saved to disk and will not be lost even if the power cuts out immediately after.

---

## 3. Core SQL Transaction Queries 💾

To run a transaction, Express uses these three SQL commands:

```sql
-- 1. Open the transaction envelope
BEGIN TRANSACTION;

-- 2. Execute the queries (subtract from A, add to B, write transfer log)
UPDATE users SET balance = balance - 100 WHERE id = 1;
UPDATE users SET balance = balance + 100 WHERE id = 2;
INSERT INTO transactions (sender_id, receiver_id, amount) VALUES (1, 2, 100);

-- 3. If ALL succeeded: seal the envelope and save permanently
COMMIT;

-- 4. If ANY failed: shred the envelope and undo everything
ROLLBACK;
```

---

## 🏗️ Lesson 49 Action Plan

We will implement this secure transaction logic in **3 steps**:

### 🛠️ Step 1: Create backend transfer route
Write a new POST endpoint `/api/transactions/transfer` that opens a transaction database connection.

### 🛠️ Step 2: Implement balance safety checks
Verify that the sender has enough money before subtracting, and verify that the receiver's account exists.

### 🛠️ Step 3: Verify the Rollback
Write a test query with a typo to intentionally fail the transfer halfway through. Verify that the sender's balance does **not** change, proving the `ROLLBACK` works!
