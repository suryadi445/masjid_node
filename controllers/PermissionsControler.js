const url = require("url");
const {
  insertRolePermission,
  getAllPermissions,
  getAllRolePermissions,
  editRolePermission,
  deletePermission,
} = require("../models/permissioinsModel");

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const response = await getAllPermissions(req.body);
    return res.success(201, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

// Get all role permissions
const getRolePermissions = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const limit = parseInt(parsedUrl.query.limit) || 10;
  const page = parseInt(parsedUrl.query.page) || 1;
  const search = parsedUrl.query.search || "";

  try {
    const response = await getAllRolePermissions(limit, page, search);
    return res.success(200, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

// Create role permissions
const createRolePermissions = async (req, res) => {
  try {
    if (!req.body) {
      return res.error(400, "Data is required");
    }

    if (!Array.isArray(req.body.menu) || req.body.menu.length === 0) {
      return res.error(422, "Menu is required.");
    }

    if (
      !Array.isArray(req.body.permission) ||
      req.body.permission.length === 0
    ) {
      return res.error(422, "Permission is required.");
    }

    if (!req.body.role) {
      return res.error(422, "Role is required.");
    }

    const response = await insertRolePermission(req.body);

    return res.success(201, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const updateRolePermissions = async (req, res) => {
  try {
    if (!req.body) {
      return res.error(400, "Data is required");
    }

    if (!Array.isArray(req.body.menu) || req.body.menu.length === 0) {
      return res.error(422, "Menu is required.");
    }

    if (
      !Array.isArray(req.body.permission) ||
      req.body.permission.length === 0
    ) {
      return res.error(422, "Permission is required.");
    }

    if (!req.body.role) {
      return res.error(422, "Role is required.");
    }

    const response = await editRolePermission(req.body);
    return res.success(200, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const deleteRolePermissions = async (req, res) => {
  try {
    const response = await deletePermission(req.body);
    return res.success(200, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

module.exports = {
  createRolePermissions,
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
  deleteRolePermissions,
};
