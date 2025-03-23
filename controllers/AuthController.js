const bcrypt = require("bcrypt");
const { insertUser, findUserByEmail } = require("../models/userModel");
const { hashPassword } = require("../helpers/hashPasswordHelper");
const Joi = require("joi");

const validateUser = async (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required().messages({
      "string.empty": "Name is required!",
      "string.min": "Name must be at least 3 characters long!",
    }),
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format!",
      "string.empty": "Email is required!",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required!",
      "string.min": "Password must be at least 6 characters!",
    }),
  });

  const existingUser = await findUserByEmail(data.email);
  if (existingUser) {
    return { errors: ["Email is already registered!"] };
  }

  const validationResult = schema.validate(data, { abortEarly: false });
  if (validationResult.error) {
    return { errors: validationResult.error.details.map((err) => err.message) };
  }

  return { errors: null };
};

const register = async (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { name, email, password } = JSON.parse(body);

      const validation = await validateUser({ name, email, password });
      if (validation.errors) {
        return res.error(400, validation.errors);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // save to database
      const newUser = await insertUser(name, email, hashedPassword);

      return res.success(201, newUser);
    } catch (error) {
      return res.error(500, "Internal server error");
    }
  });
};

function login(req, res) {
  console.log("🟢 Login API Called");
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const data = JSON.parse(body || "{}");
    console.log("Received Data:", data);
    res.writeHead(200);
    res.end(JSON.stringify({ message: "Login successful" }));
  });
}

module.exports = { register, login };
