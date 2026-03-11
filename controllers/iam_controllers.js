const bcrypt = require("bcrypt");
const saltRounds = 10;

/**
 * Checks whether user is valid in db
 * @param {string} username 
 * @param {string} password 
 * @returns {boolean} if authentication is valid
 */
exports.checkUserPassword = async (username, password) => {
    if (!username || !password) throw new Error("Empty login field(s)");

    // todo: check username in db exists?

    // todo: get password hash for user
    let passwordHash = "$2b$10$OtLkfw.EIfOQsWNhvCfgsO1uqH6TVXD9KM40WNFZw6HXVa25Yp8mC";

    return bcrypt.compare(password, passwordHash)
}

/**
 * Checks user details with DB and returns valid created user else throws
 * @param {string} email 
 * @param {string} username 
 * @param {string} password 
 * @param {string} confirm_password 
 * @returns {object} {email: string, username: string, passwordHash: string}
 */
exports.signupUser = async (email, username, password, confirm_password) => {
    if (!email || !username || !password || !confirm_password) throw new Error("Empty signup field(s)");
    if (password != confirm_password) throw new Error("Passwords do not match");
    
    // todo: check email in db exists?

    // todo: check username in db exists?
    let user_auth = {
        email,
        username,
        passwordHash: await bcrypt.hash(password, saltRounds),
    }

    // todo: create user in db

    return user_auth;
}