const express = require("express");
const cors = require("cors");
const path = require("node:path");
const tasksRouter = require("./routes/tasks");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/tasks", tasksRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// The staging container serves the compiled frontend and API on the same port.
app.get("/version", (req, res) => {
  res.json({
    commit: process.env.GIT_COMMIT || "unknown",
    environment: process.env.DEPLOY_ENV || "development"
  });
});
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/tasks`);
  });
}

module.exports = app;