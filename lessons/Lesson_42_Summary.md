# Lesson 42: Secure Password Reset Flow (Forgot Password) 🔑📬🔒

Welcome to Lesson 42! Now that our Express backend is connected to a real SMTP email network and we can verify new users via OTP codes, we are ready to tackle another critical feature of any professional application: the **Password Reset Flow**.

If a user forgets their password, they shouldn't be locked out of their financial ledger forever! In this lesson, we will learn how to securely generate temporary reset tokens, email them to the user, and allow them to safely reset their credentials.

---

## 1. What is a Password Reset Token? 🎟️

When a user requests a password reset, we **never** email them their old password (we can't anyway, because it's hashed using `bcrypt`!). Instead, we generate a temporary, unique **Password Reset Token**.

### 🗺️ The Analogy:
Think of a password reset token like a **temporary visitor badge** for a high-security vault 🏢:
*   **The Request**: You lose your key card (your password). You tell the front desk guard (Forgot Password page) your email.
*   **The Badge**: The guard verifies you own that email and prints a temporary badge (a random string like `rst_9f2a4d` stored in the database with an expiration time of 15 minutes).
*   **The Access**: You use this badge to enter the password reset room, type your new password, and save it.
*   **The Shredder**: Once you set your new password, the temporary badge is shredded (deleted from the database) so it can never be used again.

---

## 2. How the Reset Flow Works 🔄

Here is the security handshake flow:

```text
[ React Frontend ]                         [ Express Backend ]                   [ SQLite Database ]
        |                                           |                                     |
        | -- 1. Request Reset (Email) ----------->  | -- 2. Generate token & save it ---> | (Save reset_token &
        |                                           |       with a 15-min expiration      |  token_expiry)
        |                                           |                                     |
        |                                           | -- 3. Send email containing link -- |
        |                                           |       with the reset token          |
        |                                           |                                     |
        | <-- 4. Click Link (Reset Form) -----------|                                     |
        |                                           |                                     |
        | -- 5. Submit New Password & Token ------> | -- 6. Verify token & expiry ------> | (Check matches &
        |                                           |                                     |  time < expiry)
        |                                           | -- 7. Hash new password & save ---> | (Update password)
        | <--- 8. Redirect to Login Screen -------- |                                     |
```

---

## 🏗️ Lesson 42 Action Plan

We will implement password resets in **3 clear steps**:

### 🎟️ Step 1: Update Database Schema
We will add `reset_token` and `reset_token_expiry` columns to our SQLite `users` table so we can store the temporary badges and verify when they expire.

### ✉️ Step 2: Build the Forgot Password Endpoint
We will write a `POST /api/auth/forgot-password` route that accepts the user's email, generates a cryptographically secure token, saves it, and emails a beautifully styled link (e.g. `http://localhost:5173/reset-password?token=XYZ`) to their inbox.

### 🔐 Step 3: Build the Reset Password Endpoint & Form
We will create a `POST /api/auth/reset-password` route to verify the token and update the password. On the frontend, we will build a sleek, matching **Reset Password page** where the user can securely type and submit their new credentials.

---

## 🏆 Your Next Steps

Let's begin **Step 1** by updating our database schema to support secure reset tokens!
