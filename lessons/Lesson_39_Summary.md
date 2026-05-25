# Lesson 39: Session Management & Auto Logout (The Sleepy Butler) ⏱️🚪💤

Welcome to Lesson 39! In the previous lesson, we secured our keys and validated our inputs. But what happens if a user logs into their financial dashboard on a public library computer, walks away to get a coffee, and forgets to click "Logout"? 

Anyone who sits down at that computer can see their bank ledger! To prevent this, we need to build an **Auto Logout (Session Timeout)** system.

---

## 1. What is an Auto Logout System? 🕒

An Auto Logout system monitors the user's activity. If the user doesn't move their mouse, click any buttons, or type any keys for a certain period (e.g., 15 minutes), the app automatically deletes their token and logs them out.

### 🗺️ The Analogy:
Think of your app's session like a **candle** 🕯️. 
* Every time the user interacts with the app (clicks, scrolls, moves the mouse), they **relight** the candle.
* If they walk away, the candle slowly burns down. 
* If the candle burns out completely (15 minutes of inactivity), the butler (`App.tsx`) blows out the lights and locks the vault door (clears the token and redirects to the Login screen).

---

## 2. How React Monitors Inactivity 👁️

To track if a user is active, we listen to global browser events:
* `mousemove` (moving the mouse)
* `mousedown` (clicking the mouse)
* `keypress` (typing on the keyboard)
* `scroll` (scrolling the page)

Every time one of these events fires, we **reset a timer**. If no events fire before the timer runs out, the logout function is triggered.

---

## 🏗️ Lesson 39 Action Plan

We will implement this security feature in **3 clear steps**:

### ⏱️ Step 1: Define the Inactivity Timer
We will write an inactivity hook or `useEffect` inside `App.tsx` that starts a `setTimeout` timer.

### 👂 Step 2: Bind Global Event Listeners
We will attach event listeners to the browser window. Every time the user moves, clicks, scrolls, or types, we will reset the timer.

### 🧹 Step 3: Clean up and Test
We will configure a short timeout (like 10 seconds) to test and verify that the app successfully logs out automatically, then change it to a professional 15-minute duration. We will also clean up listeners to prevent memory leaks.

---

## 🏆 Your Next Steps

Let's begin **Step 1** by writing our inactivity tracker inside `App.tsx`!
