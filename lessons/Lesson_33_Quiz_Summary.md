# 🏆 Lesson 33: Quiz Summary & Study Guide

Congratulations on completing **Lesson 33: Database Basics**! Below is a personalized summary of your quiz answers, ratings, and key takeaways from our interactive session.

---

## 📈 Your Quiz Performance

*   **Step 1: SQL vs. NoSQL**
    *   **Question:** Which database type would you choose for a core bank ledger?
    *   **Your Answer:** `SQL`
    *   **Rating:** ⭐⭐⭐⭐⭐ (5/5 Stars)
    *   **Key Concept:** FinTech apps require **schemas** (strict rules) and transactional consistency. SQL databases prevent letters from being written in number columns and link accounts together safely.

*   **Step 2: CRUD & HTTP Mapping**
    *   **Question:** What HTTP Verb and SQL Command are used when editing a transaction's category?
    *   **Your Answer:** `UPDATE` / `PUT/PATCH`
    *   **Rating:** ⭐⭐⭐⭐⭐ (5/5 Stars)
    *   **Key Concept:** Modifications map to `PUT`/`PATCH` requests in React APIs, which translate to `UPDATE` commands in the SQL database.

*   **Step 3: Primary Keys vs. Foreign Keys**
    *   **Question:** Which key maps a Bank Account to the Customer table?
    *   **Your Answer:** `Foreign Key`
    *   **Rating:** ⭐⭐⭐⭐⭐ (5/5 Stars)
    *   **Key Concept:** A **Primary Key (PK)** is a unique ID for a record in a table. A **Foreign Key (FK)** in another table references that ID to create the relationship.

---

## 🗺️ The Ultimate Full-Stack CRUD Map

Use this cheat sheet to map React actions to HTTP methods and database actions:

| Operation | Action in React | HTTP Verb | SQL Query Keyword |
| :--- | :--- | :--- | :--- |
| **C**reate | User adds a transaction | `POST` | `INSERT INTO ...` |
| **R**ead | Dashboard fetches transaction list | `GET` | `SELECT ...` |
| **U**pdate | User edits transaction details | `PUT` / `PATCH` | `UPDATE ...` |
| **D**elete | User clicks the trash icon | `DELETE` | `DELETE FROM ...` |

---

## 💡 Key Terms to Remember

1.  **ACID Compliance:** The database standard that guarantees all transactions are processed reliably (meaning no money gets "lost" in a system crash). Relational SQL databases excel at this.
2.  **Schema:** The strict layout/ruleset of a database table (e.g., Column 1 must be a Date, Column 2 must be Text, Column 3 must be a Decimal).
3.  **One-to-Many Relationship:** A connection where one record in Table A (e.g., 1 User) can relate to multiple records in Table B (e.g., 10 Transactions).

*This file was saved as a personal study guide for your learning records.* 💾🎓🦾
