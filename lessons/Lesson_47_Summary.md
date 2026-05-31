# Lesson 47: Custom Domain Setup (`.com`) 🌐🔐🏦

Welcome to Lesson 47! Now that our frontend application is compiled and ready to be hosted, we need to learn how custom domains work. 

In a professional banking environment, users never access services via default hosting URLs (like `vindobona-app.vercel.app`). They access them via custom, registered domains (like `vindobona.com`). This lesson covers the core architecture of **Domains**, **DNS Records**, and **SSL Encryption**.

---

## 1. Domains, DNS, and IP Addresses 🗺️

### 🗺️ The Analogy:
Think of your server on the web like a **physical store in Vienna** 🏛️:
*   **The IP Address:** These are the **GPS coordinates** of your store (e.g., `48.2082° N, 16.3738° E`). It tells computers exactly where to go, but humans can't remember numbers like that.
*   **The Custom Domain:** This is the **signpost name** on the street, like `"Vindobona Café"` or `"Vindobona Bank"`. It is friendly, readable, and easy to share.
*   **The DNS (Domain Name System):** This is the **global telephone phonebook** 📖. When a user types `vindobona.com` in their browser, the browser looks up the phonebook to find the matching GPS coordinates (IP address) of Vercel's servers.

---

## 2. Core DNS Record Types 📞

To connect a domain you own (from registrars like GoDaddy, Namecheap, or Cloudflare) to Vercel, you must add specific listings to your DNS phonebook:

### A Record (Address Record)
*   **Definition:** Points a domain name directly to a physical IPv4 address.
*   **Used for:** The root domain (e.g., `vindobona.com`).
*   **Vercel Pattern:** You point your root domain to Vercel's IP address: `76.76.21.21`.

### CNAME Record (Canonical Name Record)
*   **Definition:** Points a domain name to another domain name (an alias), rather than an IP address.
*   **Used for:** Subdomains (e.g., `www.vindobona.com` or `api.vindobona.com`).
*   **Vercel Pattern:** You point your `www` subdomain to `cname.vercel-dns.com`.

---

## 3. SSL / TLS & HTTPS: Bank-Grade Security 🔒

Banks require strict security compliance (such as PSD2 in Europe). You cannot run a fintech application over plain `http://` because data (like usernames, passwords, and transaction details) would be sent in clear, unencrypted text.

*   **SSL/TLS (Secure Sockets Layer):** A cryptographic protocol that encrypts the connection between the user's browser and your server.
*   **HTTPS:** The secure version of HTTP. It uses an SSL certificate to guarantee to the browser that:
    1.  The connection is fully encrypted (no one can eavesdrop on password entries).
    2.  The website is verified (prevents "phishing" sites from pretending to be your bank).
*   **Vercel Wow-Factor:** Vercel automatically generates and renews a free, trusted **Let's Encrypt SSL certificate** for your domain the moment it connects!

---

## 🏗️ Lesson 47 Action Plan

We will simulate and verify custom domain setups in **3 steps**:

### 🌐 Step 1: Add a Custom Domain inside Vercel Dashboard
We will learn how to configure Vercel to expect traffic coming from `yourdomain.com`.

### ⚙️ Step 2: Configure the DNS Records at your Registrar
We will map out the precise A and CNAME record tables you would enter in GoDaddy or Cloudflare.

### 🔒 Step 3: Verify the SSL Handshake
We will understand how the certificate validation is completed to secure the connection.
