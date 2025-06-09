const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// Insert new user
const insertUser = async (name, email, hashedPassword, roleIds = []) => {
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

    // Insert user roles (if any)
    if (Array.isArray(roleIds) && roleIds.length > 0) {
      const insertRolesQuery = `
          INSERT INTO user_roles (user_id, role_id)
          VALUES ${roleIds.map((_, i) => `($1, $${i + 2})`).join(", ")}
        `;
      const insertRolesValues = [userId, ...roleIds];
      await client.query(insertRolesQuery, insertRolesValues);
    }

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
  const {
    id,
    name,
    email,
    password,
    image = null,
    update_by = null,
    roles = [],
  } = data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const setFields = [];
    const values = [];

    setFields.push(`name = $${values.length + 1}`);
    values.push(name);

    setFields.push(`email = $${values.length + 1}`);
    values.push(email);

    setFields.push(`updated_by = $${values.length + 1}`);
    values.push(update_by);

    if (image) {
      setFields.push(`image = $${values.length + 1}`);
      values.push(image);
    }

    if (password) {
      setFields.push(`password = $${values.length + 1}`);
      values.push(password);
    }

    setFields.push(`updated_at = NOW()`);

    const query = `
        UPDATE users
        SET ${setFields.join(", ")}
        WHERE id = $${values.length + 1}
        RETURNING id, name, email, path, image
      `;
    values.push(id);

    const result = await client.query(query, values);
    const updatedUser = result.rows[0];

    // Hapus role lama
    await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [id]);

    // Tambah role baru
    for (const roleId of roles) {
      await client.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
        [id, parseInt(roleId)]
      );
    }

    await client.query("COMMIT");
    return updatedUser;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error updating user:", error);
    throw error;
  } finally {
    client.release();
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
  const query = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.path,
        u.image,
        up.birthday,
        up.gender,
        up.phone_number,
        up.title,
        up.religion,
        up.marital_status,
        up.address,
        up.biography,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', r.id,
              'name', r.name,
              'description', r.description
            )
          ) FILTER (WHERE r.id IS NOT NULL),
          '[]'
        ) AS roles
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY 
      u.id, u.name, u.email, u.image,
      up.birthday, up.gender, up.phone_number, 
      up.title, up.religion, up.marital_status, 
      up.address, up.biography
    `;

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
  const super_admin = 1;

  try {
    let dataResult, countResult;
    const baseQuery = `
        SELECT 
          users.*,
          COALESCE(
            json_agg(
              json_build_object('id', roles.id, 'name', roles.name)
            ) FILTER (WHERE roles.id IS NOT NULL), '[]'
          ) AS roles
        FROM users
        LEFT JOIN user_roles ON users.id = user_roles.user_id
        LEFT JOIN roles ON user_roles.role_id = roles.id
      `;

    if (search) {
      const pattern = `%${search}%`;

      const filteredQuery = `
          ${baseQuery}
          WHERE (users.name ILIKE $1 OR users.email ILIKE $1)
            AND users.id NOT IN (
              SELECT user_id FROM user_roles WHERE role_id = $4
            )
          GROUP BY users.id
          ORDER BY users.created_at DESC
          LIMIT $2 OFFSET $3
        `;

      dataResult = await pool.query(filteredQuery, [
        pattern,
        limit,
        offset,
        super_admin,
      ]);

      countResult = await pool.query(
        `SELECT COUNT(*) FROM users 
           WHERE (name ILIKE $1 OR email ILIKE $1)
           AND id NOT IN (SELECT user_id FROM user_roles WHERE role_id = $2)`,
        [pattern, super_admin]
      );
    } else {
      const allQuery = `
          ${baseQuery}
          WHERE users.id NOT IN (
            SELECT user_id FROM user_roles WHERE role_id = $3
          )
          GROUP BY users.id
          ORDER BY users.created_at DESC
          LIMIT $1 OFFSET $2
        `;

      dataResult = await pool.query(allQuery, [limit, offset, super_admin]);

      countResult = await pool.query(
        `SELECT COUNT(*) FROM users 
           WHERE id NOT IN (SELECT user_id FROM user_roles WHERE role_id = $1)`,
        [super_admin]
      );
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Hapus role user di pivot table terlebih dahulu
    await client.query("DELETE FROM user_roles WHERE user_id = $1", [id]);

    // Baru hapus user dari tabel utama
    const deleteUserQuery =
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email, image";
    const result = await client.query(deleteUserQuery, [id]);

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error deleting user by ID:", error);
    throw error;
  } finally {
    client.release();
  }
};

const findUserRoles = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT role_id FROM user_roles WHERE user_id = $1",
      [userId]
    );
    return result.rows.map((row) => row.role_id);
  } catch (error) {
    console.error("Error finding user roles:", error);
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
  findUserRoles,
};
