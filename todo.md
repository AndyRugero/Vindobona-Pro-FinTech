# 🚀 Vindobona Pro: Full-Stack Career Roadmap (Vienna Edition)

This roadmap outlines the milestones, security protocols, architecture patterns, and DevOps skills you are building in this project to qualify for Junior/Mid Full-Stack Engineer positions at major financial institutions in Vienna, such as **Erste Group** and **Raiffeisen Bank International (RBI)**.

---

## 🛡️ Phase 1: Bank-Grade Security & Authentication
Banks prioritize security above all else. A simple password login is not enough; they require multi-layered defense mechanisms.

- [ ] **Rate Limiting & Brute-Force Protection** (Completed: Lesson 43)
  - Limit login attempts to prevent automated password cracking.
  - Return clear, standard HTTP 429 error messages.
- [/] **Multi-Factor Authentication (MFA/2FA)** (In Progress: Lesson 44)
  - Integrate `otplib` and `qrcode` to generate secure, time-based secrets.
  - Require a rolling 6-digit verification code from Google Authenticator to log in.
- [ ] **Secure JWT & Cookie Management**
  - Transition from storing JWT tokens in local storage (vulnerable to XSS attacks) to **HTTP-Only, Secure cookies**.
  - Implement access tokens (short-lived) and refresh tokens (long-lived) to manage user sessions professionally.

---

## 📈 Phase 2: Premium Frontend, Charts & Deployment
Financial dashboards must load instantly, display complex data cleanly, and be accessible globally.

- [ ] **Data Visualization & Analytics** (Lesson 45)
  - Implement interactive financial charts (using Recharts or Chart.js) to display cash flow trends, income, and expenses.
  - Add filters for monthly, quarterly, and yearly financial analyses.
- [ ] **Production Deployment to Vercel** (Lesson 46)
  - Connect your GitHub repository to Vercel for continuous deployment (CI/CD).
  - Configure environment variables securely on the server.
- [ ] **Custom Domain Setup (`.com`)** (Lesson 47)
  - Link a custom domain (e.g., `vindobonafintech.com`) to the deployed React app.
  - Configure DNS settings and SSL certificates for secure HTTPS connections.

---

## 🚢 Phase 3: Enterprise Backend & DevOps
Banking teams look for developers who understand deployment environments and how databases scale.

- [ ] **Containerization with Docker** (Lesson 48)
  - Write a `Dockerfile` for your backend server.
  - Write a `docker-compose.yml` file to orchestrate the Node backend and database services together in one command.
  - Ensure local development matches production exactly using containers.
- [ ] **Database Integrity & ACID Transactions** (Lesson 49)
  - Implement **SQL Transactions** (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`) for transactions and money transfers.
  - *Why banks look for this:* If a user transfers money, the money must be deducted from Account A AND added to Account B. If one step fails, the entire transaction must roll back to prevent money from disappearing.
- [ ] **Automated Testing (Unit & Integration)** (Lesson 50)
  - Write unit tests for your authentication helper functions.
  - Write API integration tests using **Jest** and **Supertest** to test your endpoints automatically.

---

## 🌟 Vienna Bank-Specific Portfolio "Wow-Factors"
These are bonus additions you can implement to blow hiring managers away during your technical interview.

- [ ] **Secure Audit Trail Logs**
  - Implement a logging service (like Winston) that tracks critical actions (e.g., `"User [X] logged in from IP [Y]"`, `"Transaction [ID] completed by user [Z]"`).
  - *Bank Relevance:* Compliance laws (like PSD2 and GDPR) require detailed access logs for financial systems.
- [ ] **Financial Report Export**
  - Build a feature to export transaction histories and charts as formatted **PDFs** or **CSV spreadsheets**.
- [ ] **Strict TypeScript Types**
  - Ensure the entire codebase is fully type-safe on both the frontend and backend to show you know how to write self-documenting, crash-resistant code.
