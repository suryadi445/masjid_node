const { getBaseUrl } = require("../config/baseUrl");
const { getUsers, createUser } = require("../controllers/UserController");
const { register, login } = require("../controllers/AuthController");

function handleRequest(req, res) {
  const url = new URL(req.url, getBaseUrl(req));

  // Auth Routes
  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    return register(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/auth/login") {
    return login(req, res);
  }

  // User Routes
  if (req.method === "GET" && url.pathname === "/api/users") {
    return getUsers(req, res);
  } else if (req.method === "POST" && url.pathname === "/api/users") {
    return createUser(req, res);
  }

  // 404 Error Handling
  console.log(`404 Not Found: ${req.method} ${url.pathname}`);
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
}

module.exports = { handleRequest };
