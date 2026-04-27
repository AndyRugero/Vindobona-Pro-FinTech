# 🎓 Lesson 14 Summary: Dynamic Calculations

In this lesson, we made the dashboard "Alive" by replacing hardcoded text with real, calculated numbers.

---

## 1. The Challenge: Math with Strings
Our transactions store amounts as strings (e.g., `"$50.00"`). You cannot add strings together in math (e.g., `"5" + "5" = "55"`). 

**The Solution: The "Cleaner" Function**
We created a function to strip away the symbols and turn the text into a real number:
```typescript
const cleanAmount = (amt: string) => {
    // 1. Remove everything except numbers and dots
    const cleanText = amt.replace(/[^\d.]/g, ''); 
    // 2. Convert to a number
    return parseFloat(cleanText) || 0;
};
```

---

## 2. The Hook Logic (The Brain)
Inside `useTransactions.ts`, we looped through all your data to sum up the totals:

```typescript
let income = 0;
let expenses = 0;

ledgerData.forEach(tx => {
    const value = cleanAmount(tx.amount);
    if (tx.isNegative) {
        expenses += value; // Add to expenses
    } else {
        income += value;   // Add to income
    }
});

const totalBalance = income - expenses;
```

---

## 3. The Props Pipeline (The Connection)
We learned that data flows like water in a pipe:

1.  **Hook** calculates `totalBalance`, `income`, and `expenses`.
2.  **App.tsx** receives those values and hands them to the components.
3.  **Components** (like `StatsRow`) define their "holes" (Props) to accept the data:

**Example of Component Surgery:**
```tsx
// Before (Closed):
const StatsRow: React.FC = () => { ... }

// After (Open):
const StatsRow: React.FC<{ income: number, expenses: number }> = ({ income, expenses }) => {
    return (
        <StatCard label="Income" value={income.toLocaleString()} />
    );
}
```

---

## 4. Professional Formatting
We used **`.toLocaleString()`**. This is a built-in JS function that automatically adds commas and decimals based on where you live (e.g., `1000` becomes `"1,000"`).

---

### 🚀 Ready for Lesson 15?
Next time, we will learn about **JSON**—the secret sauce for saving your data to the browser's memory!
