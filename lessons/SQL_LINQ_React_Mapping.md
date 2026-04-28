# 🗄️ Querying Data: SQL, LINQ, and React

When building applications, you constantly need to query, filter, and transform lists of data. Depending on where you are working, the terminology changes, but the core concepts remain exactly the same.

---

## 1. The SQL Basics in C# (LINQ)

**SQL** (Structured Query Language) is used for databases. **LINQ** (Language Integrated Query) is how C# allows you to write SQL-like commands directly on a `List<T>`.

| The Goal | SQL Concept | C# LINQ Concept | JavaScript / React Concept |
| :--- | :--- | :--- | :--- |
| **Get specific items** | `WHERE` | `.Where()` | `.filter()` |
| **Transform the data** | `SELECT` | `.Select()` | `.map()` |
| **Sort the data** | `ORDER BY` | `.OrderBy()` | `.sort()` |

### C# LINQ Example:
```csharp
// "Select the names of all users who are over 18"
var adultNames = users
    .Where(u => u.Age >= 18)  // The Filter (SQL WHERE)
    .Select(u => u.Name)      // The Transform (SQL SELECT)
    .ToList();
```

---

## 2. Five Examples of `.filter()` (The SQL `WHERE` clause)

In React, `.filter()` is used to create a new list containing only the items that pass a true/false test.

**1. Finding only Income (Filtering by boolean)**
```typescript
// Keep only transactions where isNegative is false
const onlyIncome = ledgerData.filter(tx => tx.isNegative === false);
```

**2. Deleting an Item (Filtering out a specific ID)**
```typescript
// Keep everything EXCEPT the one with ID "5" (This deletes ID 5!)
const listAfterDelete = ledgerData.filter(tx => tx.id !== "5");
```

**3. Searching by Text (Filtering by string matching)**
```typescript
// Keep only transactions where the receiver name includes "Amazon"
const amazonPurchases = ledgerData.filter(tx => tx.receiver.includes("Amazon"));
```

**4. Filtering by Threshold (Math)**
```typescript
// Keep only items that cost more than 100
const expensiveItems = ledgerData.filter(tx => tx.amount > 100);
```

**5. Filtering by Category (Exact Match)**
```typescript
// Keep only groceries
const groceries = ledgerData.filter(tx => tx.category === "Groceries");
```

---

## 3. Five Examples of `.map()` (The SQL `SELECT` clause)

In React, `.map()` is used to transform every single item in a list into something else. In React, we use it almost exclusively to turn **Data** into **UI Elements**.

**1. Transforming Data to UI Components (The most common React pattern!)**
```tsx
// Turn a list of strings into a list of HTML <li> tags
const uiList = ["Apple", "Banana"].map(fruit => <li>{fruit}</li>);
```

**2. Extracting specific fields (Just like SQL SELECT Name FROM Users)**
```typescript
// Extract just the receiver names from the full transaction objects
const justNames = ledgerData.map(tx => tx.receiver); 
// Result: ["Amazon", "BILLA AG", "Netflix"]
```

**3. Formatting Data**
```typescript
// Add a dollar sign to an array of raw numbers
const formattedMoney = [5, 10, 20].map(num => "$" + num);
// Result: ["$5", "$10", "$20"]
```

**4. The Component Generator (How your TransactionList works)**
```tsx
// Turn a list of raw data objects into fully styled React Components
const rows = ledgerData.map(tx => (
    <TransactionRow key={tx.id} data={tx} />
));
```

**5. Modifying a specific item in a List (Updating)**
```typescript
// Look at every task. If the ID is 3, change it to "Done". Otherwise, leave it alone.
const updatedTasks = tasks.map(task => {
    if (task.id === 3) {
        return { ...task, isDone: true };
    }
    return task;
});
```

---

### 💡 Summary:
*   Use **`.filter()`** when you want your list to become **smaller** (Searching, Deleting).
*   Use **`.map()`** when you want your list to stay the exact same size, but you want to **transform** the items inside it (Data -> UI).
