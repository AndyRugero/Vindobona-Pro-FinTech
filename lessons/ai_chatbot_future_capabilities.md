# AI Chatbot Future Capabilities & Roadmap 🤖🚀

This roadmap outlines how you can expand the capabilities of your AI financial assistant at the end of the project. It covers location assistance, currency tools, support numbers, budget tracking, and real-time loss alerts.

---

## 📍 1. Accessing Support Numbers & Static Help
*   **The Goal:** The user asks: *"Who do I call if my card is stolen?"* or *"What is your support number?"*
*   **How to do it:** You do not need to query the database for this. You simply add static banking info directly inside the **System Prompt (Context)** text block:
    ```
    - Support Hotline: +43 1 555 9999 (Available 24/7 for lost/stolen cards)
    - General Inquiries Email: support@vindobona-bank.at
    ```
    Since this is in the prompt context, the AI will automatically use it to answer the user!

---

## 📍 2. Finding the Closest ATM (Vienna Map Integration)
*   **The Goal:** The user asks: *"Where is the closest ATM to me?"*
*   **How to do it:** 
    1.  **Retrieve:** Fetch all ATM location coordinates from your `/api/locations` database table.
    2.  **User Geolocation:** Get the user's current GPS latitude/longitude from their browser.
    3.  **Augment:** Feed both the user's location and the list of Vienna ATMs into the AI system context.
    4.  **Math Check:** Tell the AI: *"Calculate which coordinates in the list are closest to the user's current coordinates, and reply with the address."*

---

## 📍 3. Setting & Tracking Budgets
*   **The Goal:** The user asks: *"How can I set a budget?"* or *"How much limit do I have left for Restaurants?"*
*   **How to do it:** 
    1.  **Read Budgets:** Join the `budgets` table with the `transactions` table.
    2.  **Calculate:** Get the sum of spending for `Restaurants` (e.g., €120 spent of €150 budget).
    3.  **Feed Context:** Add this to the AI prompt:
        ```
        - Restaurant Budget limit: €150.00
        - Restaurant Spent this month: €120.00 (Remaining: €30.00)
        ```
    4.  The AI can then warn the user: *"You only have €30 left in your Restaurant budget. I recommend eating at home!"*

---

## 📍 4. Currency Exchange & Converter
*   **The Goal:** The user asks: *"How much is €50 in US Dollars?"*
*   **How to do it:**
    1.  **Search Exchange Rates:** Use fetch to call a free third-party API (like `https://open.er-api.com/v6/latest/EUR`).
    2.  **Feed rates:** Inject the current rate (e.g. `1 EUR = 1.09 USD`) into the AI system context.
    3.  The AI will read the exchange rate and perform the math automatically to reply: *"€50 is currently worth $54.50."*

---

## 📍 5. Loss & Overdraft Warnings
*   **The Goal:** The user asks: *"Am I spending too much?"* or wants warning notifications.
*   **How to do it:** 
    *   Feed the AI the trend of their balance over the last 30 days.
    *   Tell the AI: *"If the user's spending is increasing rapidly and their balance is dropping close to €0, warn them that they are at risk of overdraft."*

---

## 🛠️ Advanced Concept: Function Calling (OpenAI Tools)
As your chatbot gets smarter, you won't want to feed *every single transaction, ATM, and exchange rate* into the prompt at the same time because it would make the API call too expensive and slow.

Instead, you can use a feature called **OpenAI Function Calling**:
1.  You register JavaScript functions in the OpenAI configuration (e.g. `getClosestATM()`, `getExchangeRate()`).
2.  When the user asks: *"What is the exchange rate?"*, the AI decides: *"I need to call getExchangeRate()."*
3.  The AI pauses the conversation and tells your server: *"Please run getExchangeRate() and give me the result."*
4.  Your server runs the function, sends the result back to the AI, and the AI presents the answer beautifully!
