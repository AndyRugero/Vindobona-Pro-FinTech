# 🚀 Vindobona Pro: Master Revision Plan (Wiederholungsplan)

This comprehensive guide is designed to take you from a learner following tutorials to an **independent software engineer** capable of coding without AI help. It covers Lessons 1 to 58, TypeScript critical thinking quizzes, and banking interview problem-solving strategies.

---

## 📅 Part 1: The Lesson 1–58 Rebuild Syllabus
To master this stack, schedule a rebuild of your project in 5 logical phases:

### Phase 1: Frontend UI & Layout (Lessons 1–25)
*   **Goal:** Rebuild the CSS and React visual architecture.
*   **Revision Focus:** CSS Flexbox/Grid, semantic HTML, responsive design, custom CSS variables (themes), and building reusable UI components (Buttons, Input Fields, Sidebars).

### Phase 2: React State & Context (Lessons 26–37)
*   **Goal:** Manage client data without database connection.
*   **Revision Focus:** `useState`, `useEffect` (for data loading lifecycle), and `useContext` (global transaction state).

### Phase 3: Express Backend & Database (Lessons 38–44)
*   **Goal:** Create a persistent REST API.
*   **Revision Focus:** Node.js, Express routing, SQLite databases (`database.db`), and CRUD SQL statements.

### Phase 4: Bank-Grade Security & Features (Lessons 45–56)
*   **Goal:** Add PSD2 compliance, MFA, roles, search, and exports.
*   **Revision Focus:** Rate-limiting, JWT authentication (HTTP-Only cookies), Google Authenticator 2FA, SQL ACID transactions, user roles, full-text search, PDF/CSV export, and the 3D Freeze Card panel.

### Phase 5: DevOps, K8s & Azure (Lessons 57–58)
*   **Goal:** Containerize and orchestrate for enterprise banks.
*   **Revision Focus:** Writing `Dockerfile` and `docker-compose.yml`, using `kubectl` CLI commands, and hosting containerized apps on Microsoft Azure.

---

## 🧠 Part 2: TypeScript "Self-Coding" Critical Thinking Quiz
Try to solve these 4 problems by writing the code on paper or in a blank file before reading the answers. These cover the exact TypeScript skills you need in our banking app:

### Challenge A: Typing an API Response
When you fetch data from the backend, you must type the response to avoid using `any`.
**Task:** Define a TypeScript `interface` called `Transaction` where:
- `id` is a unique number.
- `amount` is a number.
- `category` is one of these exact values: `"Groceries"`, `"Salary"`, or `"Rent"`.
- `description` is a string but is **optional** (might not exist).

*Try to write it now!*
<details>
<summary><b>Click to reveal the correct answer</b></summary>

```typescript
type TransactionCategory = "Groceries" | "Salary" | "Rent";

interface Transaction {
  id: number;
  amount: number;
  category: TransactionCategory;
  description?: string; // The "?" makes it optional!
}
```
</details>

---

### Challenge B: Typing a React Component's Props
You want to make a reusable `Card` component that accepts a `title` (string) and a `value` (number) as inputs (Props).
**Task:** Write the TypeScript interface for the Props and the React component signature.

*Try to write it now!*
<details>
<summary><b>Click to reveal the correct answer</b></summary>

```typescript
import React from 'react';

interface CardProps {
  title: string;
  value: number;
}

// React.FC binds our CardProps interface to the component input
const Card: React.FC<CardProps> = ({ title, value }) => {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>€{value.toFixed(2)}</p>
    </div>
  );
};
```
</details>

---

### Challenge C: Fixing Optional Chaining
You try to read `user.profile.address.city`, but sometimes `profile` or `address` is missing, causing the app to crash with the error: `TypeError: Cannot read properties of undefined`.
**Task:** Rewrite the expression using TypeScript's safety rules so it never crashes.

*Try to write it now!*
<details>
<summary><b>Click to reveal the correct answer</b></summary>

```typescript
// The "?" checks if the object exists before trying to read the next property:
const userCity = user?.profile?.address?.city || "Unknown City";
```
</details>

---

## 💼 Part 3: Banking Interview "Problem Solver" Scenarios
Viennese bank interviewers want to see how you analyze problems. Here are mock scenarios:

### Scenario 1: The "It works on my machine!" problem
*   **Interviewer:** *"We deployed a new update, but it crashed on the test server. How do you investigate?"*
*   **Your Answer Pattern:** 
    1.  *"I look at version differences. First, I check if the Node.js version on the test server matches my local machine."*
    2.  *"I review the container logs using `docker logs` or the Azure Portal log stream to find the exact line causing the crash."*
    3.  *"To prevent this, I ensure we enforce **Dev-Prod Parity** by packaging the entire server setup inside a Docker container so it runs identically in all environments."*

### Scenario 2: Preventing Double-Spending
*   **Interviewer:** *"Two users transfer money at the exact same millisecond. How do you prevent data corruption?"*
*   **Your Answer Pattern:**
    *   *"I implement **SQL Transactions** (using `BEGIN TRANSACTION` and `COMMIT`). If User A transfers €50 to User B, the database subtracts €50 from A and adds €50 to B. If one of those queries fails, or if a database deadlock occurs, the transaction automatically rolls back (`ROLLBACK`) so that no money disappears. I also configure the database engine to use proper isolation levels (like Serializable or Row-Level Locking)."*

---

## 🎨 Part 4: How to Present Your Project to Recruiters
When you show your portfolio to a hiring manager, follow the **"Wow-First"** demo rule:

1.  **Do not start with the login screen.** Show them the **live dashboard** first.
2.  **Point out the security badges:** Explain that the app runs over secure HTTPS and has full **Multi-Factor Authentication (2FA)** integrated.
3.  **Perform a live action:** Click the **Freeze Card** button, show the card turn to ice, and then try to make a transaction to show the backend blocking it. Explain: *"This demonstrates strict frontend-backend state synchronization and security compliance."*
4.  **Show the architecture:** Open your GitHub repository and show your `Dockerfile` and `docker-compose.yml` to prove you understand DevOps and container scaling.
5.  **Explain the business value:** Say: *"I built this to match European PSD2 compliance rules for fintech companies, prioritizing database transaction safety and user security."*
