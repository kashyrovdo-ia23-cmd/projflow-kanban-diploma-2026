const express = require("express");
const router = express.Router();

const projectController = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");

// створити проект
router.post("/", authMiddleware, projectController.createProject);

// отримати всі проекти
router.get("/", authMiddleware, projectController.getProjects);

// отримати один проект
router.get("/:id", authMiddleware, projectController.getProjectById);

// 🗑️ видалити проект
router.delete("/:id", authMiddleware, projectController.deleteProject);

// оновити проєкт
router.put("/:id", authMiddleware, projectController.updateProject);

module.exports = router;