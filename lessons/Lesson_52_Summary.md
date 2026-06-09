# Lesson 52: Secure Audit Trail Logs 🏦📜👁️

Welcome to Lesson 52! Now that we have implemented Role-Based Access Control, we must build a system to monitor activities. In professional finance, a bank cannot let database updates happen silently. Any critical action (like transferring funds, changing passwords, enabling 2FA, or logging in) must be permanently recorded in a secure, read-only **Audit Trail**.

Even if an administrator has full control over the database, security audits mandate that logs are immutable (meaning they cannot be deleted or modified).

---

## 📍 1. What is an Audit Trail?

An **Audit Trail** is a chronological record of security and financial events in an IT system. 

### 🗺️ The Analogy: The Bank Security Guard's Ledger 📖
Imagine a bank branch in Vienna:
*   Every time an employee enters the vault, updates a customer's record, or transfers a box of cash, they must sign the **Security Guard's Ledger** at the door.
*   They write: *Who* they are, *What* action they took, *Which* vault they entered, *Where* they came from (workstation ID), and the exact *Time* stamp.
*   The guard's ledger is kept in a locked glass case. No teller, cashier, or even the branch manager is allowed to erase a line in the ledger. It is a permanent, secure paper trail.

In our backend, the **Audit Trail** is a dedicated database table (`audit_logs`) that registers every critical state-change.

---

## 📍 2. The `audit_logs` Database Schema

To record security events, we will create a new table in our SQLite schema:

```sql
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,       -- Unique log entry ID
    user_id TEXT,              -- The user who initiated the action (foreign key)
    action TEXT NOT NULL,      -- The action taken (e.g., 'LOGIN_SUCCESS', 'TRANSFER_FUNDS')
    details TEXT,              -- A text description or JSON payload of what changed
    ip_address TEXT,           -- The IP address the request originated from
    timestamp TEXT NOT NULL,   -- Date and time of the event
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🏗️ Lesson 52 Action Plan

We will implement this logging system in **4 steps**:

### 🛠️ Step 1: Create the Schema Table
Update `backend/server/server.js` to initialize the `audit_logs` table on startup.

### 🛠️ Step 2: Build the Audit Logging Service
Create a helper service file `backend/server/services/auditService.js` that exports a standard `logAuditEntry` function. This service will generate a unique log ID, grab the current timestamp, and run the SQL insert statement:
```javascript
const logAuditEntry = async (db, userId, action, details, ipAddress) => { ... }
```

### 🛠️ Step 3: Inject the Logger into Route Handlers
Identify all security-critical endpoints and call `logAuditEntry` inside them:
1.  **Register & Login:** Log when a user registers, logs in successfully, or triggers a 2FA login.
2.  **Password Resets:** Log when a password reset is requested or executed.
3.  **2FA Actions:** Log when 2FA is enabled or disabled.
4.  **Transfers:** Log when a safe money transfer is completed (recording both the sender and receiver actions).

### 🛠️ Step 4: Create the Admin Audit Viewer Route
Add a new route `GET /api/admin/audit-logs` inside `routes/admin.js` that retrieves all logs in reverse-chronological order (newest first). Secure this route using `authenticateToken` and `requireRole(['admin'])`.
