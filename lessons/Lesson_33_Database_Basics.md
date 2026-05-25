# Lesson 33: Database Basics (The Ultimate Vault) 🗄️🛡️

Welcome to Database Basics! You've built an amazing Frontend (the dashboard) and learned how APIs (the waiters) move data around. But where does the data actually live permanently? 

**Enter the Database.**

---

## 1. What is a Database? 🤔

In the real world, if you have a few receipts, you might keep them in a **shoebox**. But if you are a massive bank with millions of transactions per second, a shoebox won't work. You need a highly organized, secure, fireproof **Vault**.

*   **JSON/Text Files (The Shoebox):** Great for learning, but they are slow, easily corrupted, and can only handle one person writing to them at a time.
*   **Databases (The Vault):** Built to handle millions of records instantly, incredibly secure, and can handle thousands of users making changes at the exact same millisecond.

---

## 2. The Two Main Types of Databases ⚖️

Databases are generally split into two families. Knowing the difference is the hallmark of a great developer!

### 🏗️ Relational (SQL) - The Organized Spreadsheet
Think of an Excel spreadsheet. Everything has strict columns and rows. It is highly organized and strict.
*   **Best for:** Financial apps, banking, e-commerce (where data structure NEVER changes unpredictably).
*   **How it works:** Data is stored in **Tables** (like a `Users` table and a `Transactions` table). These tables are "related" to each other (e.g., Transaction #123 belongs to User #5).
*   **Famous Software:** PostgreSQL, MySQL, Oracle, Microsoft SQL Server.
*   **The Language:** We use **SQL** (Structured Query Language) to talk to it.

### 📦 Non-Relational (NoSQL) - The Flexible Filing Cabinet
Think of a filing cabinet where you just throw folders in. Some folders have 2 pages, some have 50. It's extremely flexible.
*   **Best for:** Social media posts, chat messages, rapid startups, gaming leaderboards.
*   **How it works:** Data is stored as **Documents** (usually looking exactly like JSON objects!). You don't need strict columns.
*   **Famous Software:** MongoDB, Firebase, DynamoDB.
*   **The Language:** Varies, but usually JavaScript-like commands.

*For a FinTech app like **Vindobona Pro**, SQL (Relational) is the industry standard because money requires strict rules!*

---

## 3. The 4 Magic Words: C.R.U.D. 🪄

No matter how complex a database is, 99% of what you do with it boils down to four actions. We call this **CRUD**:

1.  **C**reate (Add a new transaction)
2.  **R**ead (Get all transactions for the dashboard)
3.  **U**pdate (Change a transaction amount from $10 to $15)
4.  **D**elete (Remove a transaction you accidentally added)

---

## 4. SQL: Talking to the Database 🗣️

Let's look at how we write SQL to perform CRUD actions on a `transactions` table. It reads almost like plain English!

### 📖 Read (GET)
*I want to see all my transactions:*
```sql
SELECT * FROM transactions;
```
*I only want to see Groceries:*
```sql
SELECT * FROM transactions WHERE category = 'Groceries';
```

### ✍️ Create (POST)
*I want to add a new Spotify transaction:*
```sql
INSERT INTO transactions (id, receiver, amount, category)
VALUES ('m8', 'Spotify', -10.99, 'Music');
```

### ✏️ Update (PUT/PATCH)
*I made a mistake, Spotify is actually $12.99:*
```sql
UPDATE transactions 
SET amount = -12.99 
WHERE id = 'm8';
```

### 🗑️ Delete (DELETE)
*I want to delete that Spotify transaction entirely:*
```sql
DELETE FROM transactions WHERE id = 'm8';
```

---

## 5. Primary Keys & Foreign Keys (The Secret Sauce) 🔑

How does a database know exactly which transaction belongs to which user? 

*   **Primary Key (PK):** A unique ID for every single row. No two transactions can have the same ID. (Just like a Social Security Number or Passport Number).
*   **Foreign Key (FK):** A column in the `transactions` table that holds the Primary Key of a `user`. 

**Example:**
If Andy is User `#1` in the **Users Table**. 
The **Transactions Table** will have a column called `user_id`. Every transaction Andy makes will have `user_id = 1`. This creates the **Relation** in a Relational Database!

---

## 🏆 Your Next Steps

1.  **Review this guide:** Make sure you understand the difference between SQL and NoSQL, and what CRUD stands for.
2.  **The API Connection:** In the next lesson, we will see how your Node.js server actually runs these SQL commands when React sends a `fetch()` request!
3.  **Prepare the Tools:** In the next lesson, we will be installing the database packages:
    ```bash
    # In the root project directory:
    npm install sqlite sqlite3
    ```
