# Lesson 34: SQLite Database Integration (The Real Vault) 🗄️🔌⚡

Welcome to Lesson 34! Up until now, you've stored transactions in a plain JSON file. In this lesson, we will upgrade your Express backend to talk to a **real relational SQL database (SQLite)**.

---

## 1. Why SQLite? 🪶

Normally, databases like PostgreSQL or MySQL run as separate, complex server processes on your computer. 
**SQLite** is different: it is **serverless** and stores the entire database in a single local file (e.g., `database.db`) inside your project directory.
*   **Best for:** Local testing, mobile apps, and learning SQL without setting up complex database servers.
*   **How it works:** We write Javascript code that sends SQL commands to a library, which directly reads/writes to the `.db` file.

---

## 2. The Database Driver: `sqlite3` 🗣️

To allow Node.js to talk to the SQLite file, we install a database driver called **`sqlite3`**.
We also use a promise-based helper library called **`sqlite`** so we can write clean asynchronous code with `async / await`.

Run the following command in the **root project directory** to install them:
```bash
npm install sqlite sqlite3
```

### Opening a Connection:
```javascript
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Open the local database file (creates it if it doesn't exist!)
const db = await open({
    filename: './database.db',
    driver: sqlite3.Database
});
```

---

## 3. Creating tables on server start (DDL) 🏗️

When the server starts up, we want to make sure our `transactions` table exists. We execute a `CREATE TABLE IF NOT EXISTS` statement:

```javascript
await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        receiver TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT DEFAULT 'General',
        is_negative INTEGER NOT NULL,
        status TEXT DEFAULT 'Complete'
    )
`);
```

---

## 4. Running SQL Queries inside Express Routes (CRUD) 🚂

Instead of reading and writing files with `fs`, we run SQL queries:

### 📖 1. READ (GET):
```javascript
app.get('/api/transactions', async (req, res) => {
    // Select all rows from the database table
    const transactions = await db.all('SELECT * FROM transactions');
    res.json(transactions);
});
```

### ✍️ 2. CREATE (POST):
```javascript
app.post('/api/transactions', async (req, res) => {
    const { receiver, amount, category } = req.body;
    const newTx = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        receiver,
        amount,
        category: category || 'General',
        is_negative: amount.includes('-') ? 1 : 0,
        status: 'Complete'
    };

    // Run SQL INSERT statement to save to database
    await db.run(
        `INSERT INTO transactions (id, date, receiver, amount, category, is_negative, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [newTx.id, newTx.date, newTx.receiver, newTx.amount, newTx.category, newTx.is_negative, newTx.status]
    );

    res.status(201).json(newTx);
});
```

### 🗑️ 3. DELETE (DELETE):
```javascript
app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    
    // Run SQL DELETE query
    await db.run('DELETE FROM transactions WHERE id = ?', id);
    
    res.status(200).json({ message: `Transaction ${id} deleted` });
});
```

---

## 🏆 Your Next Steps

1.  **Warmup Quiz:** Review the concept of database drivers and SQLite queries.
2.  **Code Lab:** Install `sqlite` and `sqlite3`, open the database connection, and refactor `server.js` to run SQL statements instead of FileSystem read/writes!
