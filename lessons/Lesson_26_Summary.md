# Lesson 26: The Service Layer & Mock Backend

## 1. The Concept: Moving Logic out of Components
So far, our logic is scattered between `App.tsx` and `useTransactions.ts`. As an app grows, this becomes "Spaghetti Code." 

**The Service Layer** is a professional architectural pattern where all data-fetching and storage logic lives in a dedicated file. This makes your app easier to test and ready for a real Database (API).

## 2. Our Goal
In this lesson, we will:
1.  **Refactor `TransactionService.ts`**: Move all LocalStorage logic there.
2.  **Implement a "Loading State"**: Simulate a real network delay so the user sees a spinner while data "fetches."
3.  **Global Error Handling**: Ensure the app doesn't crash if the data is corrupted.

## 3. Why This Matters
Real-world apps never touch LocalStorage directly inside a Hook. They call a **Service**. Learning this pattern separates "Junior" developers from "Senior" architects.

*Next Step: Create the `TransactionService.ts` architecture.*
