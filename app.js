const http = require("http");
const { handleRequest } = require("./routes/api");
const { setHeaders } = require("./middleware");
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
    cookies[parts[0].trim()] = parts[1] ? parts[1].trim() : "";
  });
  return cookies;
};

const server = http.createServer((req, res) => {
  cookieMiddleware(req, res, () => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    setHeaders(req, res, () => {
      handleRequest(req, res);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
