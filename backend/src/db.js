const mongoose = require("mongoose");

async function connectDb(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }
  await mongoose.connect(mongoUri);
}

async function disconnectDb() {
  await mongoose.connection.close();
}

module.exports = {
  connectDb,
  disconnectDb,
};
