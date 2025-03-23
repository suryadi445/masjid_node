const http = require("http");
const { handleRequest } = require("./routes/api");
const { setHeaders } = require("./middleware");

const PORT = 5000;

const server = http.createServer((req, res) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  setHeaders(req, res, () => {
    handleRequest(req, res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
