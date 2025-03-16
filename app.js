const http = require("http");
const { handleRequest } = require("./routes/api");

const server = http.createServer(handleRequest);

server.listen(5000, () =>
  console.log("Server running on http://localhost:5000")
);
