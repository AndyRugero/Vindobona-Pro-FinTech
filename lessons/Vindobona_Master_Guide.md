# 🏦 Vindobona Pro: The Master Architecture Guide

Welcome to your project's "Big Map." This document explains how the Vindobona FinTech dashboard is built, using your own "Storytelling" method and comparing it to **WPF / C#** concepts you already know.

---

## 1. The "Rosetta Stone" (C# vs React)

If you know WPF, you already know 90% of React. Here is how the names change:

| WPF / C# Concept | React / TypeScript Concept | Purpose |
| :--- | :--- | :--- |
| **Interface / DTO** | `interface` | The "Blueprint" for your data. |
| **Property + NotifyPropertyChanged** | `useState` | A variable that refreshes the screen when it changes. |
| **Service / ViewModel** | `Custom Hook (useTransactions)` | The "Brain" where logic and data live. |
| **XAML + Code-behind** | `.tsx` file (JSX) | The UI and the logic combined in one place. |
| **Action / Event** | `props (onAdd)` | How a child component talks back to its parent. |
| **string.Contains()** | `.includes()` | Checking if text exists inside another string. |

---

## 2. The 5 Main Characters (Files)

### 🔵 The Blueprint: `Interfaces.ts`
This is the rulebook. It defines exactly what a "Transaction" is.
```typescript
export interface Transaction {
    id: string;      // Unique ID
    date: string;    // Timestamp
    amount: string;  // "$50.00"
    category: string;// "Groceries"
    receiver: string;// "Amazon"
    isNegative: boolean; // Is it an expense?
}
```

### 🧠 The Brain: `useTransactions.ts` (The Hook)
This is the manager. It holds the "Vault" (List of transactions) and handles the saving.
*   **LedgerData**: The List (Variable).
*   **SaveNewEntry**: The Worker (Function).

### ⚡ The Specialist: `TransactionService.ts`
The Brain calls the Specialist for "heavy lifting" like guessing the category based on a name.
```typescript
// If name is "Netflix", specialist says "Entertainment"
const finalCategory = category || TransactionService.predictCategory(receiver);
```

### 🎬 The Conductor: `App.tsx` (The Main)
This is the "Boss." It connects the Brain to the UI elements.
```tsx
const { ledgerData, saveNewEntry } = useTransactions();

return (
    <>
        <TransactionForm onAdd={saveNewEntry} /> 
        <TransactionList transactions={ledgerData} />
    </>
);
```

### ⌨️ The Input: `TransactionForm.tsx`
The user types here. It captures the data using `onChange` and sends it to the Brain via the `onAdd` function.

---

## 3. The "Story" of a Transaction (The Flow)

Here is exactly what happens when you use the app:

1.  **Capture**: You type "Amazon" in the form. The `onChange` event instantly updates the `receiver` variable using `setReceiver`.
2.  **Submit**: You click the **ADD** button. This triggers `handleAdd`.
3.  **Handoff**: The form calls `onAdd(receiver, amount, category)`.
    *   *Note: The form doesn't know how to save! It just passes the data to the Boss (App.tsx).*
4.  **Process**: The Boss passes that data to the **Brain** (`saveNewEntry`).
5.  **Predict**: The Brain asks the **Specialist** to guess the category if it's empty.
6.  **Stamp**: The Brain creates a new object with a unique ID and a Date stamp.
7.  **Update**: The Brain updates the **Vault** (`ledgerData`).
8.  **Refresh**: React sees the Vault has changed and automatically tells the **List** (Table) to redraw itself on the screen.

---

## 4. Key Symbols to Remember
*   **`{ }`**: A single **Object** (One item with properties).
*   **`[ ]`**: A **List** (Many items in a row).
*   **`=>`**: A **Lambda/Arrow Function** (Like LINQ in C#).
*   **`useState`**: The "Smart Variable" that keeps the UI in sync.

---

*This document was created to help you master the bridge between C# and Web Development. Happy coding!*
