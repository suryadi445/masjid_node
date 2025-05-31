const { getAllSidebarMenus } = require("../models/sidebarModel");

const getSidebarMenus = async (req, res) => {
  try {
    const menus = await getAllSidebarMenus();
    return res.success(200, menus);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to fetch menus");
  }
};

module.exports = { getSidebarMenus };
