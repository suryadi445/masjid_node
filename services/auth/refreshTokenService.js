const jwt = require("jsonwebtoken");

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = { generateRefreshToken };
