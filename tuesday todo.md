# 📆 Tuesday TODO: AI Assistant & ATM Finder UI Integration

Here is the checklist of tasks to implement on Tuesday. We will build the frontend interfaces for both the AI Chatbot Assistant and the Vienna ATM/Branch Locator map, then launch the updated version live on your custom `.com` domain.

---

## 🤖 1. AI Chatbot Assistant UI (Lesson 53b)
* [ ] **Create Component**: Build `src/Components/Chatbot.tsx`
  * Floating Action Button (FAB) at the bottom-right of the viewport.
  * Toggles a chat window showing message history.
  * Connects to `POST /api/chat` passing the user's secure JWT token.
  * Displays typing spinner/indicator states and handles auto-scrolling to the latest message.
* [ ] **Create Stylesheet**: Build `src/Styles/Chatbot.css`
  * Add glassmorphism (`backdrop-filter`) and shadows for the chat container.
  * Style the user message bubbles (cyan gradient) vs. bot bubbles (slate theme).
* [ ] **Integrate**:
  * Render `<Chatbot token={token} />` globally in `src/App.tsx`.

---

## 🗺️ 2. Vienna ATM & Branch Finder UI (Lesson 53c)
* [ ] **Create Component**: Build `src/Components/ATMMap.tsx`
  * Dynamically load Leaflet CDN scripts and CSS stylesheets (completely free development, no Google billing keys required).
  * Center on Vienna and fetch location markers from `GET /api/locations`.
  * Style custom neon map marker pins for ATMs vs. Branches, showing hover popups with addresses.
  * Add a left side panel listing locations with pan-to-click functionality.
* [ ] **Create Stylesheet**: Build `src/Styles/ATMMap.css`
  * Grid layout separating the listing sidebar and the Leaflet interactive map element.
* [ ] **Sidebar Connection**:
  * Import the `Map` icon and append the "Branch Finder" nav item inside `src/Components/Sidebar.tsx`.
* [ ] **Router Connection**:
  * Import and conditional-render `<ATMMap token={token} />` when `currentView === 'map'` in `src/App.tsx`.

---

## 📊 3. Budget Management UI (Lesson 53d)
* [ ] **Create Component**: Build `src/Components/BudgetManager.tsx`
  * Fetch and display active budgets and their progress from `GET /api/budgets`.
  * Create a form to set a new budget cap with fields: Category (dropdown), Limit amount, and Time period/Reason.
  * Submit new budgets to `POST /api/budgets`.
  * Display a progress bar for each category showing `spent` vs `limit` indicating if the user has exceeded their budget.
* [ ] **Create Stylesheet**: Build `src/Styles/BudgetManager.css`
  * Add clean, modern cards for each budget category with progress bar indicators (green for good, red for exceeded).
* [ ] **Router Connection**:
  * Import and conditional-render `<BudgetManager token={token} />` when `currentView === 'budgets'` in `src/App.tsx`, and add a sidebar link.

---

## 👥 4. Registered Member Transfers UI (Fake Money Transfers)
* [ ] **Create Component**: Build `src/Components/MemberTransfers.tsx`
  * Fetch active user members from `GET /api/users/members` (excluding the current user).
  * Design user cards listing member usernames, emails, and transaction links.
  * Build a slider modal with a money transfer form (amount input, confirmation button).
  * On submit, send `POST /api/transactions/transfer` to transfer funds securely.
  * Show success checkmark animations and update balances in real time.
* [ ] **Sidebar Connection**: Add "Send Money" navigation link to [Sidebar.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/Sidebar.tsx).
* [ ] **Router Connection**: Render `<MemberTransfers token={token} />` when `currentView === 'transfer'` in `src/App.tsx`.

---

## 🛡️ 5. Admin Panel & Audit Logs UI (Role-Based Access)
* [ ] **Create Component**: Build `src/Components/AdminPanel.tsx`
  * Restrict access: Only render if logged-in user's role is `'admin'`.
  * **User Directory**: Table displaying all users, roles, and balances.
  * **Admin Controls**: Add switches/actions to freeze/unfreeze cards and promote users to admin.
  * **Live Audit Log**: Scrolling feed fetching security/event records from `GET /api/admin/logs` showing timestamps, IP addresses, and actions.
* [ ] **Create Stylesheet**: Build `src/Styles/AdminPanel.css` (tables, status badges, code/terminal style audit feed).
* [ ] **Sidebar Link**: Render the `🛡️ Admin` link at the bottom of [Sidebar.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/Sidebar.tsx) visible only to admin users.

---

## 🚀 6. Production Launch & Public Pages on `.com` Custom Domain
* [ ] **Build Public Info Pages**:
  * Build **About Us** page (Vindobona Pro vision, secure local Vienna-focused banking).
  * Build **FAQ** page (frequently asked questions about multi-currency wallets, 2FA security, card freezing, and ATM locations).
  * Design a modern, premium footer containing landing links.
* [ ] Commit all code changes to GitHub repository.
* [ ] Trigger Vercel production deployment build.
* [ ] Verify HTTPS connectivity and functional testing of wallets, exchanges, card freezing, map locations, budgets, member transfers, admin audit logs, and AI chat directly on the live custom domain.

---

## 🔮 7. Future Dashboard & Feature Extensions (Roadmap)

### 👤 Profile Picture Uploads
* [ ] **Backend**: Add a file upload route (`POST /api/users/avatar`) storing images locally or via cloud storage, updating the `users.avatar_url` database column.
* [ ] **Frontend**: Add an image upload picker in [SettingsView.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/SettingsView.tsx) and dynamically display the custom profile picture in [Sidebar.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/Sidebar.tsx).

### 📄 Bank Statement Document Downloads (Lesson 54)
* [ ] **Ledger Header Buttons**: Insert two button icons ("Export CSV" & "Export PDF") inside [TransactionList.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/TransactionList.tsx) or your Ledger view header.
* [ ] **File Streams**: Fetch `/api/transactions/export/csv` and `/api/transactions/export/pdf` with the secure token and trigger file downloads directly in the user's browser using anchor elements (`window.URL.createObjectURL(blob)`).
