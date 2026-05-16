# Lesson 28: Search & Filtering Logic 🔍🕵️‍♂️

## Goal
Implement a real-time search functionality that allows users to find specific transactions by typing their name, category, or amount. This turns a long, static list into a powerful, searchable database.

## Key Concepts

### 1. The Search State
We need a place to store what the user is typing. We will use a simple string state:
`const [searchTerm, setSearchTerm] = useState("");`

### 2. Derived State (Computed Properties)
Instead of creating a "New" list every time we search, we "Derive" a filtered list from our main `ledgerData`. 
**Formula:** `Main List + Search Term = Filtered List`.

### 3. Case-Insensitive Matching
Computers are picky about capital letters. We will use `.toLowerCase()` to make sure "Apple" matches "apple".

### 4. Multi-Field Search
We won't just search the **Receiver**. We will allow the user to search across:
- **Receiver Name** (e.g., "Billa")
- **Category** (e.g., "Groceries")
- **Amount** (e.g., "33.50")

---

## Technical Implementation Plan

1. **Modify `App.tsx`**:
   - Add a `searchTerm` state.
   - Create a `filteredTransactions` constant that uses `.filter()` on `ledgerData`.
   - Update the `<TransactionList />` to use this new filtered list.

2. **Add Search UI**:
   - Create a search input field in the `DashboardHeader` or `Topbar`.
   - Connect the input's `onChange` to our `setSearchTerm`.

3. **Logic Refinement**:
   - Handle empty search cases.
   - Ensure the "Total Balance" still calculates correctly based on ALL data, not just the filtered data.

---

## Why this is Professional
Professional dashboards (like Amazon or Google Drive) provide instant feedback as you type. This pattern ensures the app feels **fast** and **responsive** without needing to refresh the page. 🚀🔍✨
