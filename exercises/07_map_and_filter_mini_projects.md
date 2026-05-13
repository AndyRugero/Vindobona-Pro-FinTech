# Mini-Projects: Mastering Map & Filter

Here are 8 bite-sized projects to help you master `.map()` and `.filter()`. 

Remember the core difference:
*   **`.filter()`** throws things away. It returns a *shorter* list.
*   **`.map()`** transforms things. It returns a list of the *exact same length*, but reshaped.

---

## Part 1: The 4 `.filter()` Mini-Projects
*Goal: Use a condition (True/False) to keep only the items you want.*

### Project 1: The VIP Lounge (Filtering Booleans)
**Goal:** You have a list of users. Only let the "Premium" users into the VIP area.
```typescript
const users = [
    { name: "Andy", isPremium: true },
    { name: "Bob", isPremium: false },
    { name: "Charlie", isPremium: true }
];

const vipGuests = users.filter((user) => user.isPremium === true);
// Result: [ { name: "Andy", isPremium: true }, { name: "Charlie", isPremium: true } ]
```

### Project 2: The Budget Shopper (Filtering Numbers)
**Goal:** You are looking at a list of products but you only have $50. Filter out anything that costs more than $50.
```typescript
const storeItems = [
    { item: "Laptop", price: 1200 },
    { item: "Mouse", price: 25 },
    { item: "Keyboard", price: 45 },
    { item: "Headphones", price: 150 }
];

const affordableItems = storeItems.filter((product) => product.price <= 50);
// Result: [ { item: "Mouse", price: 25 }, { item: "Keyboard", price: 45 } ]
```

### Project 3: The Chat Moderator (Filtering Strings)
**Goal:** You are building a chat app. Filter out any messages that contain a banned curse word (like "heck").
```typescript
const chatLog = [
    "Hello everyone!",
    "This game is what the heck!",
    "I love coding."
];

const cleanChat = chatLog.filter((message) => {
    // .includes() checks if a word exists inside the string
    return !message.includes("heck"); 
});
// Result: [ "Hello everyone!", "I love coding." ]
```

### Project 4: The Debt Collector (Filtering Arrays of Objects)
**Goal:** Find all customers who have an unpaid balance greater than zero so you can send them an email.
```typescript
const customers = [
    { id: 101, balance: 0 },
    { id: 102, balance: 150.50 },
    { id: 103, balance: 0 },
    { id: 104, balance: 25.00 }
];

const customersToEmail = customers.filter((customer) => customer.balance > 0);
// Result: [ { id: 102, balance: 150.50 }, { id: 104, balance: 25.00 } ]
```

---

## Part 2: The 4 `.map()` Mini-Projects
*Goal: Take an item, change it, and return the new version.*

### Project 5: The Mailing List (Extracting Data)
**Goal:** You have massive user objects, but your email software ONLY wants an array of email address strings. Pluck out just the emails.
```typescript
const databaseUsers = [
    { id: 1, name: "Andy", email: "andy@email.com", age: 28 },
    { id: 2, name: "Bob", email: "bob@email.com", age: 34 }
];

const mailingList = databaseUsers.map((user) => user.email);
// Result: [ "andy@email.com", "bob@email.com" ]
```

### Project 6: The Temperature App (Math Transformation)
**Goal:** Your weather app received data in Celsius, but you need to show it in Fahrenheit for your US users.
*Formula: (Celsius * 9/5) + 32*
```typescript
const celsiusTemps = [0, 20, 30, 100];

const fahrenheitTemps = celsiusTemps.map((temp) => {
    return (temp * 9/5) + 32;
});
// Result: [ 32, 68, 86, 212 ]
```

### Project 7: The Bank Statement (Formatting UI)
**Goal:** You have a raw list of numbers. Turn them into nicely formatted US Dollar strings for your React UI.
```typescript
const rawAmounts = [5.5, 120, 49.99];

const formattedAmounts = rawAmounts.map((amount) => {
    return `$${amount.toFixed(2)}`; // Adds the $ and forces 2 decimal places
});
// Result: [ "$5.50", "$120.00", "$49.99" ]
```

### Project 8: The Database Migrator (Adding Properties)
**Goal:** You just imported a list of categories from an old system, but React needs them to have unique IDs. Add an `id` to every object.
```typescript
const oldCategories = [
    { name: "Food" },
    { name: "Rent" },
    { name: "Gas" }
];

const newCategories = oldCategories.map((category, index) => {
    return {
        id: `cat_${index}`, // Creates IDs like 'cat_0', 'cat_1'
        name: category.name
    };
});
// Result: 
// [ 
//   { id: "cat_0", name: "Food" }, 
//   { id: "cat_1", name: "Rent" }, 
//   { id: "cat_2", name: "Gas" } 
// ]
```
