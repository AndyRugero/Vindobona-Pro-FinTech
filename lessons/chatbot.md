# AI Chatbot Assistant Blueprint & Plan 🤖💬

This document outlines the visual structure, layout logic, and backend API integration plan for building the **Vindobona Pro AI Chatbot Assistant** (Lesson 53b).

---

## 🏗️ 1. Visual Layout & UX Design

The chatbot UI consists of two visual states:
1. **The Floating Action Button (FAB)**: A glowing, circular button resting at the bottom-right of the screen.
2. **The Chat Window**: A glassmorphic card that slides up smoothly from the bottom-right when the FAB is clicked.

```
+------------------------------------+
|  [🤖 Vindobona Assistant  [o] Active | <-- Header (Gold Tint)
+------------------------------------+
|                                    |
|   (Bot): Hello Andy! How can I      | <-- Slate-gray bubble (Align Left)
|          help you today?           |
|                                    |
|   (User): What's my balance?       | <-- Cyan-blue bubble (Align Right)
|                                    |
|   (Bot): Calling database...       |
|          Your balance is €4,250.00 |
|                                    |
|   (Bot): [ • • • ]                 | <-- Typing Indicator animation
|                                    |
+------------------------------------+
|  [ Type a question...     ]  [🛫]  | <-- Input area & Send button
+------------------------------------+
```

---

## ⚙️ 2. Core Frontend React Logic

The Component (`Chatbot.tsx`) will manage several reactive memory slots (States):

* **`isOpen` (Boolean)**: Toggles whether the chat window is shown or hidden.
* **`messages` (Array of Objects)**: Stores the conversation history. Each message object contains:
  ```typescript
  interface Message {
      id: string;
      sender: 'user' | 'bot';
      text: string;
      timestamp: Date;
  }
  ```
* **`input` (String)**: Stores the text the user is currently typing.
* **`isTyping` (Boolean)**: Toggles the typing dots (`• • •`) loader when waiting for the AI backend.
* **`messagesEndRef` (React Ref)**: Anchors to the bottom of the message list to auto-scroll into view when a new bubble is added.

---

## 🔌 3. Network API Communication

The chatbot talks directly to the Express server using a `POST` request to:
`http://localhost:5001/api/chat`

### Request Requirements:
1. **Headers**:
   * `Content-Type: application/json`
   * `Authorization: Bearer <JWT_TOKEN>` (to verify client identity and retrieve user-specific account balance / ledger logs)
2. **Body**:
   ```json
   {
       "message": "What is my latest transaction?"
   }
   ```

### Response Format:
```json
{
    "reply": "Your latest transaction was spent at Graben ATM for €50.00."
}
```

---

## 🛠️ 4. Phase-by-Phase Implementation Steps

* **Phase 1: Stylesheet Creation**: Create `src/Styles/Chatbot.css` (Glassmorphism, animations, colors).
* **Phase 2: Component Creation**: Build `src/Components/Chatbot.tsx` (FAB button toggle, message list, input listeners).
* **Phase 3: Global Shell Placement**: Import `<Chatbot token={token} />` inside `src/App.tsx` and render it outside the main routing block so it floats globally.
* **Phase 4: Manual Test**: Type test questions about account balance, transactions, and unrelated topics to verify the AI assistant acts within its banking instructions.
