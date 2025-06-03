const url = require("url");
const {
  getAllSidebarMenus,
  updateMenuModel,
  deleteMenuModel,
  createMenuModel,
  getAllMenusModel,
} = require("../models/sidebarModel");

const getSidebarMenus = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const limit = parseInt(parsedUrl.query.limit) || 10;
  const page = parseInt(parsedUrl.query.page) || 1;
  const search = parsedUrl.query.search || "";
  try {
    const menus = await getAllSidebarMenus(limit, page, search);
    return res.success(200, menus);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to fetch menus");
  }
};

const getAllMenus = async (req, res) => {
  try {
    const menus = await getAllMenusModel();
    return res.success(200, menus);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to fetch menus");
  }
};

const createMenu = async (req, res) => {
  try {
    const { name, icon, sort_order, is_active } = req.body;
    const newMenu = await createMenuModel(name, icon, sort_order, is_active);
    return res.success(201, newMenu);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to create menu");
  }
};

const updateMenu = async (req, res) => {
  try {
    const { id, name, icon, sort_order, is_active } = req.body;

    const updatedMenu = await updateMenuModel(
      id,
      name,
      icon,
      sort_order,
      is_active
    );
    return res.success(200, updatedMenu);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to update menu");
  }
};

const deleteMenu = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedMenu = await deleteMenuModel(id);
    return res.success(200, deletedMenu);
  } catch (error) {
    console.error(error);
    return res.error(500, "Failed to delete menu");
  }
};

module.exports = {
  getSidebarMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  getAllMenus,
};
