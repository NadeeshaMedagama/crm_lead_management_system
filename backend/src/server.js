const app = require("./app");
const config = require("./config");
const { connectDb } = require("./db");
const seedTestUser = require("./seed");

async function start() {
  await connectDb(config.mongoUri);
  await seedTestUser();

  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on port ${config.port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
