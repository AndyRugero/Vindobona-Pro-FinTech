# 🗺️ Server Architecture: The Chain of Command (How they talk to each other)

Think of your `server/` folder like a business. Here is how the "employees" talk to each other:

---

## 1. The Boss (The Main Coordinator): `server.js`
This is the **entry point**. When you run `node server/server.js`, Node.js starts here.

*   **Its job**: Set up the office (Express), open the vault (SQLite database `db`), and hire the departments (routers).
*   **How it talks to others**: Once the database is open, `server.js` imports the routes and passes them the open database connection (`db`) so they can read/write data:
    ```javascript
    const authRouter = require('./routes/auth')(db); // 👈 Passes 'db' to auth routes
    ```

---

## 2. The Departments (The Routers): `routes/auth.js` and `routes/transactions.js`
These are separate rooms in the office. Each handles a specific job.

*   `routes/auth.js` handles user registration and logins.
*   `routes/transactions.js` handles adding, loading, and deleting transactions.
*   **How they talk to others**: When the transaction department receives a request, it calls the **Security Guard** first to check if the user is allowed in.

---

## 3. The Security Guard (The Middleware): `middleware/auth.js`
This employee stands outside the transaction room door.

*   **Its job**: Stop incoming requests and inspect their "VIP wristband" (the JWT token).
*   **How it talks to others**: If the wristband is valid, the guard writes the user's ID on the request (`req.user = decodedUser`) and calls `next()` to say: *"Okay, you may enter the transactions room now!"*

---

## 🎬 A Request in Action (The Flow)
Here is exactly what happens when your React frontend asks to load transactions (`GET /api/transactions`):

```text
1. [ React Frontend ] sends request with a JWT token inside headers.
        │
        ▼
2. [ server.js ] (The Boss) catches the request and directs it to the Transactions Router.
        │
        ▼
3. [ middleware/auth.js ] (The Security Guard) intercepts it:
   - Validates the token signature.
   - Attaches the userId (e.g. user "andy") to the request.
   - Calls next().
        │
        ▼
4. [ routes/transactions.js ] (The Router) executes the SQL query:
   - SELECT * FROM transactions WHERE user_id = 'andy';
        │
        ▼
5. [ React Frontend ] receives the list of transactions back! 
```
