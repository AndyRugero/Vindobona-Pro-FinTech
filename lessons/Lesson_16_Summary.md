# 🗑️ Lesson 16: Deleting Data using `.filter()`

In this lesson, we add a crucial feature to our app: the ability to delete a transaction when you make a mistake.

---

## 1. The Concept: How do we delete in React?

In C# and WPF, if you want to delete an item, you usually take your `ObservableCollection` and call `.Remove(item)`. 

React works differently. React state (`ledgerData`) is **Immutable** (which means "unchangeable"). You are not allowed to reach inside the existing list and yank an item out. 

Instead, you have to create a **brand new list** that has all the old items *except* the one you want to delete, and then overwrite the old list.

---

## 2. The Tool: `.filter()`

To create this new list, JavaScript gives us a very powerful array method called `.filter()`. 

If you know C#, `.filter()` is exactly the same as **LINQ's `.Where()`**.

### The C# Way:
```csharp
var newList = ledgerData.Where(tx => tx.Id != idToDelete).ToList();
```

### The React / JavaScript Way:
```typescript
const newList = ledgerData.filter(tx => tx.id !== idToDelete);
```

**How to read this code in plain English:**
*"Look at `ledgerData`. Create a new list. Keep every transaction (`tx`) where the transaction's ID is NOT EQUAL TO the ID I want to delete."*

---

## 3. The Implementation Steps

To add the Delete feature to our app, we need to build a "bridge" from the button to the brain:

1.  **The Brain (`useTransactions.ts`)**: We will write a `deleteEntry` function using `.filter()` and pass it out of the Hook.
2.  **The Boss (`App.tsx`)**: We will grab the `deleteEntry` function and pass it down as a Prop.
3.  **The Table (`TransactionList.tsx`)**: We will add a "Delete" button to each row. When clicked, the button will shout the ID of its transaction back up the bridge to the Brain so it can be filtered out.

---

### Are you ready?
Let me know when you are ready to start Step 1, and we will write the `deleteEntry` function together in `useTransactions.ts`!
