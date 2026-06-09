# Budget Tracking & Future Graphs Guide 📊💰

This guide is a friendly reminder of how our budget system is designed and how you can use this database foundation to build beautiful visual graphs in the future.

---

## 📍 1. Why do we need the `budgets` table?
The `budgets` table is the **permanent memory** for our users' budget rules. Without it, the application would forget their budget settings every time the server restarts.

### The Database Structure:
Our SQLite database stores a row for every budget a user sets:
*   `user_id`: Identifies which user owns this budget limit.
*   `category`: The category they want to limit (e.g., `'Groceries'`, `'Restaurants'`, `'Entertainment'`).
*   `amount`: The maximum spending limit for the month (e.g., `300.00`).

---

## 📍 2. How Budget Tracking Works (Step-by-Step)

```
[User Sets Limit] ➡️ [User Spends Money] ➡️ [Server Calculates] ➡️ [Warning/Progress Alert]
```

1.  **Setting the Limit:** The user inputs their monthly cap (e.g., €150 for 'Restaurants'). The server saves this rule in the `budgets` table.
2.  **Tracking Purchases:** When the user makes a new purchase, the server checks the `transactions` table to sum up how much they spent in that category *this month*.
3.  **Real-Time Warnings:** If a new transaction pushes their total spending past their set budget limit, the server outputs a warning flag (`budgetWarning: true`) so the frontend can alert the user.

---

## 📍 3. Future Plan: Drawing Budget Graphs 📉

By saving both the **budget limit** and the **actual transactions** in the database, you have the exact data needed to draw premium graphs later!

### 📊 Graph idea 1: "Budget vs. Actual" Bar Chart
Compare what the user *planned* to spend against what they *actually* spent.

*   **How it works:**
    *   For each category, you draw two bars side-by-side.
    *   **Bar A (Limit):** Fetched from the `budgets` table (e.g., €300).
    *   **Bar B (Spent):** Calculated by summing transactions in that category (e.g., €260).
*   **Visual mockup:**
    ```
    Groceries   [█████████████] €300 Budget Limit
                [███████████░░] €260 Actual Spent (Groceries)
    
    Restaurants [███████] €150 Budget Limit
                [████████████!] €180 Actual Spent (Over Budget!)
    ```

### 📈 Graph idea 2: "Day-by-Day Spending" Line Chart
Track spending progression over the course of a 30-day month.

*   **How it works:**
    *   **The Target Line (Flat):** A straight red line running horizontally across the graph showing the limit (e.g. €300).
    *   **The Spend Line (Climbing):** A line starting at €0 on Day 1, climbing higher each time a purchase is made.
*   **Visual mockup:**
    ```
    Amount
     €300 ----------------------- [Red Budget Limit Line]
     €200            .-'
     €100         .-'   <-- [Blue Actual Spending Line climbs over time]
       €0  .-'-'-'
          Day 1      Day 15      Day 30
    ```

---

## 📍 4. Frontend Integration Tips (For Later)
When you are ready to build the graphs:
1.  Use a React library like **Recharts** or **Chart.js**.
2.  Call your backend endpoint `GET /api/budgets` to get the list of budgets and their current progress.
3.  Pass that data array directly into your chart component to render the visuals automatically!
