# Mastering Key-Value Pairs

At its core, a **Key-Value Pair** is just a label (the "Key") attached to some data (the "Value"). It is the absolute foundation of all JavaScript Objects, JSON data, and dictionaries.

Think of it like a real-life dictionary book: 
*   **Key:** The word you are looking up (e.g., "Apple").
*   **Value:** The definition of the word (e.g., "A red fruit").

In code, it looks like this:
```typescript
const user = {
    username: "Andy",    // Key: "username", Value: "Andy"
    age: 28,             // Key: "age",      Value: 28
    isPremium: true      // Key: "isPremium",Value: true
};

// You use the Key to get the Value!
console.log(user.username); // Prints: "Andy"
```

Almost every app in the world is just arrays (lists) of these Key-Value objects! Here are 3 mini-projects showing how we use `.filter()` and `.map()` to manipulate them.

---

## Mini-Project 1: The Contact Book (Search Engine)

**Goal:** You have a list of contacts (Key-Value objects). You want to filter out anyone who isn't a "Favorite", and then map their names into a list for the screen.

```typescript
// 1. The Data (An array of Key-Value objects)
const contacts = [
    { name: "Alice", phone: "555-0100", isFavorite: true },
    { name: "Bob",   phone: "555-0200", isFavorite: false },
    { name: "Charlie", phone: "555-0300", isFavorite: true }
];

// 2. FILTER: Keep only the favorite contacts
const favoriteContacts = contacts.filter((contact) => {
    // We access the Value using the "isFavorite" Key
    return contact.isFavorite === true; 
});
// Result: Alice and Charlie's objects.

// 3. MAP: Extract just their names for the UI
const displayNames = favoriteContacts.map((contact) => {
    // We access the Value using the "name" Key
    return `⭐️ ${contact.name}`; 
});

// Final Output: ["⭐️ Alice", "⭐️ Charlie"]
```

---

## Mini-Project 2: The Shopping Cart (Checkout System)

**Goal:** You have a shopping cart. You need to filter out items that are "Out of Stock", and then map the remaining items into a neat receipt format.

```typescript
// 1. The Data
const shoppingCart = [
    { itemName: "Laptop", price: 1200, inStock: true },
    { itemName: "Mouse", price: 25, inStock: false }, // Oh no, out of stock!
    { itemName: "Keyboard", price: 75, inStock: true }
];

// 2. FILTER: Remove out of stock items
const availableItems = shoppingCart.filter((item) => {
    // We check the Value of the "inStock" Key
    return item.inStock === true;
});

// 3. MAP: Format them for the customer's receipt
const receiptLines = availableItems.map((item) => {
    // We use BOTH the "itemName" and "price" Keys to build a string
    return `${item.itemName} ........ $${item.price}`;
});

// Final Output: 
// [
//   "Laptop ........ $1200", 
//   "Keyboard ........ $75"
// ]
```

---

## Mini-Project 3: The Task Manager (To-Do List)

**Goal:** You have a list of tasks. You want to filter out the tasks that are already "Completed", and map the remaining pending tasks into UI elements (like HTML lists).

```typescript
// 1. The Data
const tasks = [
    { id: 1, title: "Buy groceries", completed: true },
    { id: 2, title: "Finish coding app", completed: false },
    { id: 3, title: "Call mom", completed: false }
];

// 2. FILTER: Find the tasks that are NOT completed yet
const pendingTasks = tasks.filter((task) => {
    // Check the Value of the "completed" Key
    return task.completed === false;
});

// 3. MAP: Turn the raw objects into HTML strings (or React components!)
const htmlListItems = pendingTasks.map((task) => {
    // We use the "id" Key and the "title" Key
    return `<li id="${task.id}"> 🔴 ${task.title} </li>`;
});

// Final Output:
// [
//   '<li id="2"> 🔴 Finish coding app </li>',
//   '<li id="3"> 🔴 Call mom </li>'
// ]
```

> [!TIP]
> **The Golden Rule of Key-Value Pairs:** 
> You almost *never* care about the entire object. You only care about the **Values** hiding inside it! You use `.filter()` to check if a specific Value matches a rule, and you use `.map()` to pluck out the Values you want to display on the screen.
