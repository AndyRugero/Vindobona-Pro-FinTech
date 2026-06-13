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

## 🚀 3. Production Launch on `.com` Custom Domain
* [ ] Commit all code changes to GitHub repository.
* [ ] Trigger Vercel production deployment build.
* [ ] Verify HTTPS connectivity and functional testing of wallets, exchanges, card freezing, map locations, and AI chat directly on the live custom domain.
