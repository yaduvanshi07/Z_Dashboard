const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { User } = require("../models/user.model");

const SALT_ROUNDS = 12;

function assertJwtEnv() {
  if (!process.env.JWT_SECRET) {
    throw new AppError("JWT_SECRET is not configured", 500);
  }
}

function signToken(userId) {
  assertJwtEnv();
  const payload = { sub: userId.toString() };
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

async function register({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "Viewer",
    status: "active",
  });

  const safe = user.toSafeJSON();
  const token = signToken(user._id);
  return { user: safe, token };
}

function issueTokenForUser(user) {
  return signToken(user._id);
}

async function getMe(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user.toSafeJSON();
}

module.exports = {
  register,
  issueTokenForUser,
  getMe,
};
