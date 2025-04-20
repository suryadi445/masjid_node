const pool = require("../config/db");

// Insert new user
const insertUser = async (name, email, hashedPassword) => {
  const query = `
        INSERT INTO users (name, email, password, created_at, updated_at) 
        VALUES ($1, $2, $3, NOW(), NOW()) RETURNING email`;
  const result = await pool.query(query, [name, email, hashedPassword]);
  return result.rows[0];
};

// update user
const updateUser = async ({ data }) => {
  const { id, name, email, image = null, update_by = null } = data;

  let setFields = [
    `name = $1`,
    `email = $2`,
    `updated_at = NOW()`,
    `updated_by = $3`,
  ];
  let values = [name, email, update_by];

  if (image) {
    setFields.push(`image = $4`);
    values.push(image);
  }

  const idPosition = values.length + 1;
  const query = `
    UPDATE users
    SET ${setFields.join(", ")}
    WHERE id = $${idPosition}
    RETURNING id, name, email, image
  `;

  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
};

// Check if email exists
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// Check user By id
const findUserId = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { insertUser, findUserByEmail, findUserId, updateUser };
