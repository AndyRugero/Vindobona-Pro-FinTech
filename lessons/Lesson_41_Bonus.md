# Lesson 41 Bonus: Email Verification System Explained 📧🔑🛡️

In this lesson, we successfully integrated a complete secure email verification flow. Below is an overview of the new folders, files, and architectural relationships created.

---

## 🗺️ The Project Layout Updates

Here are the specific directories and files that we added or modified to implement this secure system:

```text
c:\Vindobona-Pro-FinTech
├── backend/
│   ├── server/
│   │   ├── server.js               # Modified: Recreated database with "email TEXT UNIQUE" column and verified status
│   │   ├── routes/
│   │   │   └── auth.js             # Modified: Added register validation, verification OTP generation, unverified login checks, and code confirmation endpoint
│   │   ├── services/
│   │   │   └── emailService.js     # [NEW]: Prepares Nodemailer transporter to deliver emails via SMTP with mock logger fallbacks
│   │   └── Verifyer/               # [NEW FOLDER]: Organizes email templates
│   │       └── emailTemplates.js   # [NEW]: Houses HTML and CSS presentation layout for emails, keeping routes files clean
├── src/
│   ├── Components/
│   │   └── AuthScreen.tsx          # Modified: Renders Email input and transitions to Verification code form
│   └── Styles/
│   │   └── AuthScreen.css          # Modified: Styled centered monospace code inputs for modern verification card
```

---

## 📚 File-by-File Explanation

### 1. `Verifyer/emailTemplates.js`
- **What it is**: The "Designer" of our emails 🎨.
- **Why it exists**: Instead of cluttering our backend logic (`auth.js`) with long strings of HTML and CSS code, we moved the template markup here. It exports `getVerificationEmailHelper(username, verificationCode)` which composes a beautifully styled email.

### 2. `services/emailService.js`
- **What it is**: The "Mail Robot" 🤖.
- **Why it exists**: It reads your credentials (`EMAIL_USER` and `EMAIL_PASS`) from `.env` and initializes a Nodemailer SMTP transporter. It exposes the async function `sendEmail(to, subject, html)`. If SMTP credentials are not configured or mail dispatch fails, it prints the email output directly to the server logs (Mock Mode) so registration doesn't crash.

### 3. `routes/auth.js`
- **What it is**: The "Coordinator" 🛡️.
- **Why it exists**:
  - **Sign Up**: When a new user registers, it checks for a valid email, checks for unique email, generates a random 6-digit OTP code, saves it to SQLite database with `is_verified = 0`, and fires off the verification email.
  - **Login block**: Blocks unverified users from logging in, returning a `403 Forbidden` error with `requiresVerification: true` to notify the React frontend.
  - **Verification**: Listens at `/api/users/verify` for code submissions, validates the OTP against the database, updates the user status to `is_verified = 1`, and logs them in directly with a signed JWT token.

### 4. `server.js`
- **What it is**: The "Bootstrapper" 🔌.
- **Why it exists**: Initializes the SQLite tables. We added the `email TEXT UNIQUE`, `is_verified INTEGER DEFAULT 0`, and `verification_code TEXT` columns to the database schema.

### 5. `AuthScreen.tsx`
- **What it is**: The "Face" of Auth 🚪.
- **Why it exists**:
  - Captures `email` input during sign-up.
  - Switches to a dedicated verification card layout (`isVerifying = true`) prompting for the 6-digit OTP code if registration completes or if an unverified user attempts a login.
  - Calls `/api/users/verify` and logs the user in directly if the code is correct.

### 6. `AuthScreen.css`
- **What it is**: The "Decorator" 💅.
- **Why it exists**: Contains all styling classes. We added custom styles for `#verificationCode` (e.g. `letter-spacing: 8px`, `font-family: monospace`, `text-align: center`) to style the OTP input box.

---

## 🚀 The End-to-End Handshake Flow

1. **Sign-up form**: React sends `{ username, password, email }` to `/api/users/register`.
2. **Registration endpoint**: Backend saves user as unverified (`is_verified = 0`) with a 6-digit code (e.g., `583921`) and calls `emailService.sendEmail(...)`.
3. **Dispatch**: Nodemailer connects to Gmail and delivers the OTP code to the user's email inbox.
4. **Verification prompt**: React frontend sees the registration success response and switches the screen to verify mode.
5. **OTP Submission**: User enters `583921` and submits. React calls `/api/users/verify` with `{ username, code }`.
6. **Activation**: Backend updates `is_verified = 1`, generates a signed JWT token, and returns it to log the user in directly!
