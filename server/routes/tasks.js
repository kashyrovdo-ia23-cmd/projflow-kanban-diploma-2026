const express = require("express");
const router = express.Router();

const taskController = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// створити задачу
router.post("/", authMiddleware, taskController.createTask);

// отримати задачі проекту (для списку)
router.get("/:projectId", authMiddleware, taskController.getTasks);

// 🔥 KANBAN — головний маршрут
router.get("/project/:projectId/kanban", authMiddleware, taskController.getKanbanTasks);

// 🔄 оновлення статусу задачі
router.patch("/:taskId/status", authMiddleware, taskController.updateTaskStatus);

// 🗑️ ВИДАЛЕННЯ ЗАДАЧІ (додаємо цей рядок)
router.delete("/:taskId", authMiddleware, taskController.deleteTask);

// ✏️ оновити задачу
router.put("/:taskId", authMiddleware, taskController.updateTask);

module.exports = router;