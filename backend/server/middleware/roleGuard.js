/**
 * Express middleware to restrict route access by user roles.
 * @param {string[]} allowedRoles - Array of roles permitted to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // 1. Check if the user is authenticated and has a role attached to their request
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Unauthorized. Please log in first. 🛑' });
        }

        // 2. Check if the user's role is in our allowed list
        const hasPermission = allowedRoles.includes(req.user.role);

        if (!hasPermission) {
            // Return 403 Forbidden (authenticated, but lacking permission)
            return res.status(403).json({ error: 'Access denied. You do not have permission to access this resource. 🛑' });
        }

        // 3. If they pass all checks, call next() to proceed to the route handler
        next();
    };
};

// 📤 Export the middleware so it can be imported in our routes
module.exports = requireRole;
