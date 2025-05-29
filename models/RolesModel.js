const pool = require("../config/db");

const RolesModel = {
  async getAllRoles(limit, page, search) {
    const offset = (page - 1) * limit;
    let dataResult, countResult;

    try {
      if (search) {
        const pattern = `%${search}%`;

        // Query data dengan filter
        dataResult = await pool.query(
          `SELECT * FROM roles WHERE name ILIKE $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
          [pattern, limit, offset]
        );

        // Query count total data yang cocok
        countResult = await pool.query(
          `SELECT COUNT(*) FROM roles WHERE name ILIKE $1`,
          [pattern]
        );
      } else {
        // Query data tanpa filter
        dataResult = await pool.query(
          `SELECT * FROM roles ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
          [limit, offset]
        );

        // Query total count
        countResult = await pool.query(`SELECT COUNT(*) FROM roles`);
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
      console.error("Error fetching roles:", error);
      throw error;
    }
  }, // end getAllRoles

  async insertRole(role, description, createdBy) {
    try {
      const result = await pool.query(
        "INSERT INTO roles (name, description, created_by) VALUES ($1, $2, $3) RETURNING *",
        [role, description, createdBy]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error inserting role:", error);
      throw error;
    }
  }, // end insertRole

  async findRoleById(id) {
    try {
      const result = await pool.query("SELECT * FROM roles WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    } catch (error) {
      console.error("Error fetching role by ID:", error);
      throw error;
    }
  }, // end findRoleById

  async updateRole(id, role, description, updatedBy) {
    try {
      const result = await pool.query(
        "UPDATE roles SET name = $1, description = $2, updated_by = $3 WHERE id = $4 RETURNING *",
        [role, description, updatedBy, id]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  }, // end updateRole

  async deleteRole(id) {
    try {
      const result = await pool.query("DELETE FROM roles WHERE id = $1", [id]);
      return result.rows[0];
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  }, // end deleteRole
}; // end RolesModel

module.exports = RolesModel;
