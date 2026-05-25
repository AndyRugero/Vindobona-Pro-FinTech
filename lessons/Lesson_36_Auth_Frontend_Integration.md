# Lesson 36: Route Guarding & Auth Integration (The Guard at the Door) 🚪🛡️

Welcome to Lesson 36! Now that we have a Sign-up and Login system, we need to use it to secure our transactions. 

Currently, our transaction routes (`GET`, `POST`, `DELETE`) are still wide open—anyone can access them without a token. Furthermore, all transactions are mixed together because they don't belong to any specific user.

In this lesson, we will secure our backend routes using **Middleware** and scope transactions so that each user only sees their own data!

---

## 1. What is Middleware? 🛑

Think of **Middleware** as a security guard standing at the door of your private API endpoints. 

Before Express runs the code inside `app.get('/api/transactions')`, the request must pass through our middleware function first:
*   The guard checks the request headers for an `Authorization` token.
*   If the token is missing or invalid, the guard turns them away immediately with a **`401 Unauthorized`** error.
*   If the token is valid, the guard extracts the `userId` from the token, attaches it to the request (`req.user`), and calls `next()` to let them pass.

---

## 2. Linking Transactions to Users (Database Relation) 🔗

Right now, our `transactions` table has no owner. To fix this:
1.  We need to add a `user_id` column to the `transactions` table.
2.  When a user fetches transactions (`GET`), we only return rows where `user_id = loggedInUserId`.
3.  When a user creates a transaction (`POST`), we save their `user_id` along with the transaction details.

---

## 🏗️ Lesson 36 Action Plan

> [!NOTE]
> **Dependencies Audit:** In this lesson, we don't need to install any *new* npm packages. We will utilize the libraries already installed in Lessons 34 and 35. Ensure you have installed:
> *   **In the Root Directory:**
>     ```bash
>     npm install express cors nodemon sqlite sqlite3
>     ```
> *   **In the Backend Directory (`backend/`):**
>     ```bash
>     cd backend
>     npm install bcryptjs jsonwebtoken
>     ```

We will implement this security upgrade in **3 clear steps**:

### 🛡️ Step 1: Create the Authentication Middleware
We will write a `authenticateToken` middleware function in `server.js` that checks for a JWT token in the `Authorization` header and decodes it.

### 🗄️ Step 2: Update the Transactions Schema & Routes
We will:
1. Add the `user_id` column to our database creation schema.
2. Update the `GET`, `POST`, and `DELETE` database queries to scope transactions specifically to the logged-in user (`req.user.userId`).

### 🔌 Step 3: Connect the Frontend (Token Headers)
We will update `TransactionContext.tsx` on the React frontend to:
1. Save the JWT token in the browser's `localStorage` on login.
2. Automatically attach the token to all API requests inside the headers:
   `'Authorization': 'Bearer ' + token`

---

## 🏆 Your Next Steps

Let's begin **Step 1** by writing our security middleware function at the top of our routes in `server.js`!
