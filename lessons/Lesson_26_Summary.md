# Lesson 26: The Service Layer & JSON Flow 🏗️📡

## Goal
To separate our "Data Storage" logic from our "UI Logic" using the **Service Pattern**. This makes the app professional, scalable, and easy to maintain.

---

## 1. The Service Object (`TransactionService.ts`)
The Service is the **Middleman**. It is the ONLY file in the entire project that knows about `localStorage`.

### The Save Method (Serialization)
```typescript
save: (data: any[]) => {
    const jsonString = JSON.stringify(data); // Converts Objects -> JSON String
    localStorage.setItem("Vindobona_ledger", jsonString);
}
```
**Concept:** `JSON.stringify` turns your live JavaScript objects into a text string so they can "sleep" in the browser's storage.

### The Fetch Method (Deserialization)
```typescript
fetchAsync: async (): Promise<any[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    const rawData = localStorage.getItem("Vindobona_ledger");
    if (!rawData) return [];
    return JSON.parse(rawData); // Converts JSON String -> Live Objects
}
```
**Concept:** `JSON.parse` takes the "sleeping" text string and wakes it up back into usable JavaScript objects. We use `async` because real servers take time to respond.

---

## 2. The Hook Connection (`useTransactions.ts`)
We use two separate **Watchers** (`useEffect`) to manage the data lifecycle.

### The Loader (Startup)
```typescript
useEffect(() => {
    const loadFromStorage = async () => {
        const data = await TransactionService.fetchAsync();
        if (data && data.length > 0) {
            setLedgerData(data); // Push the data into our App's state
        }
    };
    loadFromStorage();
}, []); // [] = Run only once when the app starts
```
**Connection:** This connects the **Service** to the **UI** right when the app opens.

### The Saver (Watcher)
```typescript
useEffect(() => {
    TransactionService.save(ledgerData);
}, [ledgerData]); // [ledgerData] = Run every time the list changes
```
**Connection:** This ensures that every time you add, delete, or import a transaction, it is instantly backed up to the storage.

---

## 3. The JSON Flow Diagram
1. **App Action**: You click "Add Transaction".
2. **Hook Change**: `ledgerData` state updates.
3. **Saver Trigger**: `useEffect` detects the change.
4. **Serialization**: `JSON.stringify` converts the list to text.
5. **Storage**: Text is saved in `localStorage`.
6. **(Next Refresh)**:
7. **Loader Trigger**: `useEffect` runs on startup.
8. **Deserialization**: `JSON.parse` converts text back to objects.
9. **UI Refresh**: Dashboard shows your saved data.

---

## Why this is a "Junior to Senior" Move
Instead of messy code everywhere, you now have a clean system where:
- **Service**: Handles the "How" (Storage).
- **Hook**: Handles the "What" (Data).
- **App**: Handles the "Look" (UI).
