const pool = require("../config/db");

// Insert new user
const insertUser = async (name, email, hashedPassword) => {
  const query = `
        INSERT INTO users (name, email, password, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING email`;
  const result = await pool.query(query, [name, email, hashedPassword]);
  return result.rows[0];
};

// Check if email exists
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Check if email exists
const findUserId = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { insertUser, findUserByEmail, findUserId };
