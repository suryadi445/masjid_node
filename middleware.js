const { getBaseUrl } = require("./config/baseUrl");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const setHeaders = (req, res, next) => {
  const url = new URL(req.url, getBaseUrl(req));

  // Set CORS Headers
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle Preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    console.log(`Handling OPTIONS request for ${url.pathname}`);
    res.writeHead(204);
    return res.end();
  }

  next(); // next request handler
};

const authMiddleware = (req, res, next) => {
  if (witheListToken(req)) {
    return next(); // Skip auth for public routes
  }

  const tokenCookieName = process.env.ACCESS_TOKEN_COOKIE_NAME;
  const token = req.cookies[tokenCookieName];

  if (!token) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "No token provided." }));
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Token is invalid." }));
      return;
    }

    // Attach decoded user information to the request object
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

const bodyParserMiddleware = (req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.startsWith("multipart/form-data")) {
    return next(); // Skip body parsing for multipart/form-data
  }

  let data = "";

  req.on("data", (chunk) => {
    data += chunk;
  });

  req.on("end", () => {
    try {
      if (data) {
        req.body = JSON.parse(data);
      }
      next();
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Invalid JSON payload" }));
    }
  });

  req.on("error", () => {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Error parsing body" }));
  });
};

const witheListToken = (req) => {
  const openRoutes = [
    { url: "/api/auth/login", method: "POST" },
    { url: "/api/auth/register", method: "POST" },
    { url: "/api/auth/refresh-token", method: "POST" },
  ];

  return openRoutes.some(
    (route) => req.url === route.url && req.method === route.method
  );
};

module.exports = { setHeaders, authMiddleware, bodyParserMiddleware };
