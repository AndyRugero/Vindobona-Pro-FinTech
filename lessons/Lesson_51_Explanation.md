# Lesson 51 Explanation: User Roles & Role-Based Access Control (RBAC) 🏦🔑🛡️

Welcome to the comprehensive explanation guide for Lesson 51! In this lesson, we upgraded our banking platform's security architecture from basic authentication to **Role-Based Access Control (RBAC)**. 

In enterprise environments (like major Austrian banks like Erste Group and RBI), security isn't just about knowing *who* is logged in. It's about ensuring users only perform actions they are *authorized* to do. This guide breaks down the core concepts, real-world analogies, and code details behind the implementation.

---

## 📍 1. Authentication vs. Authorization

To understand these two security pillars conceptually:

*   **Authentication (AuthN) 🔑:**
    *   *The Question:* "Who are you?"
    *   *The Process:* Checking passwords, verifying 2FA codes, or validating a Google ID.
    *   *The Analogy:* Swiping your debit card and entering your PIN at the door of an Erste Group foyer. The bank verifies that you are indeed the account holder.
*   **Authorization (AuthZ) 🛡️:**
    *   *The Question:* "What are you allowed to do?"
    *   *The Process:* Checking a user's permissions or role before returning resource payloads.
    *   *The Analogy:* Once inside the bank lobby, a standard customer cannot walk behind the teller desk, open the vault door, or access the employee database. Only employees with manager keycards are authorized to open those specific doors.

---

## 📍 2. SQLite Database Schema Migrations

When developing a live application, adding columns to tables requires care.

*   **The Problem:** We already have users registered in `database.db`. Simply changing the initial `CREATE TABLE` query inside `server.js` doesn't work because of the `IF NOT EXISTS` check. SQLite sees the table already exists and skips the block, meaning existing users will not get the new `role` column.
*   **The Solution:** We run a **Safe Schema Migration** on startup:
    ```javascript
    await db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
    ```
    We wrap this in a `try...catch` block. The first time the server starts, it modifies the database structure and sets all existing users to the default `'user'` role. On subsequent restarts, SQLite will throw an error since the column already exists. The `catch` block catches this error and ignores it safely, allowing the server to boot without crashing.

---

## 📍 3. JWT Token Payload Expansion

A common rookie mistake is querying the database on every single API request to check the user's role:
`SELECT role FROM users WHERE id = userId;`

*   **Why this is bad:** It creates severe database bottlenecks. If 1,000 users click buttons at the same time, the database gets hammered with 1,000 extra queries.
*   **The Better Way:** We store the user's `role` directly inside the **JWT Token payload** when signing the token during login:
    ```javascript
    const token = jwt.sign(
        { userId: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
    ```
    Since the JWT token is cryptographically signed and immutable (tamper-proof), the server can decode the token signature, read `req.user.role` instantly, and know their permissions without making a single database call!

---

## 📍 4. The `roleGuard` Middleware: Higher-Order Functions

To protect our API routes, we wrote a custom middleware in [roleGuard.js](file:///c:/Vindobona-Pro-FinTech/backend/server/middleware/roleGuard.js).

This middleware uses a JavaScript pattern called a **Higher-Order Function** (a function that returns another function):
```javascript
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // middleware checks...
    };
};
```
*   **Why do we do this?** It makes our guard extremely flexible. Instead of writing separate middleware files for `adminGuard`, `managerGuard`, and `guestGuard`, we can simply configure the allowed roles inline inside our routes:
    *   `requireRole(['admin'])` - Only admins allowed.
    *   `requireRole(['admin', 'auditor'])` - Admins and auditors allowed.

If a user tries to access a route without the permitted role, we reject the request with a **`403 Forbidden`** HTTP status code. 
*(Note: `401 Unauthorized` means we don't know who you are. `403 Forbidden` means we know who you are, but you do not have permission to be here).*

---

## 📍 5. The Double Security Checkpoint Flow

When an admin calls `GET /api/admin/users`, the request goes through **two check gates** in [admin.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/admin.js):

```javascript
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => { ... })
```

1.  **Gate 1 (`authenticateToken`):** Reads the header `Authorization: Bearer <token>`, verifies the signature using `JWT_SECRET`, and attaches the decoded payload to `req.user`.
2.  **Gate 2 (`requireRole(['admin'])`):** Inspects `req.user.role`. If it is `'admin'`, it calls `next()` to pass. If not, it blocks the request.
3.  **The Route Handler:** If both gates pass, it queries SQLite (`SELECT id, username, email, role, balance FROM users`) and returns the users. We explicitly omit `password_hash` from the SELECT statement to ensure password hashes never leak to the client.

---

## 📍 6. Integration Test Suite Realignment

In [auth.test.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.test.js), we updated our mock database schema inside the `beforeAll` block to match the production schema (adding the `role` and `balance` columns). We then wrote integration tests to test the RBAC rules:
1.  **Unauthorized Request Test:** Hits `GET /api/admin/users` without a token and verifies it returns `401`.
2.  **Standard User Rejection Test:** Registers a user, logs in to get a normal JWT token, calls `GET /api/admin/users`, and verifies it returns `403`.
3.  **Admin User Success Test:** Registers a user, updates their role to `'admin'` directly in the mock database using `UPDATE users SET role = 'admin'`, logs in to get an admin JWT token, calls `GET /api/admin/users`, and verifies it returns `200` with the user directory array.
