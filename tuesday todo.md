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

## 🚀 4. Production Launch on `.com` Custom Domain
* [ ] Commit all code changes to GitHub repository.
* [ ] Trigger Vercel production deployment build.
* [ ] Verify HTTPS connectivity and functional testing of wallets, exchanges, card freezing, map locations, budgets, and AI chat directly on the live custom domain.

---

## 🔮 4. Future Dashboard & Feature Extensions (Roadmap)

### 👤 Profile Picture Uploads
* [ ] **Backend**: Add a file upload route (`POST /api/users/avatar`) storing images locally or via cloud storage, updating the `users.avatar_url` database column.
* [ ] **Frontend**: Add an image upload picker in [SettingsView.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/SettingsView.tsx) and dynamically display the custom profile picture in [Sidebar.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/Sidebar.tsx).

### 👥 Registered Member Transfers (Fake Money Transfers)
* [ ] **Manage Members UI**: Add a tab/panel to show list of all registered users on the system (excluding current user).
* [ ] **Simulated Transfers**: Add an interactive transfer form where you select a registered member, enter an amount, and trigger `POST /api/transactions/transfer` to securely debit your wallet and credit theirs inside an atomic SQLite transaction.

### 📄 Bank Statement Document Downloads (Lesson 54)
* [ ] **Ledger Header Buttons**: Insert two button icons ("Export CSV" & "Export PDF") inside [TransactionList.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/TransactionList.tsx) or your Ledger view header.
* [ ] **File Streams**: Fetch `/api/transactions/export/csv` and `/api/transactions/export/pdf` with the secure token and trigger file downloads directly in the user's browser using anchor elements (`window.URL.createObjectURL(blob)`).

