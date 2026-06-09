# Lesson 53b Explanation: AI Chatbot Financial Assistant API 🤖💬

Welcome to the explanation file for **Lesson 53b**. In this lesson, we will build a secure **AI Financial Assistant API** using the Google Gemini model. 

---

## 📍 1. The Core Concept: Retrieval-Augmented Generation (RAG)

If you ask a general AI model (like Gemini or ChatGPT): *"What is my account balance?"*, it will fail because it does not have access to our private database.

To solve this, we use a technique called **RAG (Retrieval-Augmented Generation)**:
1.  **Retrieve:** When the user sends a chat message, our backend first queries the SQLite database to fetch the user's current account balance and recent transactions.
2.  **Augment:** We pack this financial data into a hidden **System Prompt (Context)**.
3.  **Generate:** We send this system context + the user's question to the Gemini API. The AI uses the context to generate an accurate, personalized reply.

---

## 📍 2. The API Process Stage-by-Stage

To connect a frontend or backend to external services (like the Google Gemini Chatbot or Google Maps API), we configure our request envelope through 4 distinct stages. 

Let's use our **AI Chatbot** and **Vienna ATM Finder** APIs as our examples to trace this process:

### 🏗️ Stage 1: The Request Blueprint (What goes into a call?)
Whenever you use a `fetch()` link, you are sending a digital envelope over the internet. This envelope has four parts you must configure:

1.  **The Address (URL):** Where the request goes.
    *   *Chatbot Example (Google Gemini):*
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY`
    *   *ATM Example (Vienna ATM Finder):*
        `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_KEY&libraries=places`
2.  **The Method (Action):** What we want the destination server to do:
    *   `GET`: *"Please give me data."* (Default) - Used to retrieve the coordinates list for ATMs (`GET /api/locations`).
    *   `POST`: *"Here is new data, please save/process it."* - Used to send the user's message to the chatbot (`POST /api/chat`).
    *   `DELETE`: *"Please delete this record."*
3.  **The Headers (MetaData):** Extra instructions for the server (like writing "Handle with care" on a package). Common headers:
    *   `'Content-Type': 'application/json'`: Tells the server *"I am sending JSON data."*
    *   `'Authorization': 'Bearer <token>'`: Proves the user is logged in.
4.  **The Body (The Payload):** The actual data you want to send.
    *   Only used in `POST` or `PUT` requests (e.g., sending the prompt text to Gemini).
    *   `GET` requests have no body; they send parameters in the URL (like `?key=...`).

---

### 📦 Stage 2: The JSON Translation (How data moves)
Computers cannot transmit actual JavaScript objects or variables over the internet. They can only send plain text.

To solve this, we use **JSON (JavaScript Object Notation)**, which represents JavaScript objects as plain text strings. We translate data back and forth using two methods:

#### 1. Sending Data (JavaScript Object ➡️ JSON Text)
Before sending data in a `POST` request body, we convert our JavaScript object into a text string using `JSON.stringify()`.
```javascript
const userMsg = { message: "What is my account balance?" };

// Translate to plain text so it can travel over the internet:
const jsonText = JSON.stringify(userMsg); 
// Result: '{"message":"What is my account balance?"}'
```

#### 2. Receiving Data (JSON Text ➡️ JavaScript Object)
When the server sends back JSON text, we must translate it back into a JavaScript object using `response.json()` so we can read it in our code.
```javascript
// Raw JSON text response received from the Vienna ATM API:
const rawText = '[{"id":"atm-stephansplatz","name":"Stephansplatz ATM","lat":48.2082,"lng":16.3738}]';

// Translate back into a JavaScript object:
const data = await response.json(); 
console.log(data[0].name); // Prints: "Stephansplatz ATM"
```

---

### 📜 Stage 3: The Golden Code Pattern to Memorize
Here is the absolute standard pattern for writing an API fetch request in JavaScript. You will use this exact pattern for 99% of the APIs you call.

#### Template: calling the Chatbot API
```javascript
async function askGemini(systemPrompt, userQuestion) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // 1. Send the Fetch Envelope
        const response = await fetch(url, {
            method: 'POST', // Sending data
            headers: {
                'Content-Type': 'application/json' // We are sending JSON
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser Question: ${userQuestion}` }]
                }]
            })
        });

        // 2. Check if the server returned an error (e.g., 401 or 500)
        if (!response.ok) {
            throw new Error(`API returned error status: ${response.status}`);
        }

        // 3. Translate the returned text back into a JS Object
        const data = await response.json();

        // 4. Return the result back to our application
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        // ⚠️ Always catch errors in case the internet goes down or the server crashes!
        console.error("API Call failed:", error);
        return null;
    }
}
```

---

### ⚠️ Stage 4: What to be Careful Of (The "Gotchas")
Here are the most common mistakes that cause developers' code to crash or return `undefined`:

#### 🚨 1. Forgetting the `await` Keyword
`fetch()` and `response.json()` are asynchronous operations (they take time to travel across the internet). If you forget `await`, JavaScript will move to the next line before the server responds, resulting in a blank value or a crash.
*   **Wrong:** `const data = response.json();` *(returns an unresolved Promise)*
*   **Right:** `const data = await response.json();`

#### 🚨 2. Spacing and typos in Headers
The header `'Content-Type': 'application/json'` must be typed exactly. Any typo in the spelling or a missing hyphen will cause the server to reject the data as invalid text.

#### 🚨 3. Accessing properties that do not exist (Data Nesting)
When you receive data back, you must inspect its exact shape. Every API nests its data differently!

For example, Google's Gemini response is nested deeply inside a candidate array:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          { "text": "Your current balance is €1,240." }
        ]
      }
    }
  ]
}
```
*   **Wrong:** `data.text` or `data.content.text` *(returns undefined or crashes)*
*   **Right:** `data.candidates[0].content.parts[0].text` *(correctly accesses the nested string)*

---

## 📍 2b. Alternative Chatbot APIs (Non-Gemini Options)
If you decide to switch from Google Gemini to another major AI provider, the concept (RAG) remains identical, but the **URL**, **Headers**, and **Body structure** change slightly. Here are the two most common alternatives:

### 🟢 1. OpenAI API (ChatGPT)
*   **The Address (URL):** `https://api.openai.com/v1/chat/completions`
*   **The Headers:** OpenAI uses Bearer tokens for security:
    ```javascript
    {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
    ```
*   **The Body:** Message history is sent as an array of roles (`system`, `user`, `assistant`):
    ```json
    {
        "model": "gpt-4o-mini",
        "messages": [
            { "role": "system", "content": "System context goes here..." },
            { "role": "user", "content": "User question goes here..." }
        ]
    }
    ```

### 🟠 2. Anthropic API (Claude)
*   **The Address (URL):** `https://api.anthropic.com/v1/messages`
*   **The Headers:** Anthropic uses custom headers for authentication and API versioning:
    ```javascript
    {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
    }
    ```
*   **The Body:** The system prompt is passed as a top-level key, separate from user messages:
    ```json
    {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1024,
        "system": "System context goes here...",
        "messages": [
            { "role": "user", "content": "User question goes here..." }
        ]
    }
    ```

---

## 📍 3. The Graceful Fallback Mode (Resilience)

If a developer runs this app without setting up a `GEMINI_API_KEY` in their `.env` file, the server will crash on chat requests.

To make our application **resilient**, we build a **local rule-based fallback**:
*   If `process.env.GEMINI_API_KEY` is missing, instead of calling `fetch()`, our code checks the message for keywords (like "balance", "transactions", "hi") and returns a simple, automated local reply:
    > *"Hello! (Demo Mode: GEMINI_API_KEY is not set). Your current balance is €500. You have 12 transactions."*
This keeps our app running smoothly in all environments!

---

## 📍 4. How to Find & Research APIs Online (Step-by-Step Guide)
When you want to build a new feature (like checking stock prices, sending text messages, or finding locations), you need to search for and implement an external API. Here is your step-by-step learning guide:

### 🔍 Step 1: Finding the API Link
1.  **Google Search:** Search for the service + "Developer API Documentation" (e.g., `"OpenAI API Reference"` or `"Google Maps Geocoding API"`).
2.  **API Directories:** Use platforms like [RapidAPI](https://rapidapi.com) to search, test, and compare thousands of free and paid APIs in one place.

### 📋 Step 2: The API Checklist (What to look for in the documentation)
Before writing any code, search the API's documentation page for these 5 details:
1.  **The Base URL (The address):** The server address (e.g., `https://api.openai.com/v1/`).
2.  **Authentication (The key):** How the API knows who you are. Look for a section called "Authentication" or "Getting Started". It will tell you if the key goes:
    *   In the URL: `?key=YOUR_KEY` (like Google Gemini).
    *   In the Headers: `Authorization: Bearer YOUR_KEY` (like OpenAI).
    *   In a custom Header: `x-api-key: YOUR_KEY` (like Anthropic).
3.  **HTTP Method:** Does the endpoint expect a `GET` (reading data) or `POST` (sending data)?
4.  **Request Body Format:** If it is a `POST` request, look at the example JSON payload. It shows you exactly what keys (like `model`, `prompt`, `max_tokens`) you need to send.
5.  **Response Format:** Look at the example response JSON. Find the exact path to the data you want so you don't get `undefined` errors.

---

### ⚠️ What to be Careful Of (Crucial Security & Cost Rules)

> [!WARNING]
> **1. NEVER Hardcode API Keys in Your Code**
> Never write `const apiKey = "AIzaSy..."` directly in your JavaScript files. If you upload your code to GitHub, automated bots will steal your key within minutes. They can use it to run up thousands of dollars in bills in your name.
> *   **Safe Solution:** Always store keys in a `.env` file (e.g., `GEMINI_API_KEY=your_key`) and load them in Node.js using `process.env.GEMINI_API_KEY`. Make sure your `.gitignore` file includes `.env` so it is never shared!

> [!CAUTION]
> **2. Set Up Billing Limits Immediately**
> When you sign up for a cloud developer account (like Google Cloud, AWS, or OpenAI):
> 1. Go to the Billing settings.
> 2. Set a **Hard Limit** (e.g., €5 per month). If you make a mistake in your code (like an infinite loop calling the API), the server will block further calls once the limit is reached instead of charging you hundreds of euros.

> [!IMPORTANT]
> **3. Always Wrap Fetch in a Try/Catch Block**
> External APIs live on other servers. If their server goes offline, or if your server loses internet connection, the `fetch()` command will fail and throw a crash error.
> *   By wrapping your code in `try { ... } catch (error) { ... }`, you ensure that if the API fails, your server stays online and can show a helpful error message instead of crashing.

