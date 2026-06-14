# Lesson 56b Summary: Nginx Web Server & Reverse Proxy 🌐🛡️🔄

Welcome to the study log for Lesson 56b. In this lesson, we study **Nginx**, an industry-standard, high-performance web server and reverse proxy. In enterprise environments like Erste Group or Raiffeisen Bank, backend application servers (like Node, Java, or .NET) are never exposed directly to the public internet. Instead, an Nginx reverse proxy sits at the edge of the network, acting as a gateway that routes, secures, and optimizes incoming traffic.

---

## 📍 Key Concepts & Blueprints

### 1. What is a Reverse Proxy?
*   **The Concept**: A forward proxy helps a client access the internet anonymously (e.g., VPNs). A **Reverse Proxy** protects the server. It receives requests from the public internet and forwards them to internal servers running on private networks.
*   **Architecture Diagram**:
    ```
    Public Internet        Network Perimeter (DMZ)       Private Secure Network
    ┌──────────┐  HTTPS   ┌──────────────┐   HTTP/TCP   ┌───────────────────┐
    │  Client  │ -------> │    Nginx     │ -----------> │ Express API Server│
    │ (Browser)│          │Reverse Proxy │              │ (Port 5001)       │
    └──────────┘          └──────────────┘              └───────────────────┘
                                 │
                                 │ Serve Static Files
                                 ▼
                          ┌──────────────┐
                          │  React Build │
                          │ (HTML/JS/CSS)│
                          └──────────────┘
    ```

### 2. Unified Port Routing (Split Traffic)
Instead of requiring our client browser to communicate with two separate ports (e.g., port `80` for React and port `5001` for the API), Nginx consolidates both under a single entry point (port `80` or `443`). It routes traffic based on the path:
*   Any request starting with `/api` is proxied to the Express backend (`http://localhost:5001`).
*   All other requests serve the static, compiled React files directly.

#### 📝 Essential Nginx Configuration Blueprint (`nginx.conf`):
```nginx
server {
    listen 80;
    server_name vindobonafintech.com;

    # Redirect all HTTP traffic to HTTPS (Port 443)
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name vindobonafintech.com;

    # SSL Certificates (managed via Let's Encrypt / Certbot)
    ssl_certificate /etc/letsencrypt/live/vindobonafintech.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vindobonafintech.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 1. Route API Calls to Express Backend
    location /api/ {
        proxy_pass http://localhost:5001; # Forward to Node server
        proxy_http_version 1.1;
        
        # Forward Client Network Metadata (Crucial for rate limiters)
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 2. Serve Static Frontend Files
    location / {
        root /var/www/vindobona/dist;
        index index.html;
        try_files $uri $uri/ /index.html; # Enable React Router client-side fallback
    }
}
```

### 3. Client Metadata Forwarding (Why it Matters for Security)
*   **The Issue**: When Nginx forwards a request to Express, Express views the connection source as `127.0.0.1` (Nginx's local IP) rather than the client's actual public IP.
*   **The Consequence**: Our rate limiters (Lesson 43) would block Nginx, taking down the entire system for all users if one user performs a brute-force attack.
*   **The Fix**: Nginx appends headers (`X-Real-IP` and `X-Forwarded-For`) containing the client's real IP. On Express, we trust proxy headers:
    ```javascript
    app.set('trust proxy', 1); // Instructs Express to read X-Forwarded-For IP addresses
    ```

### 4. Security Hardening & SSL Termination
*   **SSL Termination**: Nginx decrypts incoming HTTPS traffic, processes the SSL handshake, and forwards it to Express as unencrypted HTTP inside the secure, private local network. This offloads resource-heavy cryptographic operations from the Node.js process.
*   **HTTP Hardening Headers**: We inject security headers inside Nginx blocks to prevent common web attacks:
    *   `X-Frame-Options "DENY"`: Prevents Clickjacking attacks (stops the site from being loaded inside an iframe on malicious sites).
    *   `X-Content-Type-Options "nosniff"`: Prevents MIME-sniffing exploits.
    *   `Content-Security-Policy (CSP)`: Dictates which domains can load scripts, preventing Cross-Site Scripting (XSS).

---

## 🏗️ Lesson 56b Study Checklist

1.  [ ] **Install Nginx**: Install Nginx on a Linux virtual machine or local server environment.
2.  [ ] **Configure Server Blocks**: Write an Nginx configuration mapping `/api/` requests to the Node server using `proxy_pass`.
3.  [ ] **Configure Static Build Root**: Build the React application (`npm run build`) and point the Nginx root directive to the compiled `dist` directory.
4.  [ ] **Enable Trust Proxy**: Add `app.set('trust proxy', 1)` to the Express server initialization code.
5.  [ ] **SSL and Certificates**: Configure Certbot to generate and auto-renew Let's Encrypt certificates.

---

## 💬 Mock Interview Questions: Nginx & Reverse Proxies

*   **Question**: *"What is SSL Termination and why do we configure it on Nginx instead of our Node server?"*
    *   **Answer**: *"SSL Termination means that Nginx decrypts the incoming HTTPS traffic at the edge of our infrastructure, handles the cryptographic handshake, and routes the decrypted HTTP traffic internally to our Node server. We do this because Nginx is written in C and highly optimized for cryptographic operations. Offloading this task from Node.js frees up its single-threaded event loop to focus entirely on application business logic and transaction processing."*
*   **Question**: *"Why is the `app.set('trust proxy', 1)` setting required in Express when behind Nginx?"*
    *   **Answer**: *"Without this setting, Express sees all incoming connections as originating from the local IP address of the Nginx server (usually 127.0.0.1). If our rate-limiting software detects too many requests from 127.0.0.1, it will mistakenly block our own proxy, taking down the website. Enabling 'trust proxy' tells Express to check the `X-Forwarded-For` HTTP header, which Nginx appends to record the client's real public IP address."*
*   **Question**: *"What does `try_files $uri $uri/ /index.html` do in an Nginx config?"*
    *   **Answer**: *"This is essential for Single Page Applications (SPAs) like React. When a user visits a route like `/dashboard`, Nginx first checks if a physical file or folder named 'dashboard' exists in the web root. If it doesn't, instead of returning a 404 error, Nginx falls back and serves the root `/index.html` file. React Router then takes over in the browser and renders the correct client-side view."*
