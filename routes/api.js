const { getBaseUrl } = require("../config/baseUrl");
const {
  getAllUser,
  createUser,
  getUser,
  updateUser,
} = require("../controllers/UserController");
const { updateProfile } = require("../controllers/ProfileController");
const {
  register,
  login,
  refreshToken,
  logout,
} = require("../controllers/AuthController");
const { successResponse, errorResponse } = require("../helpers/responseHelper");

function handleRequest(req, res) {
  const url = new URL(req.url, getBaseUrl(req));

  res.success = (statusCode, message, data = null) =>
    successResponse(res, statusCode, message, data);
  res.error = (statusCode, message, data = null) =>
    errorResponse(res, statusCode, message, data);

  // Auth Routes
  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    return register(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/auth/login") {
    return login(req, res);
  } else if (
    req.method === "POST" &&
    url.pathname === "/api/auth/refresh-token"
  ) {
    return refreshToken(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    return logout(req, res);
  }

  // User Routes
  if (req.method === "GET" && url.pathname === "/api/users") {
    return getAllUser(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/users") {
    return createUser(req, res);
  } else if (req.method === "GET" && url.pathname === "/api/user") {
    return getUser(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/user/profile") {
    return updateUser(req, res);
  } else if (req.method === "PUT" && url.pathname === "/api/user/profile") {
    return updateProfile(req, res);
  }

  // 404 Error Handling
  console.log(`404 Not Found: ${req.method} ${url.pathname}`);
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
}

module.exports = { handleRequest };
