# 💾 Bonus Lesson: Persisting Data to Disk (Node.js FileSystem)

Welcome to the persistence bonus guide! Currently, when you add or delete transactions, the changes only exist in the server's temporary memory (RAM). If you stop or restart the server, all your added transactions disappear, and deleted ones return.

To make changes **permanent**, we must write them to the hard drive inside our [data.json](file:///c:/Vindobona-Pro-FinTech/backend/data.json) database file. In Node.js, we do this using the built-in **FileSystem (`fs`)** module.

---

## 🧠 The Concept: RAM vs. Hard Drive (Disk)

*   **RAM (Temporary Memory):** Extremely fast, but gets completely wiped clean when the server process starts, restarts, or crashes.
*   **Disk (Permanent File Storage):** Slower, but keeps files forever. Even if you turn off your computer, the file remains safe on the hard drive.

---

## 🛠️ Step 1: The FileSystem Tools (`fs`)

Node.js comes with a built-in module called `fs` (FileSystem). We don't need to install anything; we just import it like this:

```javascript
const fs = require('fs');
const path = require('path'); // Helps build safe directory paths
```

We will use two main actions from this module:
1.  **`fs.readFileSync(path, encoding)`**: Reads a file from disk and returns it as a plain-text string.
2.  **`fs.writeFileSync(path, text, encoding)`**: Overwrites a file on disk with new text data.

---

## 💻 The Upgraded `server.js` Code

Here is how your Express backend [server.js](file:///c:/Vindobona-Pro-FinTech/backend/server.js) would look if we integrated disk persistence. 

*Take a close look at the comments explaining how we read and write the files:*

```javascript
const express = require('express');
const cors = require('cors');
const fs = require('fs'); // 📥 Import FileSystem module to read/write files
const path = require('path'); // 📥 Import Path module to find data.json safely

const app = express();
const PORT = 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// 📂 Build the absolute path to data.json
const DATA_FILE_PATH = path.join(__dirname, 'data.json');

/**
 * 🔍 HELPER FUNCTION: Reads data.json and converts it to a JavaScript array
 */
const readDataFromFile = () => {
    try {
        // 1. Read the raw text from the file
        const rawText = fs.readFileSync(DATA_FILE_PATH, 'utf8');
        // 2. Parse the text string back into a JavaScript array and return it
        return JSON.parse(rawText);
    } catch (error) {
        // If the file doesn't exist yet or is empty, return an empty array
        return [];
    }
};

/**
 * 💾 HELPER FUNCTION: Converts a JavaScript array to JSON and writes it to disk
 */
const writeDataToFile = (dataArray) => {
    // 1. Convert the JavaScript array into a formatted JSON string (with 4-space indents)
    const jsonString = JSON.stringify(dataArray, null, 4);
    // 2. Overwrite the file on disk with the new JSON string
    fs.writeFileSync(DATA_FILE_PATH, jsonString, 'utf8');
};

// 🚂 GET: Fetch all transactions from the file
app.get('/api/transactions', (req, res) => {
    const transactions = readDataFromFile(); // Read from disk
    res.json(transactions); // Send JSON array to React
});

// 🚂 POST: Add a new transaction and save it to the file
app.post('/api/transactions', (req, res) => {
    const { receiver, amount, category } = req.body;
    
    // 1. Load the current list of transactions from disk
    const transactions = readDataFromFile();

    // 2. Build the new transaction
    const newTransaction = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { weekday: 'short' }),
        receiver: receiver,
        amount: amount,
        category: category || 'General',
        isNegative: amount.includes('-'),
        status: 'Complete'
    };

    // 3. Prepend the new transaction to our loaded array
    transactions.unshift(newTransaction);

    // 4. Save the updated array back to data.json on disk!
    writeDataToFile(transactions);

    // 5. Respond to React with the created transaction
    res.status(201).json(newTransaction);
});

// 🚂 DELETE: Remove a transaction and save changes to the file
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    
    // 1. Load the current list of transactions from disk
    let transactions = readDataFromFile();

    // 2. Find the index of the transaction to delete
    const index = transactions.findIndex(tx => tx.id === id);

    if (index !== -1) {
        // 3. Remove the transaction from our array in memory
        transactions.splice(index, 1);
        
        // 4. Save the updated array back to data.json on disk!
        writeDataToFile(transactions);
        
        // 5. Send success response
        res.status(200).json({ message: `transaction ${id} deleted` });
    } else {
        // Send 404 error if not found
        res.status(404).json({ success: false, message: `transaction ${id} wasn't found` });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
```

---

## 💡 Why did we replace `require('./data.json')`?

In standard Node.js:
*   **`require('./data.json')`** is read **only once** when the server starts up. Node caches it in memory. If we modify the file on disk later, `require` will *not* reload it.
*   **`fs.readFileSync`** reads the file **fresh from the hard drive every single time** the helper function is called. This ensures your data remains perfectly in sync and never gets corrupted!

---

*Enjoy coding your persistent backend database!* 💾🤖🚀
