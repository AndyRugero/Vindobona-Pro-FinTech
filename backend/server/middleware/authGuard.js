const jwt = require('jsonwebtoken'); // 📥 Import JSON Web Token package

// 🛡️ MIDDLEWARE: Protect routes by verifying the user's JWT token
const authenticateToken = (req, res, next) => {
    // 1. Get the Authorization header from the request
    const authHeader = req.headers['authorization'];

    // 2. Extract the token (header format is "Bearer <TOKEN>")
    const token = authHeader && authHeader.split(' ')[1];

    // 3. If there is no token, turn them away immediately
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided. 🛑' });
    }

    // 4. Verify the token using our secret key
    jwt.verify(token, process.env.JWT_SECRET, (error, decodedUser) => {
        if (error) {
            // If token has expired or is invalid, return 403 Forbidden
            return res.status(403).json({ error: 'Session expired or invalid token. Please log in again.' });
        }

        // 5. If valid, attach the decoded user info (userId, username) to the request object
        req.user = decodedUser;

        // 6. Call next() inside the callback so they can pass
        next();
    });
};

// 📤 Export the middleware function so it can be required in other files
module.exports = authenticateToken;
