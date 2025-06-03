const url = require("url");
const {
  getAllRoles,
  insertRole,
  findRoleById,
  updateRole,
  deleteRole,
  getMenuRoleById,
} = require("../models/RolesModel");

const getRoles = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const limit = parseInt(parsedUrl.query.limit) || 10;
  const page = parseInt(parsedUrl.query.page) || 1;
  const search = parsedUrl.query.search || "";
  try {
    const roles = await getAllRoles(limit, page, search);
    return res.success(200, roles);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const createRole = async (req, res) => {
  try {
    const { role, description } = req.body;
    const createdBy = req.user.id;
    const newRole = await insertRole(role, description, createdBy);
    return res.success(201, newRole);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const getRoleById = async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const id = parsedUrl.query.id;

    const role = await findRoleById(id);
    return res.success(200, role);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const updateRoleById = async (req, res) => {
  try {
    const { id, role, description } = req.body;
    const updatedBy = req.user.id;
    const updatedRole = await updateRole(id, role, description, updatedBy);
    return res.success(200, updatedRole);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const deleteRoleById = async (req, res) => {
  try {
    const id = req.body.id;

    if (!id) {
      return res.error(400, "Role ID is required");
    }

    if (id == 2) {
      return res.error(400, "Cannot delete Admin role");
    }

    const deletedRole = await deleteRole(id);
    return res.success(200, deletedRole);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

const getMenuRole = async (req, res) => {
  const id = req.user.id;
  try {
    const response = await getMenuRoleById(id);
    return res.success(200, response);
  } catch (error) {
    console.log(error);
    return res.error(500, error.message);
  }
};

module.exports = {
  getRoles,
  createRole,
  getRoleById,
  updateRoleById,
  deleteRoleById,
  getMenuRole,
};
