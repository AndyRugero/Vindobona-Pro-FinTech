// 📥 Import helper functions we want to test from the sibling file
const { validateEmail, validatePassword, validateUsername } = require('./authHelpers');

// 📂 Group 1: Email validation tests
describe('Email Validation Helper', () => {
    // Test Case: Valid email should pass (return true)
    test('Should return true for a valid email', () => {
        expect(validateEmail('andy@example.com')).toBe(true);
    });

    // Test Case: Invalid email without '@' or '.' should fail (return false)
    test('should return false for invalid email if "@" or "." is missing', () => {
        expect(validateEmail('andyexample.com')).toBe(false); // Missing '@'
        expect(validateEmail('andy@examplecom')).toBe(false); // Missing '.'
    });
});

// 📂 Group 2: Password validation tests
describe('Password Validation Helper', () => {
    // Test Case: Passwords with 6+ characters should pass (return true)
    test('should return true for passwords with 6 or more characters', () => {
        expect(validatePassword('123456')).toBe(true);
    });

    // Test Case: Passwords under 6 characters should fail (return false)
    test('should return false if password is less than 6 characters', () => {
        expect(validatePassword('12345')).toBe(false);
    });
});

// 📂 Group 3: Username validation tests
describe('Username Validation Helper', () => {
    // Test Case: Valid username should pass (return true)
    test('should return true for a valid username', () => {
        expect(validateUsername('andy')).toBe(true);
    });

    // Test Case: Usernames that are too short or have spaces should fail (return false)
    test('should return false if username has spaces or is under 3 characters', () => {
        expect(validateUsername('an')).toBe(false); // Too short
        expect(validateUsername('andy rugero')).toBe(false); // Contains spaces
    });
});
