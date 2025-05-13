const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Insert new user
const insertUser = async (name, email, hashedPassword) => {
  const client = await pool.connect();
  const userId = uuidv4();

  try {
    await client.query("BEGIN");

    // Insert user
    const insertUserQuery = `
      INSERT INTO users (id, name, email, password, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id, email
    `;
    const insertUserValues = [userId, name, email, hashedPassword];
    const resultUser = await client.query(insertUserQuery, insertUserValues);

    // Insert user profile
    const insertProfileQuery = `
      INSERT INTO user_profiles (user_id)
      VALUES ($1) RETURNING user_id
    `;
    await client.query(insertProfileQuery, [userId]);

    // Commit transaction if not have error
    await client.query("COMMIT");

    // return result
    return resultUser.rows[0]; // return id and email
  } catch (error) {
    await client.query("ROLLBACK"); // rollback
    console.error("Error in inserting user with profile:", error);
    throw error;
  } finally {
    client.release();
  }
};

// update user
const updateUserById = async ({ data }) => {
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

  try {
    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Check if email exists
const findUserByEmail = async (email) => {
  const query = "SELECT * FROM users WHERE email = $1";

  try {
    const result = await pool.query(query, [email]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by Email:", error);
    throw error;
  }
};

// Check user By id
const findUserId = async (id) => {
  const query = "SELECT * FROM users WHERE id = $1";

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

module.exports = { insertUser, findUserByEmail, findUserId, updateUserById };
