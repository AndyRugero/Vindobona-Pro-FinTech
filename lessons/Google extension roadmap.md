# 🚀 Roadmap: Google Maps Lead & Social Finder (Chrome Extension)

This is the definitive production and launch roadmap for the **Google Maps Lead & Social Finder** Chrome Extension. It integrates essential security, CORS bypass solutions, memory management, and deployment strategies for a successful launch.

---

## 📅 The 5-Day Launch Roadmap

```
             [SUNDAY: JUNE 21] ──► Day 1: MV3 Architecture, content.js & background.js CORS Bypass
                     │
             [MONDAY: JUNE 22] ──► Day 2: popup.html/css & chrome.storage.local Persistence
                     │
            [TUESDAY: JUNE 23] ──► Day 3: Incremental Scroll Scraper & CSV Generator
                     │
          [WEDNESDAY: JUNE 24] ──► Day 4: Stripe Payment Link & ExtensionPay Integration
                     │
           [THURSDAY: JUNE 25] ──► Day 5: Web Store Assets, SEO Metadata & Submission
```

---

### 🟢 Day 1: Architecture, DOM Selectors & CORS Bypassing (Sunday, June 21)
*Goal: Establish Manifest V3 structure and build the bridge between the page DOM and background process.*

*   **Manifest V3 Configuration (`manifest.json`):**
    *   Set up manifest properties specifying background service worker and content scripts.
    *   Define precise permissions: `storage` (for persistence), `activeTab` (for safe execution context), and `hostPermissions` (specifically matching domains to fetch external websites).
*   **The Content Scraper (`content.js`):**
    *   Inspect Google Maps DOM layouts. Establish resilient queries matching listing anchors (e.g. searching for links matching the `/maps/place/` pattern rather than volatile CSS class names).
    *   Extract: *Business Name*, *Website URL*, *Rating*, and *Phone Number*.
*   **CORS Bypass Setup (`background.js`):**
    *   Implement message listeners (`chrome.runtime.onMessage`). When `content.js` detects a business website, it messages the URL to the background script.
    *   Write a clean fetch routine inside `background.js` to retrieve the page source, search for contact patterns (emails, social handles), and pass it back to the scraper.

---

### 🟡 Day 2: Interface Design & Persistent Storage (Monday, June 22)
*Goal: Create the controller UI and resolve the popup state-loss trap.*

*   **Popup UI Design (`popup.html` & `popup.css`):**
    *   Build a sleek dark-mode container panel with rich visual aesthetics, custom gradients, and distinct control actions (*Start Scraping*, *Stop*, *Export CSV*).
    *   Include a real-time table displaying newly found leads and a rolling counter.
*   **Message Channel Pipeline (`popup.js`):**
    *   Set up active tab messaging to direct start/stop actions to `content.js`.
*   **Ephemeral Memory Rescue (`chrome.storage.local`):**
    *   **Crucial Rule:** Since the popup context shuts down instantly when the user clicks away, do NOT store scraper states in popup memory.
    *   Write auto-save logic that syncs discovered leads to `chrome.storage.local` instantly. On popup load, execute a restore hook to retrieve and render the active collection.

---

### 🔵 Day 3: Scroll Mechanics & CSV Compilers (Tuesday, June 23)
*Goal: Auto-navigate Google Maps dynamic lists and compile structured data exports.*

*   **Incremental Scrolling Scraper:**
    *   Implement a script that targets the scrollable sidebar container element on Google Maps search results.
    *   Inject a scroll loop that moves down by small increments (e.g., 400px) using random delay timings (1.5 to 3 seconds) to emulate human behavior and prevent anti-bot detection.
*   **DOM Recycling & Deduplication (`Set` Memory):**
    *   Keep track of already processed businesses by saving their Maps CID/URL inside a `Set` or unique dictionary key in storage.
    *   Only append new elements to the scraped storage to bypass Google's recycled DOM node removal.
*   **CSV Exporter Utility:**
    *   Format lead lists into a safe CSV string format.
    *   Build a download trigger inside `popup.js` that compiles a CSV file using standard blobs:
        ```javascript
        const blob = new Blob([csvDataString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({ url: url, filename: 'leads.csv' });
        ```

---

### 🟠 Day 4: Stripe & License Verification (Wednesday, June 24)
*Goal: Monetize the product securely without maintaining heavy server architectures.*

*   **Honest pricing & Credit Gates:**
    *   **Tier Structure:** Flat **$9.99/month subscription** (provides unlimited access to lead exports, emails, and social media finding).
    *   **Free Trial:** Allow users to scrape and preview up to **50 leads** for free. Once exceeded, render the premium ExtensionPay checkout overlay.
*   **Integration Choice (ExtensionPay vs. Custom API):**
    *   *Option A (Recommended for 5-Day Launch):* Use **ExtensionPay.com**. It handles the billing panel, user registration, and paywall checks securely with a zero-setup client-side SDK.
    *   *Option B (Custom DB):* Connect payment status checks to a secure endpoint (e.g., Supabase/Firebase Edge Function). **Security Rule:** Never include private database keys or Stripe secret API keys inside the extension bundle.
*   **Muted State Control:**
    *   Check authorization state on startup. Disable action triggers if the user has reached the threshold without active authorization.

---

### 🔴 Day 5: SEO, Store Listing & Submission (Thursday, June 25)
*Goal: Launch the extension on the Chrome Web Store and rank for search traffic.*

*   **Visual Assets & Promotional Graphic Design:**
    *   Create a clean, distinct 128x128 brand icon.
    *   Produce 3-5 screenshots showing: (1) Target list, (2) Scraping in progress, (3) Downloaded CSV.
    *   Build a 1280x800 banner card illustrating core benefits clearly.
*   **SEO Optimization Description:**
    *   Title: Include target search phrases (e.g., *"Maps Lead Extractor & Social Finder"*).
    *   Write a keyword-optimized summary detailing exact workflows. Use primary terms: *B2B leads*, *Google Maps scraper*, *Email collector*, and *Social search tool*.
*   **Privacy Policy Hosting:**
    *   Set up a single-page privacy policy detailing data practices (e.g. explaining that scraping is strictly local and no user data is shared with external databases). Host it on GitHub Pages.
*   **Submission Package:**
    *   Bundle code files into a clean zip format. Ensure no private keys or scratch code files are included.
    *   Provide a clear "Permission Justification Statement" inside the Developer Console explaining why the extension requires specific host privileges to bypass CORS during background queries. Submit for review.

---

## 📈 Month 2: Scaling & Fiverr Reinvestment Plan (July / August)

Once the MVP is launched and you capture your first **5 to 10 paid subscribers** (generating **$50 - $100+ / month**), you transition from solo bootstrapping to a **reinvestment and outsourcing model**.

### 🎨 1. Fiverr Outsourcing Strategy (Budget: €30 - €50)
Do not spend your own personal money here; use the first month's Stripe payouts to fund these upgrades:
*   **Professional Graphic Package (Fiverr Budget: €30):**
    *   *Deliverables:* 1 high-resolution Chrome Web Store promotional tile (440x280), 1 large marquee banner (1280x800), and 4 formatted screenshot slides showing the extension running inside realistic browser/laptop mockups.
    *   *Objective:* Replacing your self-made Canva designs with a custom-designed branding kit can double or triple your installation conversion rate.
*   **Copywriting & Local Translation (Fiverr Budget: €20):**
    *   *Deliverables:* Professional German translation of your Web Store listing description (SEO title, bullet points).
    *   *Objective:* Since you are targeting German-speaking countries (DACH region: Austria, Germany, Switzerland) for local businesses, a clean German store listing will attract high-intent local agencies.

### ⚙️ 2. Advanced Feature Upgrades
With user feedback coming in, use your JavaScript knowledge to introduce higher-tier premium features to justify raising your price (or adding a "Pro" plan for $19/month):
*   **Direct Google Sheets Integration:**
    *   Integrate the Google Sheets API so users can export leads directly to a target spreadsheet with a single click, completely removing the manual download CSV step.
*   **Targeted CRM Webhooks:**
    *   Add a webhook output option (e.g. sending data to Zapier or Make.com) so B2B sales teams can instantly push scraped leads into their CRMs (HubSpot, Salesforce, Pipedrive).
*   **Smart Slicing & Sub-page Depth Crawling:**
    *   Extend `background.js` to look for `/contact`, `/about-us`, or `/impressum` sub-pages if the website homepage does not list contact details, drastically increasing the email extraction success rate.

### 🚀 3. Growth & Cold Outreach
Use the extension itself to grow your business:
*   **Lead Generation for Yourself:**
    *   Use your scraper to find marketing agencies, web developers, and recruiters in Vienna.
    *   Export their emails and send a highly personalized cold email: *"Hey [Name], I noticed you guys do lead generation in Vienna. I built a Maps Social Finder tool that automates this. I used it to find you! Here is a free 30-day coupon to test it."*
*   **Directory Listing Submission:**
    *   Submit your extension to startup index sites: **ProductHunt**, **BetaList**, and directories like **ChromeExtensionKit** to build backlinks and rank higher on Google search results.

---

## 📈 Month 3: Self-Funded Scaling & Google Ads (August)

Once your Month 2 subscription baseline compounds and generates **$60 - $120+ / month** in recurring revenue, you launch paid growth channels.

### 🎯 1. Why Wait Until Month 3?
*   **Social Proof is Ready:** Early users from Month 1 and 2 will have left **5 to 10 positive reviews** on the store. Ads pointing to a reviewed extension convert at a much higher rate.
*   **Optimized Conversions:** The professional Fiverr graphics and translations are live, ensuring maximum install conversions per ad click.
*   **Zero Personal Risk:** You fund the ad budget entirely from the extension's monthly profits.

### 🛠️ 2. Google Search Ads Execution
*   **Campaign Structure:** Target high-intent Google search queries directly linking to your Chrome Web Store page.
*   **High-Intent Keywords:**
    *   `google maps lead finder`
    *   `export google maps to csv`
    *   `google maps email extractor`
*   **Budgeting:** Start with a low testing budget of **$2.00 / day** ($60/month). Only scale up the budget once you verify that your cost-per-acquisition (CPA) is lower than the lifetime value of a subscriber.

