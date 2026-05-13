# Data Transformation Exercises for Pie Charts

When building charts (like a Pie Chart in Recharts), you almost always need to transform your raw transaction data into a format the chart can understand. Usually, a Pie Chart wants an array of objects that looks like this:
`[{ name: 'Food', value: 400 }, { name: 'Rent', value: 1200 }]`

Here are three examples of how to use **filter**, **map**, and **reduce** to achieve this!

---

## 1. `filter()` - Removing Data You Don't Need
The `filter` method creates a *new array* containing only the items that pass a test. 

**Scenario:** A Pie Chart showing expenses shouldn't include income. We need to filter out positive transactions.

```typescript
const allTransactions = [
    { id: '1', category: 'Food', amount: 50, isNegative: true },
    { id: '2', category: 'Salary', amount: 3000, isNegative: false },
    { id: '3', category: 'Transport', amount: 20, isNegative: true }
];

// EXERCISE 1: Filter out income so we only have expenses
const expensesOnly = allTransactions.filter((transaction) => {
    // Return true if we want to keep it, false if we want to throw it away
    return transaction.isNegative === true; 
});

// Result:
// [
//   { id: '1', category: 'Food', amount: 50, isNegative: true },
//   { id: '3', category: 'Transport', amount: 20, isNegative: true }
// ]
```

---

## 2. `map()` - Transforming Each Item
The `map` method creates a *new array* by transforming every item in the original array one by one. It always returns an array of the exact same length.

**Scenario:** Your Pie Chart needs the keys to be exactly `name` and `value`, but your data uses `category` and `amount`.

```typescript
const filteredExpenses = [
    { id: '1', category: 'Food', amount: 50, isNegative: true },
    { id: '3', category: 'Transport', amount: 20, isNegative: true }
];

// EXERCISE 2: Map the objects to the format Recharts wants
const chartData = filteredExpenses.map((expense) => {
    return {
        name: expense.category,  // Transform 'category' into 'name'
        value: expense.amount    // Transform 'amount' into 'value'
    };
});

// Result:
// [
//   { name: 'Food', value: 50 },
//   { name: 'Transport', value: 20 }
// ]
```

---

## 3. `reduce()` - Summing Everything Up (The Final Boss)
The `reduce` method takes an array and "reduces" it down to a single value (which could be a number, an object, or a new array). 

**Scenario:** You have multiple transactions for "Food". A Pie Chart needs the *total* sum of "Food", not 5 separate "Food" slices.

```typescript
const rawData = [
    { category: 'Food', amount: 15 },
    { category: 'Transport', amount: 20 },
    { category: 'Food', amount: 35 }, // Another Food item!
];

// EXERCISE 3: Group by category and sum the amounts
const summedData = rawData.reduce((accumulator, currentItem) => {
    // accumulator is the object we are building up: {}
    
    // 1. Check if the category already exists in our object
    if (accumulator[currentItem.category]) {
        // If it exists, add the new amount to the existing total
        accumulator[currentItem.category] += currentItem.amount;
    } else {
        // If it doesn't exist yet, set it to the current amount
        accumulator[currentItem.category] = currentItem.amount;
    }
    
    return accumulator; // Always return the accumulator for the next loop!
}, {} as Record<string, number>); // The {} is our starting value

// Result of summedData:
// { "Food": 50, "Transport": 20 }


// BONUS STEP: Object.entries() + map() to turn it back into an array for the chart
const finalPieChartData = Object.entries(summedData).map(([key, val]) => {
    return { name: key, value: val };
});

// Final Result:
// [ { name: 'Food', value: 50 }, { name: 'Transport', value: 20 } ]
```

> [!TIP]
> **Summary Rule of Thumb:**
> - Use **filter** when you want *fewer items*.
> - Use **map** when you want the *same number of items*, but *changed*.
> - Use **reduce** when you want to combine things into a *total sum or single grouped object*.
