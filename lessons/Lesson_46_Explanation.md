# Lesson 46 Explanation: Dynamic API Base URL Setup 🌐⚙️

In this explanation, we document the precise steps to transition our frontend API calls from hardcoded localhost configurations to a flexible, environment-driven base URL setup.

---

## 📍 Central API Configuration

We created a new configuration file at [config.ts](file:///c:/Vindobona-Pro-FinTech/src/config.ts):

```typescript
// Checks if Vite has a VITE_API_URL environment variable from the host server.
// Otherwise, it falls back to localhost:5001 for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

---

## 📍 Context Configuration: TransactionContext.tsx

In [TransactionContext.tsx](file:///c:/Vindobona-Pro-FinTech/src/Context/TransactionContext.tsx), we replaced the static endpoint string:

```typescript
import { API_BASE_URL } from '../config';

// Dynamic API URL composition
const API_URL = `${API_BASE_URL}/api/transactions`;
```

---

## 📍 Component Configuration: SettingsView.tsx

In [SettingsView.tsx](file:///c:/Vindobona-Pro-FinTech/src/Components/SettingsView.tsx), we updated the manual fetches to reference the `API_BASE_URL` dynamically:

### 1. Check 2FA Status (on mount)
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/2fa/status`, {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

### 2. Request 2FA Setup
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/2fa/setup`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

### 3. Verify and Enable 2FA Code
```typescript
const response = await fetch(`${API_BASE_URL}/api/auth/2fa/verify`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ code: verificationCode })
});
```

---

## 📍 Vercel Router Rules: vercel.json

We created a custom configuration at the project root [vercel.json](file:///c:/Vindobona-Pro-FinTech/vercel.json) to rewrite all frontend sub-routes back to our main entry page `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📍 File Casing Conflict Resolution

We resolved a casing conflict in [App.tsx](file:///c:/Vindobona-Pro-FinTech/src/App.tsx):
- **Problem:** The filesystem file was `settingsView.tsx` (lowercase s), but the import was written as `SettingsView` (capital S). This causes build compiler crashes on strict platforms.
- **Solution:** Updated the import path to match the filesystem:
  ```typescript
  import SettingsView from './Components/settingsView';
  ```

---

## 📍 Local Production Build Check

Finally, we ran the trial build compiler to verify everything compiles and bundles correctly:

```powershell
npm.cmd run build
```

This compiles your TypeScript files (`tsc -b`) and packs your React codebase into a highly optimized, minified folder called `dist/` containing `index.html` and assets.

