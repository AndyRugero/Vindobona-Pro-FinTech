# 📜 JavaScript & TypeScript Fundamentals

This guide explains how to build the "Cells" and "Nerves" of your application.

---

## 1. Variables (Storing Data)
In JS, we use `const` (constant) for values that stay the same and `let` for values that change.

1.  **String (Text)**: `const name = "Andy";`
2.  **Number**: `const price = 49.99;`
3.  **Boolean (True/False)**: `let isPaid = false;`
4.  **Array (List)**: `const colors = ["Red", "Blue", "Green"];`
5.  **Object (Complex Item)**: `const user = { name: "Andy", age: 25 };`

---

## 2. Functions (Doing Actions)
Functions are like "Recipes." You define them once, and you can "call" (run) them many times.

1.  **Simple Function**:
    ```typescript
    const sayHello = () => {
        console.log("Hello!");
    };
    sayHello(); // Calling it
    ```
2.  **With Parameters**:
    ```typescript
    const greetUser = (userName: string) => {
        console.log("Welcome, " + userName);
    };
    greetUser("Andy"); // Calling it with data
    ```
3.  **Returning a Value**:
    ```typescript
    const addNumbers = (a: number, b: number) => {
        return a + b;
    };
    const sum = addNumbers(5, 10); // sum is now 15
    ```
4.  **Formatting Data**:
    ```typescript
    const formatMoney = (amount: number) => {
        return "$" + amount.toFixed(2);
    };
    ```
5.  **React-Style (The "Worker")**:
    ```typescript
    const handleSave = (data: string) => {
        if (data) saveToDatabase(data);
    };
    ```

---

## 3. If / Else (Making Decisions)
This is how your app "thinks."

1.  **Basic Comparison**:
    ```typescript
    if (amount > 100) {
        console.log("Expensive!");
    } else {
        console.log("Cheap!");
    }
    ```
2.  **Using `.includes()`**:
    ```typescript
    if (email.includes("@")) {
        console.log("Valid email");
    } else {
        console.log("Invalid email");
    }
    ```
3.  **Multiple Choices (Else If)**:
    ```typescript
    if (score >= 90) {
        grade = "A";
    } else if (score >= 80) {
        grade = "B";
    } else {
        grade = "C";
    }
    ```
4.  **The "Shortcut" (Ternary Operator)**:
    *This is like a one-line if/else.*
    ```typescript
    const status = isOnline ? "Active" : "Offline";
    ```
5.  **The "Default" Trick (`||`)**:
    ```typescript
    // If user.name is missing, use "Guest"
    const displayName = user.name || "Guest";
    ```

---

## 4. The Hand-off (Passing Data around)

In your app, data is constantly moving. Here are the 3 ways it moves:

### A. The "Courier" (Props)
**Example**: `<TransactionList transactions={ledgerData} />`
*   **How it works**: You take a variable you have (`ledgerData`) and give it a new name (`transactions`) so a child component can use it.
*   **C# Comparison**: This is like passing a variable into a **UserControl Property**.

### B. The "Telephone" (Arguments)
**Example**: `predictCategory(receiver)`
*   **How it works**: You send a piece of data into a function. The function does work and usually "returns" an answer.
*   **C# Comparison**: This is a standard **Method Call** with a parameter.

### C. The "Photocopy" (Spread Operator `...`)
**Example**: `[...ledgerData, newTx]`
*   **How it works**: React doesn't like it when you change a list directly. You must create a *new* list.
    1.  `...ledgerData`: Take all items from the old list.
    2.  `, newTx`: Add this new item to the end.
    3.  `[ ]`: Wrap it all in a brand new list.
*   **C# Comparison**: This is like creating a `new List<T>(oldList)` and then calling `Add()`.

---

## 5. Scope (Where do variables live?)
*   If you create a variable **inside** a function, it only exists there.
*   If you want to use it elsewhere, you must **Pass it** (using the patterns above) or **Return it**.
