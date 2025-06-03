const pool = require("../config/db");

const PermissionModel = {
  // Get all permissions
  async getAllPermissions() {
    const response = await pool.query(
      `SELECT * FROM permissions ORDER BY id ASC`
    );
    return response.rows;
  }, // End getAllPermissions

  // Get all role permissions
  async getAllRolePermissions(limit, page, search) {
    const offset = (page - 1) * limit;
    let dataResult, countResult;

    try {
      const baseQuery = `
        SELECT 
          mr.id,
          m.id AS menu_id,
          r.id AS role_id,
          m.name AS menu_name,
          r.name AS role_name,
          COALESCE(
            ARRAY_AGG(DISTINCT p.name ORDER BY p.name)
            FILTER (WHERE p.name IS NOT NULL), '{}'
          ) AS permissions
        FROM menu_roles mr
        JOIN menus m ON m.id = mr.menu_id
        JOIN roles r ON r.id = mr.role_id
        LEFT JOIN menu_permissions mp ON mp.menu_id = m.id
        LEFT JOIN role_permissions rp ON rp.permission_id = mp.permission_id AND rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
      `;

      if (search) {
        const pattern = `%${search}%`;

        dataResult = await pool.query(
          baseQuery +
            `
            WHERE r.name ILIKE $1 OR m.name ILIKE $1
            GROUP BY mr.id, m.id, r.id, m.name, r.name
            ORDER BY r.name, m.name
            LIMIT $2 OFFSET $3
          `,
          [pattern, limit, offset]
        );

        countResult = await pool.query(
          `SELECT COUNT(*) FROM menu_roles mr
           JOIN roles r ON r.id = mr.role_id
           JOIN menus m ON m.id = mr.menu_id
           WHERE r.name ILIKE $1 OR m.name ILIKE $1`,
          [pattern]
        );
      } else {
        dataResult = await pool.query(
          baseQuery +
            `
            GROUP BY mr.id, m.id, r.id, m.name, r.name
            ORDER BY r.name, m.name
            LIMIT $1 OFFSET $2
          `,
          [limit, offset]
        );

        countResult = await pool.query(`SELECT COUNT(*) FROM menu_roles`);
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
      console.error("Error fetching role permissions:", error);
      return {
        data: [],
        total: 0,
        page,
        last_page: 0,
        error: "Failed to fetch role permissions",
      };
    }
  },

  // Insert role permission
  async insertRolePermission(data) {
    const { menu, permission, role } = data;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Ambil semua permission ID
      const result = await client.query(
        `SELECT id, name FROM permissions WHERE name = ANY($1)`,
        [permission]
      );
      const permissionMap = new Map();
      result.rows.forEach((row) => {
        permissionMap.set(row.name, row.id);
      });

      for (const menuId of menu) {
        // Insert ke menu_roles
        await client.query(
          `INSERT INTO menu_roles (menu_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [menuId, role]
        );

        // Untuk setiap permission, assign ke menu + role
        for (const permName of permission) {
          const permId = permissionMap.get(permName);

          if (permId) {
            // Insert ke menu_permissions
            await client.query(
              `INSERT INTO menu_permissions (menu_id, permission_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [menuId, permId]
            );

            // Insert ke role_permissions
            await client.query(
              `INSERT INTO role_permissions (role_id, permission_id)
               VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [role, permId]
            );
          }
        }
      }

      await client.query("COMMIT");
      return { success: true, message: "Permissions inserted successfully." };
    } catch (err) {
      console.error("Insert error:", err);
      await client.query("ROLLBACK");
      return { success: false, message: "Insert failed.", error: err };
    } finally {
      client.release();
    }
  },

  // Update role permission
  async editRolePermission(data) {
    const { menu, permission, role } = data;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Ambil permission ID dari nama
      const result = await client.query(
        `SELECT id, name FROM permissions WHERE name = ANY($1)`,
        [permission]
      );

      const permissionMap = new Map();
      result.rows.forEach((row) => {
        permissionMap.set(row.name, row.id);
      });

      const permissionIds = [...permissionMap.values()];

      for (const menuId of menu) {
        // 1. Hapus role_permissions untuk role + menu tersebut
        await client.query(
          `DELETE FROM role_permissions 
           WHERE role_id = $1 
           AND permission_id IN (
             SELECT permission_id FROM menu_permissions WHERE menu_id = $2
           )`,
          [role, menuId]
        );

        // 2. Hapus menu_roles (role + menu) agar bisa insert ulang
        await client.query(
          `DELETE FROM menu_roles 
           WHERE role_id = $1 AND menu_id = $2`,
          [role, menuId]
        );

        // 3. Insert ulang menu_roles
        await client.query(
          `INSERT INTO menu_roles (menu_id, role_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [menuId, role]
        );

        // 4. Insert permission ke menu_permissions (jangan dihapus!)
        for (const permName of permission) {
          const permId = permissionMap.get(permName);
          if (!permId) continue;

          await client.query(
            `INSERT INTO menu_permissions (menu_id, permission_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [menuId, permId]
          );

          await client.query(
            `INSERT INTO role_permissions (role_id, permission_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [role, permId]
          );
        }
      }

      await client.query("COMMIT");
      return { success: true, message: "Permissions updated successfully." };
    } catch (err) {
      console.error("Update error:", err);
      await client.query("ROLLBACK");
      return { success: false, message: "Update failed.", error: err };
    } finally {
      client.release();
    }
  },

  async deletePermission(data) {
    const { permission, role, menu } = data;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const permissionArray = Array.isArray(permission)
        ? permission
        : [permission];

      const result = await client.query(
        `SELECT id, name FROM permissions WHERE name = ANY($1)`,
        [permissionArray]
      );

      const permissionIds = result.rows.map((row) => row.id);

      if (permissionIds.length === 0) {
        throw new Error("No matching permissions found");
      }

      await client.query(
        `DELETE FROM menu_permissions 
         WHERE menu_id = $1 AND permission_id = ANY($2)`,
        [menu, permissionIds]
      );

      await client.query(
        `DELETE FROM menu_roles 
         WHERE role_id = $1 AND menu_id = $2`,
        [role, menu]
      );

      await client.query("COMMIT");
      return { success: true, message: "Permissions deleted successfully." };
    } catch (err) {
      console.error("Delete error:", err);
      await client.query("ROLLBACK");
      return { success: false, message: "Delete failed.", error: err.message };
    } finally {
      client.release();
    }
  },
};

module.exports = PermissionModel;
