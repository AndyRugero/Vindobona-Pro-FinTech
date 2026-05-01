# Lesson 23: Form Validation and Error Handling

## 1. The Concept: Defensive Programming
Users are unpredictable. If you give them a form, they will inevitably try to submit it while it is completely empty, or with invalid data. If your application attempts to save "nothing" into the database, it can cause the entire system to crash.

**Form Validation** is the process of building a shield around your database. We check the user's input *before* we allow it to be saved.

## 2. What We Built
We upgraded our `TransactionForm.tsx` to handle "Error States".

### The Validation Logic
Inside the `handleAdd` function, we added strict rules:
```tsx
if (receiver.trim() === '') {
  setError('Receiver name cannot be empty!');
  return; // Stop the function immediately!
}
```
*   **`.trim()`:** A JavaScript function that removes invisible spaces. If a user just types "   ", `.trim()` turns it into "", which triggers our error trap.
*   **`return;`:** This is the emergency brake. If the rule is broken, the function completely stops running, preventing the bad data from ever reaching the database.

### The UI Feedback (Error Box)
If a user makes a mistake, we don't just fail silently. We provide immediate visual feedback using conditional rendering:
`{error && <div className="error-box">{error}</div>}`

This creates a highly professional, user-friendly experience where the app actively helps the user correct their mistakes.
