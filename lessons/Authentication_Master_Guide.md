# 🔑 Web Authentication Master Guide: Express & React (JWT & Bcrypt)

This guide is your **cheat-sheet** for recreating secure user registration, login, and route protection in any future Node/Express backend + React frontend project.

---

## 🗺️ The Architecture Flow
```text
[ React Frontend ]                         [ Express Backend ]                   [ SQLite Database ]
       |                                           |                                      |
       | -- (POST username/password) ----------->  | -- (Hash & Save user) -------------> | (users table)
       | <--- (Response: JWT Token) -------------  |                                      |
       |                                           |                                      |
       | -- (GET /transactions + JWT Token) ------>| -- (Middleware decodes JWT)          |
       |                                           |     and verifies user identity       |
       | <--- (Response: User Transactions) -------| <--- (Select where user_id = id) ----| (transactions table)
```

---

## 📦 Step 1: Install Dependencies
In your Node/Express backend directory, install these two essential security packages:
```bash
npm install bcryptjs jsonwebtoken
```
*   **`bcryptjs`**: Scrambles (hashes) user passwords before storing them.
*   **`jsonwebtoken`**: Generates and verifies signed session tokens (JWT).

---

## 🗄️ Step 2: Database Schema
Create a `users` table to store credentials. The password must store the hashed version, never the plaintext password.

```sql
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL, -- UNIQUE prevents duplicate registration
    password_hash TEXT NOT NULL -- Scrambled password
);

-- Link other tables (like transactions) to the user using user_id
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    receiver TEXT NOT NULL,
    amount REAL NOT NULL,
    user_id TEXT, -- 🔑 Foreign Key linking back to users(id)
    FOREIGN KEY(user_id) REFERENCES users(id)
);
```

---

## 🛡️ Step 3: Create the Authentication Middleware
Place this at the **top** of your Express server (below your basic middlewares like `cors` and `express.json`) so other routes can use it. It intercepts incoming requests, decodes their token, and extracts the user's ID.

```javascript
const jwt = require('jsonwebtoken');

// 🛡️ Guard middleware to verify the user's JWT token
const authenticateToken = (req, res, next) => {
    // 1. Get the Authorization header from the request
    const authHeader = req.headers['authorization'];
    
    // 2. Extract token (Header format is: "Bearer <TOKEN>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. Turn away requests with no token
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // 4. Verify the token signature with your secret key
    jwt.verify(token, 'YOUR_JWT_SECRET_KEY', (error, decodedUser) => {
        if (error) {
            // Token is expired, fake, or invalid
            return res.status(403).json({ error: 'Session expired or invalid token.' });
        }

        // 5. Attach the decoded user data (e.g. userId) to the request object
        req.user = decodedUser;
        
        // 6. Let the request pass to the actual route handler!
        next();
    });
};
```

---

## ✍️ Step 4: The Register Endpoint (Sign Up)
Creates a user account, hashes their password, and saves them to the database.

```javascript
const bcrypt = require('bcryptjs');

// POST: Sign up a new user
app.post('/api/users/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // 2. Check if username is already taken
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken' });
        }

        // 3. Hash the password securely (10 salt rounds)
        const passwordHash = await bcrypt.hash(password, 10);
        const userId = Date.now().toString(); // Generate unique ID

        // 4. Save user to database
        await db.run(
            'INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)',
            [userId, username, passwordHash]
        );

        res.status(201).json({ message: 'User registered successfully! 🎉' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});
```

---

## 🔑 Step 5: The Login Endpoint & JWT Generation
Verifies password hashes and generates a signed JWT token for the client session.

```javascript
// POST: Login user and issue JWT token
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 1. Validate inputs
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // 2. Find user in database
        const user = await db.get('SELECT * FROM users WHERE username = ?', username);
        if (!user) {
            // Keep error generic for security (don't reveal if username exists)
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 3. Compare password with hashed database password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // 4. Generate signed JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            'YOUR_JWT_SECRET_KEY',
            { expiresIn: '2h' } // Token expires in 2 hours
        );

        // 5. Send token back to the client
        res.status(200).json({
            message: 'Login successful! 🚀',
            token: token,
            username: user.username
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});
```

---

## 🔒 Step 6: Securing Data Routes (Scoped Queries)
Add `authenticateToken` middleware to any API endpoint you want to protect. Filter the database queries so they only operate on records matching the logged-in user (`req.user.userId`).

```javascript
// GET: Fetch records belonging to the logged-in user
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        // Only SELECT records matching the user's ID!
        const rows = await db.all('SELECT * FROM transactions WHERE user_id = ?', req.user.userId);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve records' });
    }
});

// POST: Save a record linked to the logged-in user
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { receiver, amount } = req.body;
        const newRecord = {
            id: Date.now().toString(),
            receiver,
            amount,
            user_id: req.user.userId // 👈 Link to user
        };

        await db.run(
            'INSERT INTO transactions (id, receiver, amount, user_id) VALUES (?, ?, ?, ?)',
            [newRecord.id, newRecord.receiver, newRecord.amount, newRecord.user_id]
        );
        res.status(201).json(newRecord);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create record' });
    }
});
```

---

## 🔌 Step 7: Frontend Integration (Attach Token Headers)
In your React app, fetch the token from `localStorage` and include it inside the headers on every request to secured routes:

```typescript
const fetchSecureData = () => {
    // 1. Get the token from local storage
    const token = localStorage.getItem('token');

    // 2. Fetch with the Authorization header
    fetch('http://localhost:5001/api/transactions', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}` // 👈 Sends JWT VIP pass to backend
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            console.error("Auth failed:", data.error);
            return;
        }
        console.log("Secure data loaded:", data);
    });
};
```
