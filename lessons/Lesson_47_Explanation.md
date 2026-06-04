# Lesson 47 Explanation: Custom Domain Setup 🌐🔒🏦

In this explanation, we document the core architecture of custom domains, the Domain Name System (DNS), and HTTPS encryption required to connect a production web application securely.

---

## 📍 1. Domains, DNS, and IP Addresses

To understand how a user reaches your website, we use the **Vienna Store Analogy**:

1. **IP Address (GPS Coordinates):** 
   - Computers communicate using IP addresses (e.g., `76.76.21.21`). These are like the GPS coordinates of your server (e.g., `48.2082° N, 16.3738° E`). Humans cannot easily memorize these numbers.
2. **Custom Domain (Street Sign):** 
   - A friendly name like `jdfdf.com` or `vindobonafintech.com` is like a street sign name on a building ("The Vindobona Bank"). It is easy for humans to read and share.
3. **DNS (Global Telephone Book):** 
   - The Domain Name System (DNS) translates the custom domain (street sign) into the IP address (GPS coordinates) so the browser knows which server to load.

---

## 📍 2. Core DNS Record Types

To link a custom domain from your registrar (e.g., GoDaddy, Namecheap, or Cloudflare) to your Vercel deployment, you configure specific DNS records:

### 🅰️ A Record (Address Record)
- **Purpose:** Maps your root domain (e.g., `jdfdf.com`) directly to a physical IP address.
- **Vercel Destination IP:** `76.76.21.21`

### 🔀 CNAME Record (Canonical Name Record)
- **Purpose:** Creates an alias pointing one domain name to another domain name (a nickname).
- **Used for:** Subdomains (e.g., pointing `www.jdfdf.com` to `cname.vercel-dns.com`).

### 🔏 TXT Record (Text Record)
- **Purpose:** Stores arbitrary text notes in the DNS settings.
- **Used for Security:** Proving ownership of a domain to prevent domain hijacking (e.g., verifying ownership of a subdomain under `fintech.com`).

---

## 📍 3. Vercel Dashboard Configuration

To add a domain to Vercel:
1. Navigate to **Project Settings** ⚙️ -> **Domains**.
2. Click **Add Existing**, type the domain (e.g., `vindobona.fintech.com`), and select the **Production** environment.
3. Vercel automatically checks the DNS mapping. If it is not configured yet, it shows a **"Verification Needed"** status card.

---

## 📍 4. The DNS Registrar Configuration Table

When you purchase a domain, you enter the following mapping into your domain registrar's DNS settings:

| Record Type | Name / Host | Value / Points to | Purpose |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | Routes root traffic (`jdfdf.com`) to Vercel's IP. |
| **CNAME** | `www` | `cname.vercel-dns.com` | Routes subdomain traffic (`www.jdfdf.com`) to Vercel. |

---

## 📍 5. SSL / TLS & HTTPS: Bank-Grade Security

A financial application requires strict encryption compliance to protect passwords, 2FA codes, and transaction details.

### 🤝 The SSL Handshake
When a user visits your secure website (`https://...`):
1. **The Secret Envelope Analogy:** 
   - **HTTP (Unsecure):** Like writing your password on a postcard. Anyone along the mail route can read it.
   - **HTTPS (Secure):** Like placing your password in a heavy metal box with a padlock. Only Vercel has the key to open it. Even if someone intercepts it, they only see scrambled gibberish.
2. **Automated Let's Encrypt:** 
   - Vercel automatically contacts the global certificate authority **Let's Encrypt** to provision and renew a free, trusted SSL/TLS certificate for your custom domain the moment your DNS records are verified.
