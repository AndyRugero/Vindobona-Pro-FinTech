# 🚀 Vindobona Pro: Full-Stack Career Roadmap (Vienna Edition)

This roadmap outlines the milestones, security protocols, architecture patterns, and DevOps skills you are building in this project to qualify for Junior/Mid Full-Stack Engineer positions at major financial institutions in Vienna, such as **Erste Group** and **Raiffeisen Bank International (RBI)**.

---

## 🛡️ Phase 1: Bank-Grade Security & Authentication
Banks prioritize security above all else. A simple password login is not enough; they require multi-layered defense mechanisms.

- [ ] **Rate Limiting & Brute-Force Protection** (Completed: Lesson 43)
  - Limit login attempts to prevent automated password cracking.
  - Return clear, standard HTTP 429 error messages.
- [x] **Multi-Factor Authentication (MFA/2FA)** (Completed: Lesson 45)
  - Integrate `otplib` and `qrcode` to generate secure, time-based secrets.
  - Require a rolling 6-digit verification code from Google Authenticator to log in.
- [ ] **Secure JWT & Cookie Management**
  - Transition from storing JWT tokens in local storage (vulnerable to XSS attacks) to **HTTP-Only, Secure cookies**.
  - Implement access tokens (short-lived) and refresh tokens (long-lived) to manage user sessions professionally.
- [ ] **Secure Session Management & Inactivity Timeout**
  - Detect user inactivity and automatically log users out after 15 minutes of idle time.

---

## 📈 Phase 2: Premium Frontend, Charts & Deployment
Financial dashboards must load instantly, display complex data cleanly, and be accessible globally.

- [ ] **Data Visualization & Analytics** (Lesson 45)
  - Implement interactive financial charts (using Recharts or Chart.js) to display cash flow trends, income, and expenses.
  - Add filters for monthly, quarterly, and yearly financial analyses.
- [x] **Production Deployment to Vercel** (Completed: Lesson 46)
  - Connect your GitHub repository to Vercel for continuous deployment (CI/CD).
  - Configure environment variables securely on the server.
- [x] **Custom Domain Setup (`.com`)** (Lesson 47)
  - Link a custom domain (e.g., `vindobonafintech.com`) to the deployed React app.
  - Configure DNS settings and SSL certificates for secure HTTPS connections.

---

## 🚢 Phase 3: Enterprise Backend & DevOps
Banking teams look for developers who understand deployment environments and how databases scale.

- [x] **Containerization with Docker** (Completed: Lesson 48)
  - Write a `Dockerfile` for your backend server.
  - Write a `docker-compose.yml` file to orchestrate the Node backend and database services together in one command.
- [x] **Database Integrity & ACID Transactions** (Completed: Lesson 49)
  - Implement **SQL Transactions** (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`) for transactions and money transfers.
- [x] **Automated Testing (Unit & Integration)** (Completed: Lesson 50)
  - Write unit tests for authentication helper functions.
  - Write API integration tests using **Jest** and **Supertest** to test your endpoints automatically.
- [ ] **Developer Documentation & User Guides** (Lesson 50b - Deferred to end of project)
  - Write clean markdown API documentation and structural user guides for the financial portal.

---

## 🎨 Phase 4: Advanced Features & UI Polish
Making the project look premium and fully match your 80-Day PDF roadmap.

- [x] **User Roles (Admin vs. Standard User)** (Completed: Lesson 51)
  - Implement role-based access control (RBAC) to restrict admin settings.
- [x] **Secure Audit Trail Logs** (Lesson 52)
  - Build an audit log system to track all balance and database changes.
- [x] **PSD2-Compliant "Transaction Signing" (Strong Customer Authentication)** (Lesson 52b)
  - Require a 6-digit Google Authenticator code verification for every transaction to comply with PSD2 banking regulations.
- [x] **Full-Text Search & Filtering** (Lesson 53)
  - Add search input for descriptions and categories with server-side text queries.
- [x] **AI Chatbot Financial Assistant API** (Lesson 53b)
  - Integrate a chat interface to ask an AI bot questions about your account and financial metrics.
- [x] **Google Maps API integration (Vienna ATM / Branch Finder)** (Lesson 53c)
  - Display interactive maps showing active banks and ATMs in Vienna.
- [x] **Budget Tracking & Expense Alerts** (Lesson 53d)
  - Implement dynamic category budget limits with percentage progress warnings
- [x] **Financial Report Export (PDF & CSV)** (Lesson 54)
  - Add buttons to export financial records into spreadsheets and bank statements.
- [x] **Interactive "Freeze Card" Panel** (Lesson 54b)
  - Build a realistic 3D debit card widget with a "Freeze Card" toggle that locks out backend transaction processing.
- [x] **Real-time Currency Exchange & FX Converter** (Lesson 54c)
  - Fetch live FX exchange rates to convert funds between multiple currency wallets (EUR/USD/GBP).
- [ ] **UI Polish & Web Design Fundamentals (Part 1)** (Lesson 55)
  - Learn color systems, spacing, card layouts, and typography to make the UI look highly premium.
- [ ] **Micro-Animations & Dark Mode (Part 2)** (Lesson 56)
  - Build smooth CSS transitions, interactive hover states, and a toggleable Dark/Light Mode.

---

## ☁️ Phase 5: Production Cloud Orchestration
Bonus enterprise tools that will make your CV stand out to major Austrian banks.

- [ ] **Nginx Web Server & Reverse Proxy** (Lesson 56b)
  - Learn how to configure Nginx to route frontend and backend requests securely.
- [ ] **Kubernetes (K8s) Orchestration** (Lesson 57)
  - Write deployment configurations and manage running containers with the `kubectl` CLI.
- [ ] **Enterprise Cloud Deployment on Microsoft Azure** (Lesson 58)
  - Deploy containers to Azure App Services, set up Azure Database for PostgreSQL, and manage cloud assets.
- [ ] **[Deferred] Developer Documentation & User Guides** (Lesson 50b)
  - Write clean markdown API documentation and structural user guides for the financial portal.
- [x] Configure Docker Hub secrets in GitHub Actions for automated deployment (successfully verified).

