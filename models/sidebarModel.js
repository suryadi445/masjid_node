const pool = require("../config/db");

const sidebarMenu = {
    async getAllSidebarMenus(limit, page, search) {
        const offset = (page - 1) * limit;
        let dataResult, countResult;

        try {
            if (search) {
                const pattern = `%${search}%`;

                // Query data dengan filter search
                dataResult = await pool.query(
                    `SELECT * FROM menus WHERE name ILIKE $1 ORDER BY sort_order ASC LIMIT $2 OFFSET $3`,
                    [pattern, limit, offset]
                );

                // Query jumlah data yang cocok
                countResult = await pool.query(
                    `SELECT COUNT(*) FROM menus WHERE name ILIKE $1`,
                    [pattern]
                );
            } else {
                // Query data tanpa filter
                dataResult = await pool.query(
                    `SELECT * FROM menus ORDER BY sort_order ASC LIMIT $1 OFFSET $2`,
                    [limit, offset]
                );

                // Total count tanpa filter
                countResult = await pool.query(`SELECT COUNT(*) FROM menus`);
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
            console.error("Error fetching menus:", error);
            throw error;
        }
    },

    async getAllMenusModel() {
        try {
            const result = await pool.query(
                "SELECT * FROM menus ORDER BY sort_order ASC"
            );
            return result.rows;
        } catch (error) {
            console.error("Error fetching menus:", error);
            throw error;
        }
    },

    async createMenuModel(name, icon, sort_order, is_active) {
        try {
            const result = await pool.query(
                "INSERT INTO menus (name, icon, sort_order, is_active) VALUES ($1, $2, $3, $4) RETURNING id, name, icon, sort_order, is_active",
                [name, icon, sort_order, is_active]
            );
            return result.rows[0];
        } catch (error) {
            console.error("Error creating menu:", error);
            throw error;
        }
    },

    async updateMenuModel(id, name, icon, sort_order, is_active) {
        let index = 1;
        const fieldsToUpdate = [];
        const values = [];

        if (name !== undefined) {
            fieldsToUpdate.push(`name = $${index++}`);
            values.push(name);
        }
        if (icon !== undefined) {
            fieldsToUpdate.push(`icon = $${index++}`);
            values.push(icon);
        }
        if (sort_order !== undefined) {
            fieldsToUpdate.push(`sort_order = $${index++}`);
            values.push(sort_order);
        }
        if (is_active !== undefined && is_active !== null) {
            fieldsToUpdate.push(`is_active = $${index++}`);
            values.push(is_active);
        }

        if (fieldsToUpdate.length === 0) {
            throw new Error("No fields to update");
        }

        // WHERE clause
        values.push(id);
        const query = `
      UPDATE menus
      SET ${fieldsToUpdate.join(", ")}
      WHERE id = $${index}
      RETURNING id, name, icon, sort_order, is_active
    `;

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error("Error updating menu:", error);
            throw error;
        }
    },

    async deleteMenuModel(id) {
        try {
            const result = await pool.query("DELETE FROM menus WHERE id = $1", [id]);
            return result.rows[0];
        } catch (error) {
            console.error("Error deleting menu:", error);
            throw error;
        }
    },
};

module.exports = sidebarMenu;
