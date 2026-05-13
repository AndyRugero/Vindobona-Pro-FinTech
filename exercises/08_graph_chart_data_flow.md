# Graph Chart Data Flow & Architecture

As we wrap up Lesson 25 and move toward building a **Graph Chart** (like a Line Chart showing your Cash Flow over time), it's crucial to understand how the data flows from raw storage all the way up to the visual UI.

Professional React apps separate "Thinking" (Logic) from "Drawing" (UI components). Here is the exact architecture and flow we will use.

---

## 1. The 4-Step Data Flow

When a user opens the dashboard, the data makes 4 stops before the graph is drawn.

### Stop 1: Storage (The Vault)
*   **Where:** `LocalStorage` (or a Database later).
*   **What it does:** Holds the raw, messy JSON string of all your historical transactions.

### Stop 2: The Hook (`useTransactions.ts`)
*   **What it does:** It pulls the raw JSON string out of storage, uses `JSON.parse()` to turn it into an array of Javascript Objects, and saves them into a React State variable (`ledgerData`).
*   *Pattern Used:* Custom React Hooks for centralized state management.

### Stop 3: The Logic Layer (`AnalyticLogic.ts`)
*   **What it does:** Raw transaction objects are useless to a graph. We need a new function (e.g., `prepareGraphData()`) that uses `.reduce()` to group transactions by **Date** instead of Category.
*   *Pattern Used:* Pure Functions. It takes messy data in, and spits clean chart data out.

### Stop 4: The UI Component (`CashFlowGraph.tsx`)
*   **What it does:** It takes the clean data from Step 3 and literally just draws the lines on the screen using the `Recharts` library. It does NO math.
*   *Pattern Used:* Presentational Components (Dumb Components).

---

## 2. The Core Logic Pattern (Grouping by Date)

For the Pie Chart, we grouped things by `tx.category`. For a Line Graph showing trends over time, we must group things by `tx.date`.

Recharts expects an array that looks like this:
```json
[
  { "date": "2024-05-10", "income": 3000, "expenses": 50 },
  { "date": "2024-05-11", "income": 0, "expenses": 120 }
]
```

### The Logic We Will Build:
1.  **Loop:** `transactions.forEach()`
2.  **Check Dictionary:** If `dateMap["2024-05-10"]` doesn't exist, create it: `{ income: 0, expenses: 0 }`.
3.  **Sort:** If the transaction is negative, add the amount to `expenses`. If it's positive, add it to `income`.
4.  **Map:** Use `Object.keys()` to turn the dictionary back into an array for Recharts.

---

## 3. The Recharts UI Pattern

Once `AnalyticLogic.ts` hands the clean data to the UI, the component structure will look very similar to the Pie chart, but with X and Y axes.

```tsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={cleanGraphData}>
    {/* XAxis reads the 'date' property from our objects */}
    <XAxis dataKey="date" /> 
    
    <Tooltip />
    <Legend />
    
    {/* We draw TWO lines! One for income, one for expenses */}
    <Line type="monotone" dataKey="income" stroke="#10b981" />
    <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
  </LineChart>
</ResponsiveContainer>
```

> [!IMPORTANT]
> **The Golden Rule for this Lesson:** 
> Do **NOT** put `.map()`, `.reduce()`, or math inside your `LineChart` component. 
> 
> Your `AnalyticLogic.ts` file is the "Chef" preparing the meal in the kitchen. Your `CashFlowGraph.tsx` file is just the "Waiter" putting the finished plate on the table. Keep them strictly separated!
