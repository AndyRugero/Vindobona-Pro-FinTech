# Lesson 21: Activating the Calendar (Expanding Logic)

## 1. The Concept: Multi-Filtering
When building professional applications, users often want to apply multiple filters at the exact same time (e.g., searching for a specific name *and* a specific date). To accomplish this, our Logic layer needs to be aware of all active filters.

## 2. What We Built
We expanded our `processTransactions` function inside our Logic folder to accept a 4th argument: `filterDate`. 

### The Boolean Logic Pipeline
Inside our `.filter()` loop, we created two separate checks:
1.  **Search Check:** `const matchesSearch = ...`
2.  **Date Check:** `const matchesDate = ...`

We then combined them using the **Logical AND operator (`&&`)**:
`return matchesSearch && matchesDate;`

This ensures that a transaction is only shown if it successfully passes *both* filters!

## 3. Empty State UX
We also learned a critical UX (User Experience) rule: Never show a broken or empty table if a search yields no results. 
By wrapping our JSX loop in a ternary operator (`{processedList.length === 0 ? (...) : (...)}`), we were able to display a polite, styled message spanning across the table when no transactions matched the user's filters.
