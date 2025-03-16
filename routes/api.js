const { getUsers, createUser } = require("../controllers/UserController");

function handleRequest(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*"); // Izinkan semua domain
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Izinkan metode
  res.setHeader("Access-Control-Allow-Headers", "Content-Type"); // Izinkan header

  // Tangani request OPTIONS (preflight request dari browser)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/api/users") {
    return getUsers(req, res);
  } else if (req.method === "POST" && req.url === "/api/users") {
    return createUser(req, res);
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Not Found" }));
  }
}

module.exports = { handleRequest };
