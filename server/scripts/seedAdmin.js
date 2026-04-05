/**
 * One-off script: create an Admin user (run after MongoDB is up).
 * Usage: node scripts/seedAdmin.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { User } = require("../models/user.model");

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI missing");
  }
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMeAdmin1!";
  const name = process.env.SEED_ADMIN_NAME || "Admin";

  await mongoose.connect(uri);
  const existing = await User.findOne({ email });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log("Admin email already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    password: hashed,
    role: "Admin",
    status: "active",
  });
  // eslint-disable-next-line no-console
  console.log("Admin created:", email);
  await mongoose.disconnect();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
