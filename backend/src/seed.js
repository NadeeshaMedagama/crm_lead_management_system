const User = require("./models/User");

async function seedTestUser() {
  const email = "admin@example.com";
  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await User.hashPassword("password123");
  await User.create({
    email,
    passwordHash,
    name: "Admin User",
  });
}

module.exports = seedTestUser;
