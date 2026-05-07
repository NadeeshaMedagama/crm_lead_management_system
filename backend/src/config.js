const dotenv = require("dotenv");

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "super-secret-jwt-key",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  frontendUrl: process.env.FRONTEND_URL || "",
};

module.exports = config;
