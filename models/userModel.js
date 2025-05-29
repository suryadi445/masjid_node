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
  const { id, name, email, password, image = null, update_by = null } = data;

  const setFields = [];
  const values = [];

  // Push name
  setFields.push(`name = $${values.length + 1}`);
  values.push(name);

  // Push email
  setFields.push(`email = $${values.length + 1}`);
  values.push(email);

  // Push updated_by
  setFields.push(`updated_by = $${values.length + 1}`);
  values.push(update_by);

  // Push image if available
  if (image) {
    setFields.push(`image = $${values.length + 1}`);
    values.push(image);
  }

  // Push password if available
  if (password) {
    setFields.push(`password = $${values.length + 1}`);
    values.push(password);
  }

  // Always update the timestamp
  setFields.push(`updated_at = NOW()`);

  // Final query
  const query = `
      UPDATE users
      SET ${setFields.join(", ")}
      WHERE id = $${values.length + 1}
      RETURNING id, name, email, image
    `;

  values.push(id); // add id at the end

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
  const query = `SELECT u.id AS user_id,
                    u.name,
                    u.email,
                    u.image,
                    up.birthday,
                    up.gender,
                    up.phone_number,
                    up.title,
                    up.religion,
                    up.marital_status,
                    up.address,
                    up.biography
                FROM users u
                LEFT JOIN user_profiles up on u.id = up.user_id
                WHERE u.id = $1`;

  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
};

const allUser = async (limit, page, search) => {
  const offset = (page - 1) * limit;

  try {
    let dataResult, countResult;

    if (search) {
      const pattern = `%${search}%`;

      dataResult = await pool.query(
        `SELECT * FROM users
           WHERE name ILIKE $1
              OR email ILIKE $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`,
        [pattern, limit, offset]
      );

      countResult = await pool.query(
        `SELECT COUNT(*) FROM users
           WHERE name ILIKE $1
              OR email ILIKE $1`,
        [pattern]
      );
    } else {
      dataResult = await pool.query(
        `SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      countResult = await pool.query(`SELECT COUNT(*) FROM users`);
    }

    const total = parseInt(countResult.rows[0].count, 10);
    const last_page = Math.ceil(total / limit);

    return {
      data: dataResult.rows,
      total,
      page,
      last_page,
    };
  } catch (error) {
    console.error("Error finding all user:", error);
    throw error;
  }
};

const deleteProfileById = async (id) => {
  const query =
    "DELETE FROM users WHERE id = $1  RETURNING id, name, email, image";
  try {
    const result = await pool.query(query, [id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error deleting user by ID:", error);
    throw error;
  }
};

module.exports = {
  insertUser,
  findUserByEmail,
  findUserId,
  updateUserById,
  allUser,
  deleteProfileById,
};
