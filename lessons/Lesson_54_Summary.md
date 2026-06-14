# Lesson 54, 54b & 54c Summary: Advanced Banking Utilities Suite 📑❄️💱

Welcome to the study log for Lessons 54, 54b, and 54c. In this section, we expand our fintech backend to cover data exporting, card security state locks, and multi-currency wallets.

---

## 📍 Key Concepts & Blueprints

### 1. Document Streaming & File Downloads (Lesson 54)
*   **The Concept**: Instead of loading whole files into server memory before sending them, we stream data dynamically to the browser.
*   **Response Headers**: To trigger file downloads in browsers rather than opening them as plain text, we set standard HTTP headers:
    *   `Content-Type`: Tells the browser what the file is (e.g., `text/csv` or `application/pdf`).
    *   `Content-Disposition`: Tells the browser to download the file as an attachment with a specific filename:
        ```javascript
        res.setHeader('Content-Disposition', 'attachment; filename=statement.csv');
        ```

### 2. CSV Generation (Lesson 54)
*   **The Concept**: Comma-Separated Values is a simple text format. We construct rows by joining properties with commas, escaping commas in descriptions (like `"Spar Wien, 1010"`):
    ```javascript
    const csvRows = [
        'ID,Date,Receiver,Amount,Category,Type,Status', // Header
        ...transactions.map(t => `"${t.id}","${t.date}","${t.receiver}",...`)
    ];
    ```

### 3. PDF Kit Stream Generation (Lesson 54)
*   **The Concept**: Using the `pdfkit` module, we draw a professional layout (bank logo, statement metadata, transaction details table). We pipe the PDF document writer directly into the Express response stream:
    ```javascript
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res); // Streams PDF binary directly to the browser
    doc.text('Vindobona FinTech Statement');
    doc.end(); // Seals the PDF and completes the request
    ```

### 4. Interactive "Freeze Card" Locks (Lesson 54b)
*   **The Concept**: Users can temporarily lock their debit cards.
*   **The Lock Mechanism**: 
    1. We add an `is_card_frozen` boolean column (represented as `1` or `0` in SQLite) to the `users` table.
    2. When a user tries to process payments or transfers (`POST /api/transactions` or `POST /api/transactions/transfer`), we query their card state.
    3. If `is_card_frozen = 1`, we reject the transaction immediately with a `403 Forbidden` response:
        ```javascript
        if (user.is_card_frozen === 1) {
            return res.status(403).json({ error: 'Transaction declined. Your card is frozen!' });
        }
        ```

### 5. Multi-Currency Wallets & Live Exchange — Global Edition (Lesson 54c)

*   **The Concept**: Banking apps must handle international transactions for users worldwide — not just EUR, USD, and GBP, but also Rwandan Francs (RWF), Nepalese Rupees (NPR), Azerbaijani Manat (AZN), and 160+ more.

*   **The Schema**: The backend stores currency balances in a dedicated `wallets` table:
    ```
    wallets table:
    ┌────────────┬──────────┬──────────┬─────────┐
    │ id         │ user_id  │ currency │ balance │
    ├────────────┼──────────┼──────────┼─────────┤
    │ 1781...    │ 42       │ EUR      │ 1000.00 │
    │ 1782...    │ 42       │ RWF      │ 150000  │
    └────────────┴──────────┴──────────┴─────────┘
    ```
    When a user exchanges from EUR → RWF, we atomically subtract from one row and add to another using `BEGIN TRANSACTION ... COMMIT`.

*   **The API Source Upgrade — Frankfurter → open.er-api.com**:
    | Feature              | Old: Frankfurter API          | New: open.er-api.com               |
    |----------------------|-------------------------------|------------------------------------|
    | Currencies supported | ~30 (ECB only)                | **160+** (worldwide)               |
    | API key required     | No                            | No                                 |
    | Historical data      | Yes (7-day)                   | Pro plan only (free = live only)   |
    | Rwanda (RWF)         | ❌ Not supported              | ✅ Supported                       |
    | Nepal (NPR)          | ❌ Not supported              | ✅ Supported                       |
    | Azerbaijan (AZN)     | ❌ Not supported              | ✅ Supported                       |

*   **How to Call It**:
    ```typescript
    // Fetch the live rate for ANY base currency (no API key needed!)
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    const data = await res.json();
    const rate = data.rates[toCurrency]; // e.g. 1 EUR → 1468 RWF
    ```
    The URL's last segment is the ISO 4217 base currency code. It works for any of the 160+ supported currencies.

*   **The CURRENCIES Dictionary Pattern**:
    Since there is no live API to resolve a currency code like `RWF` to its symbol `FRw`, we maintain a frontend dictionary:
    ```typescript
    const CURRENCIES = {
        RWF: { name: 'Rwandan Franc',   symbol: 'FRw' },
        NPR: { name: 'Nepalese Rupee',  symbol: 'रू'  },
        AZN: { name: 'Azerbaijani Manat', symbol: '₼' },
        // ...120+ entries
    };
    const getCurrencySymbol = (code: string) => CURRENCIES[code]?.symbol || code;
    ```
    The `?.` (optional chaining) ensures unknown codes degrade gracefully to the code itself (e.g. `XAF` → `XAF`) rather than crashing.

*   **The Simulated Trendline Chart**:
    Since the free tier of open.er-api.com does not provide historical daily data, we generate a realistic ±0.8% fluctuation trendline anchored to the live rate using `Math.sin()` for smooth natural curves:
    ```typescript
    const noise = liveRate * (Math.sin(i * 1.3 + 0.7) * 0.008 + (Math.random() - 0.5) * 0.006);
    ```
    The last data point is always pinned to the exact live rate, so the chart ends at the truth.

*   **Open Access Endpoint Discovery**: The free `open.er-api.com` endpoint is documented under **"Open Access"** in the ExchangeRate-API sidebar at `exchangerate-api.com/docs`. It is publicly cached with no registration needed.

---

## 🏗️ Lesson 54 Suite Implementation Phases

### Phase A: Report Exports (Lesson 54)
*   **Goal**: Create routes `/api/transactions/export/csv` and `/api/transactions/export/pdf`.
*   **Dependencies**: Install `pdfkit` via npm.
*   **Files modified**: `routes/transactions.js` and `tests/transactions.test.js`.

### Phase B: Card Freeze Panel (Lesson 54b)
*   **Goal**: Create route `POST /api/users/freeze` to toggle status, and update transaction controllers to intercept request actions.
*   **Files modified**: `routes/auth.js`, `routes/transactions.js`, and `tests/transactions.test.js`.

### Phase C: Multi-Currency FX Converter — Global Edition (Lesson 54c)
*   **Goal**: Support 160+ world currencies using `open.er-api.com`. Populate dropdown from the `CURRENCIES` dictionary. Resolve symbols dynamically using `getCurrencySymbol()`. Render simulated 7-day trendline anchored to live rate.
*   **API Source**: `https://open.er-api.com/v6/latest/{baseCurrency}` — free, no API key.
*   **Files modified**: `src/Components/FXConverter.tsx`, `lessons/Lesson_54_Summary.md`.

