//validation of email 
//string input
// output : true if valid ,  flase if invalid

const validateEmail = (email) => {
    if (!email) return false;
    const cleanEmail = email.trim();
    return cleanEmail.includes('@') && cleanEmail.includes('.');
}
//validate password
const validatePassword = (password) => {
    if (!password) return false;
    return password.length >= 6;
};

// validate usename
const validateUsername = (username) => {
    if (!username) return false

    const cleanUsername = username.trim();

    return cleanUsername.length >= 3 && !cleanUsername.includes(' ');


};

//export the functions
module.exports = {
    validateEmail,
    validatePassword,
    validateUsername
}