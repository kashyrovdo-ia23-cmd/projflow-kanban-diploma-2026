const pool = require("../config/db");

// ➕ CREATE PROJECT
const createProject = async (req, res) => {
  const { name, description } = req.body;
  const owner_id = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Назва обов'язкова" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO projects (name, description, owner_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description || null, owner_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 GET ALL PROJECTS
const getProjects = async (req, res) => {
  const owner_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT p.*, COUNT(t.id) as "taskCount"
       FROM projects p
       LEFT JOIN tasks t ON t.project_id = p.id
       WHERE p.owner_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [owner_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📄 GET ONE PROJECT
const getProjectById = async (req, res) => {
  const { id } = req.params;
  const owner_id = req.user.id;

  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE id = $1 AND owner_id = $2`,
      [id, owner_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Не знайдено" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🗑️ DELETE PROJECT
const deleteProject = async (req, res) => {
  const { id } = req.params;
  const owner_id = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 AND owner_id = $2 RETURNING *`,
      [id, owner_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Проєкт не знайдено" });
    }

    res.json({ message: "Проєкт видалено" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ UPDATE PROJECT
const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  const owner_id = req.user.id;

  if (!name) {
    return res.status(400).json({ message: "Назва обов'язкова" });
  }

  try {
    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, description = $2 
       WHERE id = $3 AND owner_id = $4 
       RETURNING *`,
      [name, description || null, id, owner_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Проєкт не знайдено або у вас немає прав" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Помилка оновлення проєкту" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  updateProject   // ← тепер правильно підключено
};