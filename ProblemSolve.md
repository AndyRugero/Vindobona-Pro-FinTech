# 🛠️ Google OAuth Resolution & Troubleshooting Guide (ProblemSolve.md)

This document provides a comprehensive breakdown of the Google OAuth authentication issues encountered during the production deployment of **Vindobona Pro FinTech**, how they were resolved, and how to debug similar issues in the future.

---

## 🔍 Part 1: The Problems & Root Causes

During the transition of the containerized backend to **Microsoft Azure** and the React frontend to **Vercel**, Google OAuth login failed with two distinct issues:

### 1. The Code Error: `TokenError: client_secret is missing`
*   **Symptom**: After selecting a Google account, the redirection page crashed with a stack trace originating from `passport-oauth2` stating that the `client_secret` was missing.
*   **Root Cause**: 
    1. The `.env` file containing secrets is (correctly) listed in `.gitignore` to prevent committing sensitive keys to GitHub.
    2. Because it is git-ignored, the `.env` file was not present on the GitHub Actions runner during the Docker build phase.
    3. As a result, the Docker image pushed to Docker Hub had no `.env` file, and `process.env.GOOGLE_CLIENT_SECRET` returned `undefined` when running inside the Azure container.
    4. Passport.js attempted to exchange the authorization code with Google's token endpoint without a client secret, triggering Google's API rejection.

### 2. The Browser Warning: `Deceptive site ahead / Dangerous Site`
*   **Symptom**: Chrome displayed a red warning screen blocking access when attempting to navigate to the backend callback URI on the default Azure domain (`*.azurewebsites.net`).
*   **Root Cause**: Google Safe Browsing employs automated scanners that flag new subdomains of shared cloud hosting platforms (like Azure or AWS) if they contain authentication endpoints (`/api/auth/google`), treating them as potential phishing traps.

---

## 🚀 Part 2: How They Were Solved

### 1. Resolving the Missing Client Secret
Instead of hardcoding credentials (a critical security violation), the variables were injected directly into the running container using **Azure App Service Settings**:
1.  **Diagnostic Logs Added**: We added startup diagnostics to [auth.js](file:///c:/Vindobona-Pro-FinTech/backend/server/routes/auth.js#L19-L25) to print variable statuses without exposing the actual keys.
2.  **Azure CLI Setup**: Installed the Azure CLI on the developer PC via `winget` and authenticated the session using `az login`.
3.  **App Settings Configuration**: Automatically injected the missing keys using the following terminal commands:
    ```powershell
    # Configured credentials securely inside the Azure environment
    az webapp config appsettings set `
      --name vindobona-api-andy `
      --resource-group VindobonaResources `
      --settings GOOGLE_CLIENT_SECRET="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" `
                 JWT_SECRET="MySuperSecretKeyWord123!" `
                 EMAIL_USER="andruge70@gmail.com" `
                 EMAIL_PASS="spaipbngaweqqrau"
    
    # Restarted the container to apply changes
    az webapp restart --name vindobona-api-andy --resource-group VindobonaResources
    ```
4.  **Verification**: Pinged the container's health check (`/api/health`) and confirmed the status returned `UP`, proving database connections and environment parameters were loaded correctly.

### 2. Resolving the Deceptive Site Warning
1.  **Local Bypass**: Clicked **Details** -> **visit this unsafe site** in Chrome. This whitelists the domain locally on the development machine so the red screen never interrupts tests again.
2.  **Global Fix (Safe Browsing Report)**: Submitted a false-positive claim to Google's Safe Browsing review team to globally clear the warning for all users.

---

## 🛠️ Part 3: Future Debugging Checklist

When debugging authentication, container, or deployment failures, follow this checklist:

### Step 1: Verify Container Health & App Settings
1. Check the status of your app settings using the Azure CLI:
   ```powershell
   az webapp config appsettings list --name vindobona-api-andy --resource-group VindobonaResources --query "[].{name:name, value:value}"
   ```
2. Make sure the container is reachable by calling the public health endpoint:
   ```text
   GET https://<your-app-domain>.azurewebsites.net/api/health
   ```

### Step 2: Stream Live Container Logs
If the app crashes or throws errors, inspect the live console output (`console.log`) directly from the Azure container:
```powershell
az webapp log tail --name vindobona-api-andy --resource-group VindobonaResources
```
Look for the **`--- Google OAuth Env Diagnostics ---`** printout to check if keys are registered as `FOUND` or `MISSING`.

### Step 3: Check Google Cloud Console Credentials
If Google returns authorization errors (e.g., `redirect_uri_mismatch`), verify the settings in your [Google Cloud Console](https://console.cloud.google.com/):
1. Go to **APIs & Services** -> **Credentials** -> **OAuth 2.0 Client IDs**.
2. Under **Authorized redirect URIs**, make sure the URL matches your production environment exactly:
   ```text
   https://vindobona-api-andy-ffapb3end8fwffdm.westeurope-01.azurewebsites.net/api/auth/google/callback
   ```
   *(Note: Verify if your region suffix includes `-01` or not, as these must match character-for-character).*
