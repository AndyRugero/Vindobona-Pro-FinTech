# Lesson 53d Summary: Budget Tracking & Expense Alerts 📊⚠️

Welcome to the summary of **Lesson 53d** (Budget Tracking & Expense Alerts).

---

## 📍 Key Concepts Learned

### 1. Proactive Budget Limits
Instead of just showing historical transactions, a modern fintech app helps users save money. We let users set maximum spending thresholds (budgets) for categories like 'Food', 'Utilities', or 'Entertainment'.

### 2. Relational Database Budgets Schema
We create a dedicated database table `budgets` to store monthly caps:
```sql
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    category TEXT UNIQUE NOT NULL, -- Ensure one budget cap per category per user
    amount REAL NOT NULL,          -- Monthly cap (e.g., €300)
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

### 3. Expense Aggregation & Alert Triggers
When the user inserts a new expense:
1.  We check if there is an active budget set for that category.
2.  If a budget exists, we sum up all transaction expenses in that category for the current calendar month:
    ```sql
    SELECT SUM(amount) FROM transactions 
    WHERE user_id = ? AND category = ? AND is_negative = 1
    ```
3.  We check if `current_total + new_expense_amount > budget_limit`.
4.  If it exceeds the cap, we trigger an alert. In the API response, we flag this so the frontend can display a push warning.

---

## 🏗️ Action Plan for Lesson 53d

### Step 1: Create Database Schema Table (`server.js`)
*   Initialize the `budgets` table inside `initializeDatabase`.

### Step 2: Build the Budgets Route Router (`budgets.js`)
*   Create a router handling:
    *   `POST /api/budgets`: Set or update a category budget cap.
    *   `GET /api/budgets`: Fetch active budgets alongside progress metrics (e.g. current spent vs. limit).

### Step 3: Integrate Budget Alerts into Transaction Creation (`transactions.js`)
*   Update the transaction creation routes (`POST /api/transactions`) to calculate the spent total and return a warning flag in the response JSON:
    ```json
    {
      "id": "tx123",
      "amount": "-50",
      "category": "Food",
      "budgetWarning": {
        "exceeded": true,
        "spent": 320,
        "limit": 300
      }
    }
    ```
