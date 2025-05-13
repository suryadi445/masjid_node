const http = require("http");
const {
  setHeaders,
  authMiddleware,
  bodyParserMiddleware,
} = require("./middleware");
const { handleRequest } = require("./routes/api");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

dotenv.config();
const PORT = process.env.APP_PORT;

const cookieMiddleware = (req, res, next) => {
  const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {};
  req.cookies = cookies;
  next();
};

const parseCookies = (cookieHeader) => {
  const cookies = {};
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    cookies[parts[0].trim()] = parts[1]
      ? decodeURIComponent(parts[1].trim())
      : "";
  });
  return cookies;
};

const serveStaticFile = (req, res) => {
  const staticDir = path.join(__dirname, "uploads", "images");
  const filePath = path.join(
    staticDir,
    req.url.replace("/uploads/images/", "")
  );

  if (req.url.startsWith("/uploads/images/") && fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
      }[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
    return true;
  }

  return false;
};

const server = http.createServer((req, res) => {
  try {
    if (serveStaticFile(req, res)) return;

    cookieMiddleware(req, res, () => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      setHeaders(req, res, () => {
        bodyParserMiddleware(req, res, () => {
          authMiddleware(req, res, () => {
            handleRequest(req, res);
          });
        });
      });
    });
  } catch (err) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ message: "Internal Server Error", error: err.message })
    );
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
