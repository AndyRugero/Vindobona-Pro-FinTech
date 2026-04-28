# 🔍 Lesson 17: Search and Filter UI (Derived State)

In Lesson 16, we used `.filter()` to completely delete a transaction from the Brain. 

In this lesson, we focused on the first half of **Searching and Sorting**: building the User Interface and the "Memory" for the controls. We don't want to permanently delete data when we search; we just want to temporarily hide it!

---

## 1. The Concept: Derived State

In C# WPF, if you want to filter a `DataGrid`, you usually apply a filter directly to the `ICollectionView`. 

In React, we use a concept called **Derived State**. 
Instead of modifying the real `ledgerData` (which would permanently delete items!), we create a *temporary* filtered list right before we draw the screen. We keep the state for the filters closely tied to the Component that actually needs it (in our case, the `TransactionList`).

### The Setup We Built:
1.  **The Memory (`TransactionList.tsx`)**: We created three `useState` variables (`searchTerm`, `filterDate`, `sortBy`) to track what the user is looking for.
2.  **The UI (`TransactionControls.tsx`)**: We created a dedicated, clean component to house the Search Bar, the HTML5 Calendar Picker (`<input type="date">`), and the Sort Dropdown.
3.  **The Architecture**: By nesting `TransactionControls` directly inside `TransactionList`, we perfectly matched our professional mockup design. `App.tsx` remains completely clean and doesn't have to worry about filtering!

---

## 2. Next Steps (Lesson 18 Preview)

Tomorrow, we will actually apply the `.filter()` and `.sort()` logic using the variables we set up today!

```typescript
// Example of what we will do tomorrow:

// 1. Take the raw data passed from App.tsx
let temporaryList = [...transactions];

// 2. Filter it by the search term
temporaryList = temporaryList.filter(tx => 
    tx.receiver.toLowerCase().includes(searchTerm.toLowerCase())
);

// 3. Sort it
if (sortBy === "Amount") {
    temporaryList.sort((a, b) => cleanAmount(b.amount) - cleanAmount(a.amount));
}

// 4. Draw the temporary list!
return (
   {temporaryList.map(tx => <TableRow data={tx} />)}
)
```

**Tomorrow's Agenda (Lessons 18, 19, 20):**
1. Write the filtering and sorting logic for the controls we built today.
2. Add a new `Status` column to the table with beautiful, colored pills (Complete, Pending, Flagged).
3. Overhaul the Sidebar to include Dashboard Analytics and modern navigation.
