const pool = require("../config/db");

const RolesModel = {
  async getAllRoles(limit, page, search) {
    const offset = (page - 1) * limit;
    let dataResult, countResult;
    const super_admin = 1;

    try {
      if (search) {
        const pattern = `%${search}%`;

        // Query data dengan filter
        dataResult = await pool.query(
          `SELECT * FROM roles WHERE id != $1 AND name ILIKE $2 ORDER BY id ASC LIMIT $3 OFFSET $4`,
          [super_admin, pattern, limit, offset]
        );

        // Query count total data yang cocok
        countResult = await pool.query(
          `SELECT COUNT(*) FROM roles WHERE name ILIKE $1`,
          [pattern]
        );
      } else {
        // Query data tanpa filter
        dataResult = await pool.query(
          `SELECT * FROM roles WHERE id != $1 ORDER BY id ASC LIMIT $2 OFFSET $3`,
          [super_admin, limit, offset]
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
    await RolesModel.checkRole(role);

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

  async checkRole(role) {
    const existing = await pool.query(
      "SELECT * FROM roles WHERE LOWER(name) = LOWER($1)",
      [role]
    );

    if (existing.rows.length > 0) {
      throw new Error("Role name already exists");
    }
  }, // end checkRole by role name

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

  async getMenuRoleById(userId) {
    const roleQuery = `SELECT role_id FROM user_roles WHERE user_id = $1`;
    const rolesResult = await pool.query(roleQuery, [userId]);
    const roleIds = rolesResult.rows.map((r) => r.role_id);

    if (roleIds.includes(1) || roleIds.includes(2)) {
      // if super admin or admin role is present, return all menus
      const allMenusQuery = `
          SELECT id, name, route, icon, sort_order FROM menus ORDER BY sort_order ASC
        `;
      const allMenusResult = await pool.query(allMenusQuery);
      return allMenusResult.rows;
    } else {
      // if super admin or admin role is not present, return menus based on user roles
      const menuQuery = `
          SELECT DISTINCT m.id, m.name, m.route, m.icon, m.sort_order
          FROM user_roles ur
          JOIN menu_roles mr ON ur.role_id = mr.role_id
          JOIN menus m ON mr.menu_id = m.id
          WHERE ur.user_id = $1
          ORDER BY m.sort_order ASC
        `;
      const menuResult = await pool.query(menuQuery, [userId]);
      return menuResult.rows;
    }
  }, // end getMenuRoleById
}; // end RolesModel

module.exports = RolesModel;
