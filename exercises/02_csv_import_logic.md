# CSV Import Logic Exercises

When you import a CSV file into a web app, the browser reads it as one giant, raw string of text. To make it useful, you have to break that massive string down into individual pieces, filter out the junk, and map it into JavaScript objects.

Here is a step-by-step breakdown of how that logic works using standard array methods.

---

## 1. `split()` - Breaking the Giant String into Rows
Before we can use array methods like `map` and `filter`, we need an array. A CSV file uses invisible newline characters (`\n`) to separate rows.

**Scenario:** We just loaded a file and got a raw text string.

```typescript
const rawCsvString = `Date,Description,Category,Amount
2024-05-10,Walmart,Groceries,-50.25
2024-05-11,Salary,Income,3000.00
2024-05-12,Shell,Gas,-40.00`;

// EXERCISE 1: Break the text into an array of rows
const rowsArray = rawCsvString.split('\n');

// Result:
// [
//   "Date,Description,Category,Amount",
//   "2024-05-10,Walmart,Groceries,-50.25",
//   "2024-05-11,Salary,Income,3000.00",
//   "2024-05-12,Shell,Gas,-40.00"
// ]
```

---

## 2. `filter()` - Removing the Headers & Junk
We have our rows, but the first row is just column titles ("Date", "Description"). If we try to turn the word "Amount" into a number, our app will crash or give us `NaN` (Not a Number).

**Scenario:** We need to throw away the header row and any accidental empty rows at the end of the file.

```typescript
// EXERCISE 2: Filter out the header and empty lines
const dataRowsOnly = rowsArray.filter((row, index) => {
    // 1. Throw away index 0 (the header row)
    if (index === 0) return false;
    
    // 2. Throw away rows that are completely empty
    if (row.trim() === "") return false;
    
    // 3. Keep everything else!
    return true; 
});

// Result:
// [
//   "2024-05-10,Walmart,Groceries,-50.25",
//   "2024-05-11,Salary,Income,3000.00",
//   "2024-05-12,Shell,Gas,-40.00"
// ]
```

---

## 3. `map()` - Turning Strings into Objects
Now we have an array of clean, comma-separated strings. But our app needs an array of *Objects* so we can access properties like `transaction.amount`. 

**Scenario:** We need to split each row by commas (`,`) and map those pieces into an object.

```typescript
// EXERCISE 3: Map the strings into Transaction Objects
const parsedTransactions = dataRowsOnly.map((row) => {
    // Split the row by commas into an array of columns
    // "2024-05-10,Walmart,Groceries,-50.25" becomes:
    // ["2024-05-10", "Walmart", "Groceries", "-50.25"]
    const columns = row.split(',');
    
    const amountNumber = parseFloat(columns[3]);

    return {
        id: crypto.randomUUID(), // Generate a unique ID for React keys
        date: columns[0],
        description: columns[1],
        category: columns[2],
        amount: `$${Math.abs(amountNumber).toFixed(2)}`, // Format nicely
        isNegative: amountNumber < 0                     // Determine if expense
    };
});

// Result:
// [
//   { id: 'uuid-1', date: '2024-05-10', description: 'Walmart', category: 'Groceries', amount: '$50.25', isNegative: true },
//   { id: 'uuid-2', date: '2024-05-11', description: 'Salary', category: 'Income', amount: '$3000.00', isNegative: false },
//   { id: 'uuid-3', date: '2024-05-12', description: 'Shell', category: 'Gas', amount: '$40.00', isNegative: true }
// ]
```

> [!TIP]
> **Summary of the CSV Flow:**
> 1. Use `.split('\n')` to turn a giant string into an array of rows.
> 2. Use `.filter()` to remove headers and empty rows.
> 3. Use `.map()` to process `.split(',')` on each row, transforming arrays of words into neatly organized Javascript Objects.
