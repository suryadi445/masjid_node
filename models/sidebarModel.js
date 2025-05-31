const pool = require("../config/db");

const sidebarMenu = {
  async getAllSidebarMenus() {
    try {
      const result = await pool.query("SELECT * FROM menus");
      return result.rows;
    } catch (error) {
      console.error("Error fetching sidebar menus:", error);
      throw error;
    }
  },
};

module.exports = sidebarMenu;
