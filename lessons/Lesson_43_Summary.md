# Lesson 43: Rate Limiting & Account Lockouts (Brute-Force Protection) 🛡️⏱️🚫

Welcome to Lesson 43! Now that our Vindobona dashboard is equipped with email verification and a secure password reset flow, we have several "open doors" (endpoints) on our backend.

While these doors are locked with security guards (Bcrypt hashing and JWT tokens), automated bots can still try to break in by guessing passwords or spamming our email reset system thousands of times per minute. In this lesson, we will learn how to defend our backend using **Rate Limiting** and **Account Lockouts**.

---

## 1. What is Rate Limiting? 🚪🕴️

Rate limiting is the practice of restricting the number of requests a user (or a specific IP address) can make to your server within a given timeframe.

### 🗺️ The Analogy:
Think of rate limiting like a **Vigilant Club Bouncer** at the VIP door:
*   **Normal Guest**: You walk up and give the password. You get it wrong once, try a second time, and get in. The bouncer welcomes you.
*   **The Impostor Bot**: A bot walks up and screams 100 different passwords at the bouncer in less than 2 seconds.
*   **The Lockout**: The bouncer immediately grabs the bot, throws them out, and locks the gate. The bouncer tells them: *"You are banned from trying again for the next 15 minutes."*

Without rate limiting, a hacker could run a computer program to guess passwords (a **Brute-Force Attack**) or spam your email server with millions of emails, costing you money and crashing your server.

---

## 2. How Rate Limiting Works 🔄

We track incoming requests by the client's **IP Address** and keep a counter in the server's memory:

```text
[ Client IP: 192.168.1.50 ]
        |
        | -- 1. POST /api/auth/login ---> [ Bouncer (Rate Limiter) ]
        |                                        |
        |                                        |-- Counter: 1 (OK)
        |                                        |
        | -- 2. POST /api/auth/login ---> [ Bouncer (Rate Limiter) ]
        |                                        |
        |                                        |-- Counter: 2 (OK)
        |                                        |
        | -- 3. POST /api/auth/login ---> [ Bouncer (Rate Limiter) ]
        |                                        |
        |                                        |-- Counter: 3 (Exceeded Limit!)
        |                                        |
        | <--- 4. Response: HTTP 429 ------------| (Too Many Requests! Locked Out)
```

---

## 3. The Rosetta Stone: C# vs. Node.js 🔍

If you have built APIs in C#, you are likely familiar with rate limiting structures:

| ASP.NET Core (C#) | Express (Node.js) | Purpose |
| :--- | :--- | :--- |
| `Microsoft.AspNetCore.RateLimiting` | `express-rate-limit` | The core package used to limit requests. |
| `AddFixedWindowLimiter` | `rateLimit({ windowMs, max })` | Restricts users to X requests in Y minutes. |
| `HTTP 429 (Too Many Requests)` | `res.status(429)` | The standard response code sent to blocked clients. |

---

## 🏗️ Lesson 43 Action Plan

We will implement brute-force defense in **3 clear steps**:

### 📦 Step 1: Install Rate Limiting Middleware
We will install `express-rate-limit`, the industry-standard rate limiter middleware for Express.

### 🛡️ Step 2: Configure Global and Strict Limiters
We will set up two types of bouncers:
1.  **Global Limiter:** A loose rate limiter (e.g., 100 requests per 15 minutes) applied to all dashboard endpoints to prevent server abuse.
2.  **Strict Limiter:** A tight rate limiter (e.g., 5 login/forgot-password attempts per 15 minutes) to block credential-guessing bots.

### 🧪 Step 3: Handle the Lockout on the Frontend
We will update our React components to handle `HTTP 429` (Too Many Requests) errors gracefully and show a user-friendly countdown timer.

---

## 🏆 Your Next Steps

Let's begin **Step 1** by installing our new package in the terminal!
