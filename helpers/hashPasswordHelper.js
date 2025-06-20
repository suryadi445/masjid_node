const bcrypt = require("bcrypt");

// Function to hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Function to compare password
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

module.exports = { hashPassword, comparePassword };
