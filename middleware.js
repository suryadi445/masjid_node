const { getBaseUrl } = require("./config/baseUrl");
const jwt = require("jsonwebtoken");

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
  const token = req.cookies.token; // Get token from cookies (read only)

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Token is invalid." });
    }

    // Attach decoded user information to the request object
    req.user = decoded;
    next(); // Continue to the next middleware or route handler
  });
};

module.exports = { setHeaders, authMiddleware };
