# Lesson 50: Automated Testing (Unit & Integration) 🧪🚦

Welcome to Lesson 50! Now that our backend has secure database transactions and containerized environments, we need to ensure that future changes don't break our existing features. 

Banks enforce strict **CI/CD quality gates**. Code cannot be deployed to production unless it passes a suite of automated tests. This lesson covers setting up unit testing and API integration testing.

---

## 1. Unit Testing vs. Integration Testing 🔬

### 🧩 The Car Analogy:
*   **Unit Testing:** You test the car's **headlight bulb** in a laboratory. You plug it into a battery to see if it shines. You are testing a single, isolated part of the car without needing the engine, steering wheel, or wheels.
*   **Integration Testing:** You mount the headlight into the car frame, turn the steering wheel dashboard switch, and check if the light turns on. You are testing if the switch, wires, battery, and bulb **work together (integrate)**.

In our project:
*   **Unit Tests:** Test small helper functions (like validating if an email matches a regex or comparing hashed passwords) in isolation.
*   **Integration Tests:** Start a mock Express server, send a real `POST /api/transactions/transfer` HTTP request, and verify that the balances update in a mock database.

---

## 2. Our Testing Stack 🛠️

We will use two industry-standard Node.js testing tools:

1.  **Jest:** The testing framework developed by Meta (Facebook). It provides the test runner, test assertion utilities (e.g., `expect(value).toBe(true)`), and mocking capabilities.
2.  **Supertest:** A library that allows us to test Express APIs. It mocks HTTP requests (`get`, `post`, `delete`) and sends them directly to our router without needing to run the server on port 5001.

---

## 3. Mocking the Database for Tests 🗃️
When running tests, we **never** want to write to our actual production `database.db` file. If we did, our test runs would corrupt real user balances.
*   **The solution:** In our integration tests, we will initialize an in-memory SQLite database (`:memory:`) or a temporary `test.db` file. The database is built, filled with mock users, tested, and completely destroyed after the tests finish.

---

## 🏗️ Lesson 50 Action Plan

We will implement automated testing in **4 steps**:

### 🛠️ Step 1: Install Jest and Supertest
Install the testing libraries as developer dependencies:
```bash
npm install --save-dev jest supertest
```

### 🛠️ Step 2: Write Unit Tests for Auth Helpers
Create a file `authHelpers.test.js` to write unit tests for functions that validate email syntax, password strength, and compare hashes.

### 🛠️ Step 3: Write API Integration Tests
Create integration test files to test API endpoints:
*   Test that `POST /api/auth/register` creates a user.
*   Test that `POST /api/auth/login` returns a secure token.
*   Test that `/api/transactions/transfer` fails when balance is insufficient.

### 🛠️ Step 4: Configure Test Runner
Add a `"test"` script inside your backend `package.json` to execute `jest --runInBand` and review automated test reports!
```json
"scripts": {
  "test": "jest --runInBand"
}
```
*(Note: `--runInBand` forces tests to run one-by-one sequentially, preventing database locks in SQLite).*
