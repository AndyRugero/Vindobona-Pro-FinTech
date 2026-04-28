# 💾 Lesson 15: Saving Data (JSON & LocalStorage)

In this lesson, we learn how to make our data persist (save permanently) so it doesn't disappear when we refresh the page.

---

## 1. The Concept: Serialization (JSON)

In C#, you cannot directly save a `List<Transaction>` to a text file. You must convert it to a string format first (often using `Newtonsoft.Json`). In JavaScript, this is built-in and uses **JSON** (JavaScript Object Notation).

*   **To Save (List -> String)**: `JSON.stringify(data)`
    *   *C# Equivalent*: `JsonConvert.SerializeObject(data)`
*   **To Load (String -> List)**: `JSON.parse(stringData)`
    *   *C# Equivalent*: `JsonConvert.DeserializeObject(stringData)`

---

## 2. The Storage: Local Storage

Web browsers aren't allowed to write `.txt` files to your hard drive for security reasons. Instead, the browser provides a mini key-value database called `localStorage`.

*   **Save**: `localStorage.setItem('save_slot_name', stringData);`
    *   *C# Equivalent*: `File.WriteAllText("save.txt", stringData)`
*   **Load**: `localStorage.getItem('save_slot_name');`
    *   *C# Equivalent*: `File.ReadAllText("save.txt")`

---

## 3. The Watcher: `useEffect`

In WPF, you might trigger a save on a `Button_Click` or `PropertyChanged` event. In React, we use a hook called `useEffect`. 

`useEffect` is a background worker that "watches" variables. We tell it: *"Whenever `ledgerData` changes, run this save function."*

```typescript
// The React way to auto-save
useEffect(() => {
    // 1. Convert to string
    const stringData = JSON.stringify(ledgerData);
    
    // 2. Save to browser memory
    localStorage.setItem('vindobona_save', stringData);
    
}, [ledgerData]); // <--- The [Dependency Array]. It tells React WHAT to watch.
```

---

## 4. The Implementation Steps
When implementing this in `useTransactions.ts`, we need to do two things:
1.  **Modify `useState`** to check `localStorage` when the app first loads, instead of starting with hardcoded dummy data.
2.  **Add `useEffect`** to automatically `JSON.stringify` and save the data every time a new transaction is added.

---

## 🏆 Project Milestone: Where are we now?

**What the web app can do after Lesson 15:**
*   You can type in an income or expense, and it appears in the list.
*   The "Brain" (`useTransactions`) automatically calculates your total balance, income, and expenses using the data.
*   **Crucially:** You can refresh the page, close your browser, or restart your computer, and your financial data will still be there because we are saving it to `localStorage` using JSON.

**What the web app will do after Lesson 16:**
*   Right now, if you make a typo or enter a fake transaction, it is stuck there forever! 
*   After Lesson 16, you will be able to click a **"Delete"** button next to any transaction to permanently remove it from your ledger and recalculate your totals instantly.
