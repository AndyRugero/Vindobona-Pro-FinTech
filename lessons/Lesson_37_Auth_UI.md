# Lesson 37: Creating the Authentication UI (Login & Sign-Up Screen) 🎨🚪🔑

Welcome to Lesson 37! Now that our backend is secured with JWT tokens and our routes require authentication, we need to build the actual **User Interface (UI)** so users can sign up and log in without using the browser devtools console.

In this lesson, we will build a beautiful Login/Register toggle screen in React and wire it up to our Auth API!

---

## 1. The UX Flow: Login vs Dashboard 🗺️

To display the Login screen or the Dashboard, we need to track if a user has a token:
*   **No Token**: Show the **Auth Screen** (which can toggle between a Login form and a Sign-up form).
*   **Token Exists**: Show the main **Dashboard shell** (the sidebar, stats, trend charts, and ledger).

We will control this using a simple React state at the very top of our app (in `App.tsx`):
```typescript
const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
```
If `token` is `null`, we show the Login form. If it is active, we render the Dashboard!

---

## 2. Security UX Best Practices 🛡️

*   **Secure Inputs**: Use `<input type="password" />` so the characters are hidden on screen.
*   **Feedback**: Show clear error messages (e.g., *"Username already taken"* or *"Invalid credentials"*) so users know what went wrong.
*   **Redirect on Success**: Once the login API returns a token, save it to `localStorage` and update the React state to immediately take them to their dashboard.

---

## 🏗️ Lesson 37 Action Plan

We will build the Auth UI in **3 clear steps**:

### 📦 Step 1: Create the Auth Screen Component
We will create `AuthScreen.tsx` containing forms for Username and Password. It will have a button to toggle between *"Need an account? Sign Up"* and *"Already have an account? Log In"*.

### ✍️ Step 2: Wire up the Register & Login Fetch Requests
We will write the submit handlers inside `AuthScreen.tsx` that send POST requests to `/api/users/register` and `/api/auth/login`. On successful login, it will save the token and username.

### 🔌 Step 3: Wire App.tsx to Guard the Dashboard
We will modify `App.tsx` to conditionally render the `AuthScreen` if there is no token, and add a "Logout" button inside the Topbar to clear the token and return to the Login screen.

---

## 🏆 Your Next Steps

Let's begin **Step 1** by creating the new `AuthScreen.tsx` file inside your components folder!
