const express = require("express");
const cors = require("cors");
const config = require("./config");
const authMiddleware = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const leadsRoutes = require("./routes/leads");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

const corsOptions = config.frontendUrl ? { origin: config.frontendUrl } : undefined;

app.use(cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", authMiddleware, leadsRoutes);
app.use("/api/dashboard", authMiddleware, dashboardRoutes);

app.use((error, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
