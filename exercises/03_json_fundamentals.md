# Mastering JSON in TypeScript

JSON (**J**ava**S**cript **O**bject **N**otation) is the universal language of the web. Whenever your frontend talks to a backend, saves data to LocalStorage, or reads a configuration file, it is using JSON. 

Even though it looks like a JavaScript object, **JSON is just a text string**. To use it in a project, you must convert it back and forth between "Text String" and "Actual JavaScript Object".

---

## 1. The Core Logic: Parse and Stringify

There are only two built-in methods you need to master for JSON logic:

### A. `JSON.stringify()` - Object to String (Sending / Saving)
When you want to save your transactions to a database or LocalStorage, you cannot save a raw JavaScript object. You must convert it to a JSON string first.

```typescript
const myTransaction = {
    id: "1",
    amount: 50.00,
    category: "Food"
};

// EXERCISE 1: Turn the Object into a String
const jsonString = JSON.stringify(myTransaction);

// Result (Notice it is just a string of text now):
// '{"id":"1","amount":50,"category":"Food"}'

localStorage.setItem('my_data', jsonString); // Now it's safe to save!
```

### B. `JSON.parse()` - String to Object (Receiving / Loading)
When you load data from an API or LocalStorage, it arrives as a massive string. You must parse it back into a JavaScript object so you can use `.map()` or access properties like `data.amount`.

```typescript
// EXERCISE 2: Turn the String back into an Object
const loadedString = localStorage.getItem('my_data'); 
// loadedString is: '{"id":"1","amount":50,"category":"Food"}'

const parsedObject = JSON.parse(loadedString);

// Result (Now it's a real object!):
console.log(parsedObject.category); // Output: "Food"
```

---

## 2. JSON in TypeScript: The Missing Link (Types)

The biggest challenge with JSON in TypeScript is that **JSON has no types**. When you do `JSON.parse()`, TypeScript says the result is `any`. This destroys your auto-complete and type safety!

**The Architecture Rule:** Always define an `Interface` and manually cast your parsed JSON to that interface.

```typescript
// 1. Define your architecture contract
interface TransactionRecord {
    id: string;
    amount: number;
    category: string;
}

// 2. Parse the JSON and cast it using "as"
function loadTransactions(): TransactionRecord[] {
    const rawData = localStorage.getItem('ledger_data');
    
    if (!rawData) {
        return []; // Handle the case where nothing exists yet
    }

    try {
        // We tell TypeScript: "Trust me, this parsed string is an array of TransactionRecords"
        const parsedData = JSON.parse(rawData) as TransactionRecord[];
        return parsedData;
    } catch (error) {
        console.error("Failed to parse JSON", error);
        return [];
    }
}
```

---

## 3. Project Architecture: Where does JSON Logic go?

In a professional React/TypeScript project, you should **never** have `JSON.parse()` or `JSON.stringify()` scattered randomly inside your UI components (like `Dashboard.tsx`). 

Instead, use the **Service Layer Pattern**.

### Example Architecture
1. **`src/Interfaces/Interfaces.ts`**: Holds the TypeScript definitions for what your JSON *should* look like.
2. **`src/Services/StorageService.ts`**: This is the ONLY file allowed to touch `JSON.parse()` or `JSON.stringify()`. It handles all local storage and API calls.
3. **`src/Hooks/useTransactions.ts`**: Calls the `StorageService` to get clean data.
4. **`src/Components/Dashboard.tsx`**: Completely blind to JSON. It just uses the data provided by the hook.

```typescript
// src/Services/StorageService.ts

import { Transaction } from '../Interfaces/Interfaces';

export const StorageService = {
    
    // Save logic centralized here
    saveTransactions: (data: Transaction[]) => {
        const jsonString = JSON.stringify(data);
        localStorage.setItem("vindobona_ledger", jsonString);
    },

    // Load logic centralized here
    loadTransactions: (): Transaction[] => {
        const data = localStorage.getItem("vindobona_ledger");
        if (!data) return [];
        
        return JSON.parse(data) as Transaction[];
    }
};
```

> [!IMPORTANT]
> **What to focus on when learning JSON:**
> 1. Memorize that `stringify` makes strings (for saving) and `parse` makes objects (for reading).
> 2. Always wrap `JSON.parse()` in a `try/catch` block! If the JSON is corrupted, `.parse()` will crash your entire app.
> 3. Always apply a TypeScript `Interface` (using `as InterfaceName`) immediately after parsing so you get your auto-complete back.
