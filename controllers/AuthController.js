const bcrypt = require("bcrypt");
const { insertUser, findUserByEmail } = require("../models/userModel");
const { hashPassword } = require("../helpers/hashPasswordHelper");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const validateRegister = async (data) => {
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

const validateLogin = async (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format!",
      "string.empty": "Email is required!",
    }),
    password: Joi.string().min(6).required().messages({
      "string.empty": "Password is required!",
      "string.min": "Password must be at least 6 characters!",
    }),
  });

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

      const validation = await validateRegister({ name, email, password });
      if (validation.errors) {
        return res.error(422, validation.errors);
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
  const secretKey = process.env.JWT_SECRET;
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", async () => {
    const data = JSON.parse(body);
    const validation = await validateLogin(data);

    if (validation.errors) {
      return res.error(422, validation.errors);
    }

    try {
      const user = await findUserByEmail(data.email);

      if (!user) {
        return res.error(401, "Email is not registered.");
      }

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        return res.error(401, "Invalid password.");
      }

      const safeUser = { id: user.id, name: user.name, email: user.email };
      const token = jwt.sign(safeUser, secretKey, { expiresIn: "1d" });

      res.setHeader(
        "Set-Cookie",
        `token=${token}; HttpOnly; Max-Age=86400; Path=/; SameSite=Strict`
      );
      return res.success(200, safeUser);
    } catch (error) {
      return res.error(500, error.message);
    }
  });
}

module.exports = { register, login };
