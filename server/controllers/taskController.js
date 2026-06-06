const pool = require("../config/db");

// ➕ CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, deadline, project_id } = req.body;

    const newTask = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, deadline, project_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, status || 'todo', priority || 'Medium', deadline, project_id]
    );

    res.status(201).json(newTask.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 📋 GET TASKS BY PROJECT
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC",
      [projectId]
    );

    res.json(tasks.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔄 UPDATE TASK STATUS
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const validStatuses = ["todo", "in_progress", "done"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedTask = await pool.query(
      `UPDATE tasks 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, taskId]
    );

    if (updatedTask.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 GET KANBAN TASKS
exports.getKanbanTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
      "SELECT * FROM tasks WHERE project_id = $1",
      [projectId]
    );

    const tasks = result.rows;

    const kanban = {
      todo: tasks.filter(t => t.status === "todo"),
      in_progress: tasks.filter(t => t.status === "in_progress"),
      done: tasks.filter(t => t.status === "done"),
    };

    res.json(kanban);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🗑️ DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Задача не знайдена" });
    }

    res.json({ message: "Задача успішно видалена" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка видалення задачі" });
  }
};
// ✏️ UPDATE TASK
exports.updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, description, priority, deadline } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, 
           description = $2, 
           priority = $3, 
           deadline = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING *`,
      [title, description || null, priority, deadline || null, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Задача не знайдена" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення задачі" });
  }
};