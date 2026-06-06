const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 🔌 підключення до БД
const pool = require("./config/db");

// 🔐 роутери
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");

// 🔐 middleware авторизації
const authMiddleware = require("./middleware/authMiddleware");

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================

// auth
app.use("/api/auth", authRoutes);

// projects
app.use("/api/projects", projectRoutes);

// tasks (KANBAN вже тут працює 🔥)
app.use("/api/tasks", taskRoutes);

// ================= TEST ROUTES =================

// базовий
app.get("/", (req, res) => {
  res.send("API працює 🚀");
});

// тест БД
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 🔐 protected test
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Ти авторизований 🔐",
    user: req.user,
  });
});

// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});