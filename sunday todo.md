# 📆 Sunday TODO: DevOps Lessons & Member Transfers UI Refinement

Here is the structured checklist of tasks for Sunday. This includes studying/implementing the cloud orchestration modules and refining the Registered Member Transfers UI with instant balance/ledger sync, card freeze safety, and proper category displays.

---

## ☁️ 1. DevOps: Nginx & Kubernetes (Lessons 56b & 57)

- [ ] **Nginx Web Server & Reverse Proxy** (Lesson 56b)
  - Configure Nginx as a reverse proxy to receive incoming requests on ports `80`/`443` and route them securely:
    - `/` and static frontend pages route to the React dev server/build folder.
    - `/api/*` requests route to the Express backend server (port `5001`).
  - Set appropriate cache-control, CORS headers, and request body size limits in `nginx.conf`.
- [ ] **Kubernetes (K8s) Orchestration** (Lesson 57)
  - Write container orchestration files inside the `k8s/` directory.
  - Define a Deployment manifest for the backend container.
  - Define a Service manifest (ClusterIP/NodePort) to expose backend access.
  - Test deployment pods and services using the `kubectl` CLI tool.

---

## 👥 2. Member Transfers UI & Context Integration (Lesson 53d Refinement)

The Member Transfers UI & Context Integration section has exactly 5 main implementation tasks (checklists):
- **Modify Transaction Context** ([TransactionContext.tsx](file:///c:/Vindobona-Pro-FinTech/src/Context/TransactionContext.tsx)): Extract and expose the `loadTransactions` function.
- **Update Transfers Component** ([MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx)): Wire up the refresh on successful transfer and restrict to real database users.
- **Card Status Load Check** ([MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx)): Fetch card status via `GET /api/users/card-status`.
- **Frozen Card Transfer Prevention** ([MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx)): Display the warning banner and disable modal inputs and confirmation button if frozen.
- **Update Backend Transfer Logic** ([transactions.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/transactions.js)): Change the ledger transaction insert query to store the sender/receiver usernames as the category.

### 2.1. Instant Ledger Refresh & Context Update
- [ ] **Modify Transaction Context** ([TransactionContext.tsx](file:///c:/Vindobona-Pro-FinTech/src/Context/TransactionContext.tsx)):
  - Refactor the initial fetch logic into a reusable async function named `loadTransactions` (which fetches all user transactions from `/api/transactions` using the JWT token and saves them to `ledgerData` state).
  - Add `loadTransactions` to the `TransactionContextType` interface and context provider value.
- [ ] **Update Transfers Component** ([MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx)):
  - Retrieve `loadTransactions` from `useTransactionContext`.
  - Upon successful transfer execution, trigger `await loadTransactions()` so that the ledger table and stats widgets refresh instantly without a page reload.
  - **Real Database Users:** Ensure the search UI fetches and searches real registered users from the database (via `GET /api/users/members`), preventing transfers to non-existent or mocked accounts.

### 2.2. Card Freeze Safety Check (UX Guard)
- [ ] **Check status on load** in [MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx):
  - Add an `isCardFrozen` state variable to the component.
  - In the `fetchData` function, fetch the current card status from `GET /api/users/card-status`.
  - Set `isCardFrozen` to the response status.
- [ ] **Prevent transfer when card is frozen**:
  - If `isCardFrozen` is true, render a prominent warning banner inside the transfers view: `Your debit card is frozen. Outgoing payments are locked! ❄️`
  - Disable the transfer amount input, the 2FA signature input, and the "Confirm & Send" button in the modal.

### 2.3. Transaction Category Username Mapping
- [ ] **Update backend transfer logic** ([transactions.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/transactions.js)):
  - In the `POST /transfer` route:
    - Update the sender's transaction query to set the `category` column to the sender's own username (e.g. `Andy Rugero` instead of the static `'Transfer'`).
    - Update the receiver's transaction query to set the `category` column to the receiver's username (e.g. `Shiwam.kc`).
  - This ensures that when the ledger shows a transfer, the category maps directly to the active username.

---

## 🛡️ 3. Admin Panel - Remove User Action (Sunday Extension)

- [ ] **Backend Delete User Route** ([admin.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/admin.js)):
  - Implement `DELETE /users/:id` protected by `authenticateToken` and `requireRole(['admin'])`.
  - Prevent self-deletion: Verify that the target `:id` is not equal to `req.user.userId`.
  - Run database queries to clean up related user tables (transactions, wallets, budgets) and then delete the user row from `users`.
  - Write an audit log entry tracking this action (e.g., `ADMIN_USER_DELETE`).
- [ ] **Frontend Action Button & Logic** ([AdminPanel.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/AdminPanel.tsx)):
  - Update the User Directory table layout to include a red "Remove User" button next to "Freeze Card" / "Promote".
  - Implement the click handler with confirmation checking (`window.confirm("Are you sure you want to permanently delete user [username]?")`).
  - Send the delete API request and immediately refresh the directory table view.

---

## ✉️ 4. Mailbox Notifications & Broadcast (Sunday Extension)

- [ ] **Database & Schema Updates**:
  - Create a new database table `notifications` (fields: `id` TEXT PRIMARY KEY, `sender` TEXT, `message` TEXT, `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP, `is_read` INTEGER DEFAULT 0).
- [ ] **Backend Notification & Email Router** (New Router `routes/notifications.js`):
  - `GET /api/notifications`: Fetch all broadcast messages.
  - `POST /api/notifications/broadcast` (Admin-Only): Allow Andy Rugero to broadcast a new notification message.
    - **Dual Delivery Suggestion (In-App + Real Email):** We suggest adding an optional flag `sendEmail` (boolean) to the body. If true, the backend will fetch all registered emails from the database and call `sendEmail(user.email, 'System Update Alert 🔑', emailTemplate)` using your existing `emailService.js`.
- [ ] **Frontend Topbar Mailbox Integration & Popup** ([Topbar.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/Topbar.tsx)):
  - Make the Mailbox SVG icon clickable and load notifications from `GET /api/notifications`.
  - Maintain a state for notifications list and unread count to dynamically update the red numeric badge (e.g. `3`).
  - **Unread Popup Modal:** Clicking the mailbox icon opens a modal/popup displaying a feed of update notifications (e.g., `"Andy has updated something today..."`) with relative timestamps (e.g., `"1 hour ago"` or exact time).
- [ ] **Admin Broadcast Test Trigger** ([AdminPanel.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/AdminPanel.tsx)):
  - Add a "Test & Broadcast Update" card inside the Admin Panel.
  - Provide a text field to write custom update logs and a checkbox: `"Also notify via real Email"`.
  - Clicking "Broadcast System Message" sends the payload to `POST /api/notifications/broadcast` so users see the update in their in-app mailbox instantly, or receive a real email if requested.

---

## 💸 5. Daily Money Transfer Limits (Sunday Extension)

- [ ] **Database Column Schema**:
  - Add a new column `daily_transfer_limit` (REAL DEFAULT 1000.0) to the `users` table to store each user's maximum daily allowance.
- [ ] **Backend Limit Validation** ([transactions.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/transactions.js)):
  - In `POST /transfer`, calculate total transfers made by the user in the last 24 hours:
    - Retrieve all outgoing transfers where `user_id = ? AND is_negative = 1`.
    - Filter those created within the last 24 hours (e.g. by parsing the timestamp in the transaction `id`).
  - Compare `total_sent_today + amount` against the user's `daily_transfer_limit`.
  - Reject with `400 Bad Request` if the transfer exceeds their remaining daily limit.
- [ ] **Frontend Limit Info Display** ([MemberTransfers.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/MemberTransfers.tsx)):
  - Fetch the user's profile/wallet details to get their daily limit and sent-today total.
  - Display helper text in the transfer modal: `"Daily Limit: €1000.00 | Sent Today: €120.00 | Remaining: €880.00"`.
  - Validate the amount in the form and show a validation error if they exceed the remaining limit.
- [ ] **Admin Limit Adjustment** ([AdminPanel.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/AdminPanel.tsx)):
  - Add a text input or button to allow the Admin (Andy Rugero) to edit and save a user's daily transfer limit in the User Directory table.




