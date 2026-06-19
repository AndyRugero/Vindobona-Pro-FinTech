# AI Chatbot Assistant Explanation Guide 🤖💬🚀

This guide explains how the **Vindobona Pro AI Chatbot Assistant** works, how the frontend communicates with the backend, and how we protect sensitive credentials.

---

## 1. How the AI Chatbot Works (High-Level flow)

When you ask the chatbot a question, the following cycle takes place:

```
+--------------+                   +----------------+                   +---------------+
| React Client | --(POST Query)--> | Express Server | --(System Context)| OpenAI Server |
|  (Frontend)  | <-- (AI Reply)--- |   (Backend)    | <--(Sends Reply)-- |     (LLM)     |
+--------------+                   +----------------+                   +---------------+
                                           |
                                  [Queries Database]
                                  - Account Balance
                                  - Transaction Log
```

1. **User Types Message**: The user enters a question (e.g. *"What is my balance?"*) and presses Enter.
2. **Secure Request**: The website sends a `POST` request to `/api/chat` on our backend, attaching the user's **JWT Token** in the header.
3. **Data Retrieval**: Our backend checks the database for the user's real balance and recent transactions.
4. **Context Construction**: The backend bundles the user's data with a strict instruction prompt (e.g., *"You are a polite banker..."*).
5. **AI Evaluation**: The backend sends this package to OpenAI.
6. **Reply Rendered**: The website receives the AI response and renders it inside a slate-gray bubble.

---

## 2. Frontend React Mechanics (`Chatbot.tsx`)

Inside our React component, we use three important state hooks to manage memory:

### 💾 A. Message History List (`messages` state)
We store messages inside an array of objects. When you type or the AI replies, we append a new object to this array:
```typescript
interface Message {
    id: string;             // Keeps list rendering fast in React
    sender: 'user' | 'bot'; // Dictates which CSS class is applied
    text: string;           // The text shown in the speech bubble
    timestamp: Date;
}
```

### 🏥 B. Smooth Auto-Scroll (`useRef` & `useEffect`)
As the conversation grows, the messages will overflow the viewport. 
* We place an empty `<div ref={messagesEndRef} />` at the bottom of the list.
* A `useEffect` hook listens for any additions to the `messages` array or changes to the typing spinner. When triggered, it forces the container to scroll smoothly to that empty div, ensuring the latest message is always visible.

### ⏳ C. Typing Indicator (`isTyping` state)
While waiting for the backend request to resolve, we toggle `isTyping` to `true`. This inserts three blinking dot elements that animate using CSS, letting the user know the AI is "thinking".

---

## 3. Strict Safety & Guardrails (The System Prompt)

To prevent the AI from generating wrong answers or going off-topic, our backend enforces **strict system instructions**:

1. **Role**: The AI must behave like a polite, professional, and friendly banker for *Vindobona Pro FinTech*.
2. **Context Guardrails**: It can **only** answer questions about the user's balance or transactions using the context sent from the database. It cannot guess or make up numbers.
3. **Action Guideline**: If the user asks the chatbot to transfer money, the AI must politely reply: *"I cannot initiate transfers directly. Please use the 'Send Money' tab on your screen to complete a transfer."*
4. **Out of Scope**: If the user asks about sports, politics, or coding, the AI must decline politely: *"I am your banking assistant and can only help you with account-related financial questions."*
