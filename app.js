const http = require("http");
const { setHeaders, authMiddleware } = require("./middleware");
const { handleRequest } = require("./routes/api");
const dotenv = require("dotenv");

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

const server = http.createServer((req, res) => {
  try {
    cookieMiddleware(req, res, () => {
      console.log(`Incoming request: ${req.method} ${req.url}`);
      setHeaders(req, res, () => {
        authMiddleware(req, res, () => {
          handleRequest(req, res);
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
