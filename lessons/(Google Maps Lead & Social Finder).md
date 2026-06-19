# 🚀 Roadmap: Google Maps Lead & Social Finder (Chrome Extension)

This document maps out the architecture, development phases, and technical traps to avoid when building the **Google Maps Lead & Social Finder** Chrome Extension.

---

## ⚠️ 1. Technical Gotchas: What to Be Careful About

Scraping from browsers seems simple, but major platforms deploy defensive measures. Avoid these 5 common development mistakes:

### A. Dynamic Class Names (Google Maps Layout Updates)
*   **The Trap**: Google frequently obfuscates and updates their HTML class names (e.g., a card title might be `.q2vD7` today and `.a9Xz2` next month). If you write a selector like `document.querySelector('.q2vD7')`, your scraper will break instantly on the next Google update.
*   **The Solution**: Target semantic HTML attributes, `aria-labels`, or URL patterns.
    *   *Example*: Select links that contain the path `/maps/place/` to find place card elements.

### B. DOM Recycling & Infinite Scroll
*   **The Trap**: Google Maps lists load search results dynamically as the user scrolls. Furthermore, Google recycles DOM elements (removing off-screen elements to save memory). If you just scrape the visible DOM, you will miss leads.
*   **The Solution**: 
    1. Implement a scroll loop that auto-scrolls the sidebar container by small increments.
    2. Maintain a `Set` of unique identifiers (like the place URL or coordinate hash) in memory so you never store duplicates.

### C. CORS (Cross-Origin Resource Sharing) Blockers
*   **The Trap**: If your **Content Script** (which runs on the Google Maps tab) tries to fetch a business's website directly (`fetch('https://business.com')`) to search for emails, the browser will block it due to CORS security policies.
*   **The Solution**: You must send a message from the Content Script to the **Background Service Worker** (`chrome.runtime.sendMessage`). Background scripts in Chrome Extensions run in a privileged scope and **can bypass CORS restrictions** entirely.

### D. Email Extraction False Positives
*   **The Trap**: A basic email regex match like `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g` will fetch false emails hidden inside Javascript files, SVGs, or tracking scripts.
*   **The Solution**:
    *   Only extract text inside the HTML `<body>` tags.
    *   Strip out `<script>` and `<style>` blocks before running your regex.
    *   If no email is found on the homepage, automatically check sub-pages like `/contact`, `/about`, or `/impressum` (common in Austria/Germany).

### E. Rate Limiting (IP Block Protection)
*   **The Trap**: If you crawl 50 website URLs in 10 seconds from the background script, the user's home IP address will get flagged by anti-bot systems (like Cloudflare), blocking the user from visiting those sites.
*   **The Solution**: Implement a queue with a delay (e.g., wait 2–3 seconds between crawling different websites) to mimic natural human browsing behavior.

---

## 🗺️ 2. Step-by-Step Development Roadmap

```
Phase 1: Foundation (Manifest & Pop-up UI)
                   │
                   ▼
Phase 2: Content Script (Scraping Google Maps data)
                   │
                   ▼
Phase 3: Background Script (Bypassing CORS & Social Enrichment)
                   │
                   ▼
Phase 4: CSV Export & Storage Persistence
                   │
                   ▼
Phase 5: Stripe Monetization & Credit Gates
```

### 📍 Phase 1: Extension Blueprint (`manifest.json` & Popup UI)
*   **Action**: Create the extension configuration.
*   **Key Files**:
    *   `manifest.json`: Set permissions (`activeTab`, `scripting`, `hostPermissions` to access external websites). Specify Manifest V3.
    *   `popup.html` & `popup.js`: Design a modern, premium popup panel. Use dark-mode aesthetics, custom gradients, and action buttons (*"Start Scraping"*, *"Download CSV"*).

### 📍 Phase 2: Content Script (DOM Scraper)
*   **Action**: Inject a script into the Google Maps tab to scroll results and extract data points.
*   **Data Points to Scrape**:
    *   Business Name
    *   Phone Number
    *   Website URL
    *   Review Rating & count

### 📍 Phase 3: Background Worker (Email & Social Crawler)
*   **Action**: Send website URLs to the background worker (`background.js`).
*   **Crawling Engine Logic**:
    1. Fetch the raw HTML of the website homepage.
    2. Parse the body text.
    3. Run regular expressions to find email addresses and social media handles (Instagram, LinkedIn, Facebook).
    4. Pass the enriched data back to the Popup UI in real-time.

### 📍 Phase 4: Data Export & Storage
*   **Action**: Compile data rows into CSV.
*   **Implementation**:
    *   Convert array objects into comma-separated text strings.
    *   Create a data URI blob and trigger a download:
        ```javascript
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        ```

### 📍 Phase 5: Freemium Monetization Gate
*   **Action**: Hook up payment gates and limit usage.
*   **Implementation**:
    *   Save a `scrape_count` counter in `chrome.storage.local`.
    *   Once the counter exceeds `50`, render a payment block overlay leading to a Stripe Checkout URL.
