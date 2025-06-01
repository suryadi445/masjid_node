const bcrypt = require("bcrypt");
const {
  insertUser,
  findUserByEmail,
  findUserRoles,
} = require("../models/userModel");
const { hashPassword } = require("../helpers/hashPasswordHelper");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
} = require("../services/auth/generateTokenService");
const {
  generateRefreshToken,
} = require("../services/auth/refreshTokenService");
require("dotenv").config();

// validation register
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

// validation login
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

// function register
const register = async (req, res) => {
  try {
    const { name, email, password, roles } = req.body;

    const validation = await validateRegister({ name, email, password });
    if (validation.errors) {
      return res.error(422, validation.errors);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // save to database
    const newUser = await insertUser(name, email, hashedPassword, roles);

    return res.success(201, newUser);
  } catch (error) {
    return res.error(500, "Internal server error");
  }
};

// function login
const login = async (req, res) => {
  const data = req.body;

  const validation = await validateLogin(data);

  if (validation.errors) {
    return res.error(422, validation.errors);
  }

  try {
    const user = await findUserByEmail(data.email);

    if (!user) {
      return res.error(401, "Email is not registered.");
    }

    const roles = await findUserRoles(user.id);

    if (roles.length === 0) {
      return res.error(
        401,
        "Please contact your administrator for login access."
      );
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return res.error(401, "Invalid password.");
    }

    const safeUser = { id: user.id, name: user.name, email: user.email };

    const token = generateAccessToken(safeUser);
    const refreshToken = generateRefreshToken(safeUser);

    res.setHeader("Set-Cookie", [
      `${process.env.ACCESS_TOKEN_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=900`, // Access token 15 minutes
      `${process.env.REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; HttpOnly; Path=/; Max-Age=3600`, // Refresh token 1 hour
    ]);
    return res.success(200, safeUser);
  } catch (error) {
    return res.error(500, error.message);
  }
};

const refreshToken = (req, res) => {
  const refreshTokenCookieName = process.env.REFRESH_TOKEN_COOKIE_NAME;
  const refreshToken = req.cookies[refreshTokenCookieName];

  if (!refreshToken) {
    return res.error(401, "No refresh token provided");
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.error(403, "Invalid refresh token");
    }

    const user = { id: decoded.id, email: decoded.email };

    const token = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.setHeader("Set-Cookie", [
      `${process.env.ACCESS_TOKEN_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=900`, // Access token 15 minutes
      `${process.env.REFRESH_TOKEN_COOKIE_NAME}=${newRefreshToken}; HttpOnly; Path=/; Max-Age=3600`, // Refresh token 1 hour
    ]);

    return res.success(200, "Tokens refreshed");
  });
};

const logout = (req, res) => {
  res.setHeader("Set-Cookie", [
    `${process.env.ACCESS_TOKEN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`,
    `${process.env.REFRESH_TOKEN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0`,
  ]);
  return res.success(200, "Logout successful");
};

module.exports = { register, login, refreshToken, logout };
