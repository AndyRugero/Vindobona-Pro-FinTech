# Lesson 32: Connecting the Tracks (APIs, HTTP Methods, SQL & Spring Boot) 🚂🔗🔌

Welcome to the ultimate primer for tomorrow's backend study session! Before we dive into the keyboard, this guide will teach you the fundamental concepts of how data travels across the web, how databases store it, and how frameworks like Java Spring Boot run the show.

---

## 🍽️ The Waiter’s Playbook: APIs & HTTP Methods

In **Lesson 31**, we introduced the restaurant analogy:
* **Frontend (React)** = The Dining Room (where the user sits).
* **Backend (Server)** = The Kitchen (where data is managed).
* **API (Application Programming Interface)** = The Waiter (who carries messages back and forth).

To communicate, the Waiter uses a standardized language called **HTTP Methods** (also known as Verbs). Every request has an intent:

| HTTP Verb | Real-World Action | Database Meaning (CRUD) | Restaurant Equivalent |
| :--- | :--- | :--- | :--- |
| **`GET`** | Fetch / Read Data | **R**ead | "Bring me the menu" |
| **`POST`** | Add / Create Data | **C**reate | "Place a new order for a burger" |
| **`DELETE`** | Remove Data | **D**elete | "Take away the empty plate" |
| **`PUT` / `PATCH`** | Update Data | **U**pdate | "Change my order to fries instead" |

---

## ✉️ The Letter: How the Frontend uses `fetch()`

In React, when a user clicks **ADD TRANSACTION**, we need to send a letter containing that data to the server. We do this using the built-in browser tool called `fetch()`.

Here is a plain-English translation of how React communicates with the backend:

### 1. `GET` Request (Fetching Ledger Data)
We ask the server to send us all stored transactions:
```typescript
fetch('http://localhost:5000/api/transactions')
  .then(response => response.json()) // Translate the server response to JavaScript JSON
  .then(data => {
      setLedgerData(data); // Save the data in React memory (useState)
  });
```

### 2. `POST` Request (Adding a New Transaction)
We send a package containing the new transaction to the server:
```typescript
fetch('http://localhost:5000/api/transactions', {
  method: 'POST', // We specify we are adding data!
  headers: {
    'Content-Type': 'application/json' // Let the server know we are sending JSON
  },
  body: JSON.stringify({
    receiver: "Spotify Premium",
    amount: "-$10.99",
    category: "Music"
  }) // The package itself
})
.then(response => response.json())
.then(savedTransaction => {
    // Add the saved transaction to our React state
    setLedgerData(prev => [savedTransaction, ...prev]);
});
```

### 3. `DELETE` Request (Removing a Transaction)
We tell the server exactly which ID to delete:
```typescript
const idToDelete = "m1";

fetch(`http://localhost:5000/api/transactions/${idToDelete}`, {
  method: 'DELETE' // We specify we are deleting data!
})
.then(() => {
    // Remove it from our React state so the UI updates
    setLedgerData(prev => prev.filter(tx => tx.id !== idToDelete));
});
```

---

## 🗄️ The Vault: Databases & SQL

Up until now, you've saved data in `localStorage` or a local `data.json` file. While files are easy to read, they have a major limitation: they get incredibly slow if you have millions of transactions, and they can't handle multiple users saving at the exact same time.

That is why we use **Databases**. The gold standard for financial data is **SQL (Structured Query Language)**. 

### What is SQL?
Think of an SQL Database like a secure spreadsheet program (like Microsoft Excel) that only runs on the server. Instead of clicking cells, you write text commands (called **Queries**) to get or save data.

Here are the basic SQL queries that map to our HTTP requests:

```sql
-- 1. READ (GET): Give me all columns from the transactions table
SELECT * FROM transactions;

-- 2. CREATE (POST): Add a new transaction row to the table
INSERT INTO transactions (id, receiver, amount, category)
VALUES ('m3', 'Starbucks', -4.50, 'Groceries');

-- 3. DELETE (DELETE): Remove the transaction where the ID is 'm3'
DELETE FROM transactions WHERE id = 'm3';
```

---

## ☕ The Enterprise Engine: Spring Boot

You've heard of **Node.js/Express** (which uses JavaScript/TypeScript) and **Spring Boot** (which uses Java). Both do the exact same job (they are the "Kitchen" in our analogy), but they are used in different scenarios.

### Why do developers use Spring Boot?
* **Node.js/Express** is like a **speedboat**—lightweight, extremely fast to write, and perfect for startup apps.
* **Spring Boot (Java)** is like a **container ship**—heavy, extremely secure, highly structured, and the industry standard for banks, fintech giants, and enterprise applications. Java makes it almost impossible to write accidental type-errors, which is why financial institutions love it.

### How does Spring Boot handle requests?
In Spring Boot, you write Java classes called **Controllers**. A controller listens for HTTP requests (GET, POST, DELETE) and runs the corresponding Java code.

Here is a sneak peek of what a Spring Boot Controller looks like in Java:

```java
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    // 1. Listen for GET requests
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(); // Fetches all rows from the SQL database
    }

    // 2. Listen for POST requests
    @PostMapping
    public Transaction createTransaction(@RequestBody Transaction newTx) {
        return transactionRepository.save(newTx); // Saves new row to the SQL database
    }

    // 3. Listen for DELETE requests
    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable String id) {
        transactionRepository.deleteById(id); // Deletes the row by its ID
    }
}
```

---

## 🧠 Summary Cheat Sheet for Tomorrow

* **APIs & HTTP Verbs:** How React (Frontend) sends instructions to the Server (Backend).
  * `GET` = Fetch data
  * `POST` = Send new data
  * `DELETE` = Delete data
* **`fetch()`:** The native JavaScript function on the frontend used to make HTTP requests.
* **SQL:** The language servers use to talk to robust databases instead of saving to simple text/JSON files.
* **Spring Boot:** The enterprise-grade framework (written in Java) used by professional fintech apps to host secure, robust APIs.

**Tomorrow, we will connect all these pieces together! Let me know when you are rested and ready to roll!** 🚀💻🔋☕✨
