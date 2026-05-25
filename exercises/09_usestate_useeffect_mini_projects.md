# Master Guide: `useState` & `useEffect` + 3 Mini-Projects

Welcome back! In this guide, we break down React's two most important hooks—**`useState`** (The Memory) and ****`useEffect`**** (The Triggers)—in plain, simple English. We will also look at how they are used directly in your code, followed by **3 simple mini-projects** you can build to master them.

---

## Part 1: `useState` (The Memory)

### What is it in plain English?
Think of your React application like a person. If your app needs to **remember** something (like what the user typed in a textbox, whether a menu is open, or what transactions are in the list), it needs **memory**.

In React, **`useState`** is that memory.
* It gives you a **variable** to hold the current value (e.g., the current list of transactions).
* It gives you a **setter function** to change that value (e.g., to add a transaction). Whenever you use this setter function, React automatically "re-renders" (refreshes) the screen so the user immediately sees the change.

### Where is it in your code?
You use `useState` in several places to remember different things:

1. **Remembering the Current Screen/View:**
   * **File:** [App.tsx](file:///c:/Vindobona-Pro-FinTech/src/App.tsx#L15)
   * **Code:** `const [currentView, setCurrentView] = useState('dashboard');`
   * **Explanation:** It remembers if the user is looking at the `'dashboard'` or the `'import'` screen. When you call `setCurrentView('import')`, the screen changes.

2. **Remembering the Ledger Transactions:**
   * **File:** [TransactionContext.tsx](file:///c:/Vindobona-Pro-FinTech/src/Context/TransactionContext.tsx#L49)
   * **Code:** `const [ledgerData, setLedgerData] = useState<Transaction[]>(...);`
   * **Explanation:** It remembers the active list of transactions. When you add or delete a transaction, you call `setLedgerData`, which triggers the graph and ledger list to refresh.

3. **Remembering User Inputs in Forms:**
   * **File:** [TransactionForm.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/TransactionForm.tsx#L7-L10)
   * **Code:**
     ```typescript
     const [receiver, setReceiver] = useState('');
     const [amount, setAmount] = useState('');
     ```
   * **Explanation:** It remembers what the user is currently typing into the "Receiver" and "Amount" fields before they click **ADD**.

---

## Part 2: `useEffect` (The Side-Effects/Triggers)

### What is it in plain English?
If `useState` is the memory, **`useEffect`** is the **action trigger**. It tells React: *"Hey, whenever X changes, I want you to run this specific piece of code in the background."*

It is used for "side-effects"—actions that need to talk to things outside of the React UI, such as:
* Saving data to `localStorage`.
* Fetching data from a backend database or API.
* Setting up timers.

A `useEffect` has a **dependency array** at the end (inside the brackets `[...]`). React looks at this array to decide when to run the effect:
* `[ledgerData]` $\rightarrow$ "Run this code *only* when the `ledgerData` variable changes."
* `[]` (empty) $\rightarrow$ "Run this code *only once* when the page first loads."

### Where is it in your code?
You added a perfect example of `useEffect` in your context file to handle saving:

1. **Saving to LocalStorage Automatically:**
   * **File:** [TransactionContext.tsx](file:///c:/Vindobona-Pro-FinTech/src/Context/TransactionContext.tsx#L62-L64)
   * **Code:**
     ```typescript
     useEffect(() => {
         localStorage.setItem('ledgerData', JSON.stringify(ledgerData));
     }, [ledgerData]);
     ```
   * **Explanation:** This tells React: *"Every single time the `ledgerData` (memory) changes (because a transaction was added or deleted), run this code to save the updated list into `localStorage`."*

2. **Loading Data on Start (in your custom hook):**
   * **File:** [useTransactions.ts](file:///c:/Vindobona-Pro-FinTech/src/Hooks/useTransactions.ts#L18-L33)
   * **Code:**
     ```typescript
     useEffect(() => {
         const loadFromStorage = async () => { ... };
         loadFromStorage();
     }, []); // <--- Empty brackets!
     ```
   * **Explanation:** Because the brackets at the bottom `[]` are empty, this tells React: *"Run this code exactly once when the app first starts up to load the saved ledger from storage, and then never run it again."*

---

## Summary Checklist

| Hook | Purpose | Real-world Analogy |
| :--- | :--- | :--- |
| **`useState`** | Holds data that changes over time and updates the screen. | **A notepad** where you write down a number, erasing and updating it when it changes. |
| **`useEffect`** | Syncs your app with external systems (files, storage, APIs). | **A smart-home trigger** (e.g., *"If the door opens (`ledgerData` changes), turn on the lights (`localStorage.setItem` runs)"*). |

---

## Part 3: 3 Mini-Projects to Learn `useState` & `useEffect`

Here are 3 simple, complete projects you can copy, paste, and run in any React environment to see exactly how these two work together in harmony!

---

### Project 1: The Click Counter & Auto-Saver (Easy)
* **Goal:** A digital clicker that remembers its count even if you refresh the browser page.
* **How it works:** 
  1. We use `useState` to store the `count` (memory).
  2. We use a `useEffect` to watch the `count`. Every time it changes, it saves it to `localStorage`.
  3. We initialize the state by reading from `localStorage` first, so it never forgets your clicks!

```tsx
import React, { useState, useEffect } from 'react';

export default function ClickCounter() {
  // 1. Initial State: Read from localStorage first, fallback to 0 if empty
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('click_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // 2. The Trigger: Save count to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('click_count', count.toString());
  }, [count]); // <--- Runs whenever `count` changes

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h2>Counter & Auto-Saver</h2>
      <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{count}</p>
      
      <button 
        onClick={() => setCount(count + 1)} 
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        Click Me!
      </button>
      
      <button 
        onClick={() => setCount(0)} 
        style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#ef4444', color: 'white', border: 'none' }}
      >
        Reset
      </button>
      <p style={{ color: '#64748b' }}>Try clicking a few times, then refresh the page!</p>
    </div>
  );
}
```

---

### Project 2: The Digital Clock & Timer (Medium)
* **Goal:** A live clock that displays the exact time, updating every single second.
* **How it works:**
  1. We use `useState` to store the current time (`time`).
  2. We use `useEffect` on **mount** (using empty brackets `[]`) to start a browser clock interval (`setInterval`).
  3. Every second, the interval updates the `time` state.
  4. **Crucial:** We return a **cleanup function** inside the `useEffect` to clear the interval when the component is closed. This prevents browser slow-downs (memory leaks).

```tsx
import React, { useState, useEffect } from 'react';

export default function LiveClock() {
  // 1. Memory: Stores the current time string
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // 2. Trigger: Set up an interval when the component first appears
  useEffect(() => {
    console.log("Clock Mounted!");
    
    const intervalId = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000); // Updates every 1000ms (1 second)

    // 3. Cleanup: Clears the interval when the component closes/unmounts
    return () => {
      console.log("Clock Cleaned Up!");
      clearInterval(intervalId);
    };
  }, []); // <--- Empty brackets means run EXACTLY ONCE on page load

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', textAlign: 'center', backgroundColor: '#0f172a', color: '#38bdf8', borderRadius: '12px', width: '250px', margin: '20px auto' }}>
      <h3>LIVE CLOCK</h3>
      <h1 style={{ margin: '10px 0' }}>{time}</h1>
    </div>
  );
}
```

---

### Project 3: The Crypto Price Tracker (Advanced)
* **Goal:** A dashboard card that fetches the latest Bitcoin price from a live API, displays it, and features a manual "Refresh" button.
* **How it works:**
  1. We use `useState` to store the `price`, whether we are currently `loading`, and a `refreshTrigger` number.
  2. We use `useEffect` which has `[refreshTrigger]` in its dependency array. 
  3. Inside the effect, we fetch data from a public API. When the data arrives, we save it to the price state and set loading to false.
  4. Clicking the "Refresh" button simply changes the `refreshTrigger` (e.g. `refreshTrigger + 1`), which forces the `useEffect` to run and fetch the fresh price!

```tsx
import React, { useState, useEffect } from 'react';

export default function CryptoTracker() {
  const [price, setPrice] = useState<string>('0.00');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Trigger: Runs on load, and runs again EVERY time refreshTrigger changes!
  useEffect(() => {
    setLoading(true);
    
    // Fetch live Bitcoin price from a free, public API
    fetch('https://api.coindesk.com/v1/bpi/currentprice.json')
      .then((res) => res.json())
      .then((data) => {
        const usdPrice = data.bpi.USD.rate;
        setPrice(usdPrice);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API error", error);
        setPrice('Error Loading');
        setLoading(false);
      });
  }, [refreshTrigger]); // <--- Runs when the refresh button updates this number!

  return (
    <div style={{ padding: '25px', fontFamily: 'sans-serif', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '12px', width: '300px', margin: '20px auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <h4 style={{ color: '#64748b', margin: 0 }}>BITCOIN PRICE (USD)</h4>
      {loading ? (
        <h2 style={{ color: '#eab308' }}>Fetching live data...</h2>
      ) : (
        <h2 style={{ fontSize: '32px', margin: '15px 0', color: '#10b981' }}>${price}</h2>
      )}

      <button 
        onClick={() => setRefreshTrigger(prev => prev + 1)}
        style={{ padding: '10px 16px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer' }}
      >
        🔄 Refresh Price
      </button>
    </div>
  );
}
```
