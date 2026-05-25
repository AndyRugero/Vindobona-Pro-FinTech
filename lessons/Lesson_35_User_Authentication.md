# Lesson 35: User Authentication (The Velvet Rope) 🔑🚪🛡️

Welcome to Lesson 35! In the last lesson, we successfully stored transactions in a local SQLite database. But right now, anyone who opens the dashboard can see and change your transactions. 

In this lesson, we will learn how to add **User Authentication** so users must register and log in to see their private financial vault.

---

## 1. The Core Concept: How Authentication Works on the Web 🌐

In a desktop app (like WPF), you might check a password locally. On the web, we use a **Client-Server** handshake:

1.  **Register (Sign Up)**: The user chooses a username and password. The server secures the password and saves it to a `users` table in the database.
2.  **Login**: The user enters their credentials. The server verifies them and hands the user a **JSON Web Token (JWT)**—which is like a digital VIP wristband.
3.  **Authorized Requests**: For every future request (like fetching transactions), the client shows this JWT wristband to the server. The server verifies it and allows access.

---

## 2. Rule #1 of Security: Never Store Plain Text Passwords! 🚫

If a hacker steals your `database.db` file and you stored passwords as plain text (e.g. `mySuperSecretPassword123`), the hacker now has everyone's passwords.

To prevent this, we **Hash** passwords before saving them using a library called **`bcryptjs`**:
*   **Hashing** is a one-way mathematical function. It turns `password123` into a long, scrambled mess (e.g. `$2a$10$X87ad9...`).
*   It is mathematically impossible to reverse a hash back into the password.
*   When a user logs in, we hash their input password and compare it to the stored hash.

---

## 3. What is a JWT (JSON Web Token)? 🎟️

Once a user successfully logs in, we don't want them to keep typing their password every time they click a button. Instead, the server generates a **JWT**:
*   A JWT is a cryptographically signed string containing user details (like `userId` and `username`).
*   Because it is signed with a secret key known only to the server, the client cannot tamper with it.
*   The client stores this token in their browser and sends it in the `Authorization` header on every request.

---

## 🏗️ Lesson 35 Action Plan

We will implement authentication in **3 clear steps**:

### 📦 Step 1: Install packages & Setup the Users Table
We will install `bcryptjs` and `jsonwebtoken` in our `backend` folder, then update our database startup to create a `users` table.

Run the following commands in your terminal:
```bash
# Navigate to the backend directory
cd backend

# Install the security and token libraries
npm install bcryptjs jsonwebtoken
```
```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);
```

### ✍️ Step 2: The Register (Sign Up) Route
We will create a `/api/auth/register` endpoint that:
1. Checks if the username already exists.
2. Hashes the password using `bcryptjs`.
3. Inserts the new user into the database.

### 🔑 Step 3: The Login Route & Token Generation
We will create a `/api/auth/login` endpoint that:
1. Looks up the username in the database.
2. Compares the submitted password with the stored hash.
3. Generates a signed JWT token if they match, and returns it to the user.

---

## 🏆 Your Next Steps

Let's begin **Step 1** by installing the security packages and adding the `users` table to the database!
