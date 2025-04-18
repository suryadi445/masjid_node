const { findUserId } = require("../models/userModel");

const users = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Doe" },
];

function getUsers(req, res) {
  res.writeHead(200);
  res.end(JSON.stringify(users));
}

function createUser(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", () => {
    const userData = JSON.parse(body);
    users.push({ id: users.length + 1, name: userData.name });
    res.writeHead(201);
    res.end(
      JSON.stringify({ message: `User ${userData.name} created successfully` })
    );
  });
}

function getProfile(req, res) {
  const userId = req.user.id;

  findUserId(userId)
    .then((profile) => {
      return res.success(200, profile);
    })
    .catch((error) => {
      console.log(error);
      return res.error(500, error.message);
    });
}

module.exports = { getUsers, createUser, getProfile };
