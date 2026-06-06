// js/project.js
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

if (!projectId) {
  alert("Помилка: ID проєкту не знайдено!");
  window.location.href = "dashboard.html";
}

// ➕ СТВОРЕННЯ ЗАДАЧІ
async function createNewTask() {
  const title = prompt("Назва задачі:");
  if (!title || !title.trim()) return;

  const description = prompt("Опис задачі (необов'язково):") || "";

  try {
    await apiRequest("/tasks", "POST", {
      title: title.trim(),
      description: description.trim(),
      status: "todo",
      priority: "Medium",
      project_id: parseInt(projectId)
    });

    alert("✅ Задача успішно додана!");
    loadProject();
  } catch (error) {
    console.error("Помилка створення задачі:", error);
    alert("Не вдалося створити задачу.\nПеревірте, чи запущений бекенд.");
  }
}

// 🎨 Рендер задач
function renderColumn(columnId, tasks) {
  const container = document.getElementById(columnId);
  container.innerHTML = "";

  tasks.forEach(task => {
    const div = document.createElement("div");
    div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100";

    div.innerHTML = `
      <h4 class="font-medium mb-2">${task.title}</h4>
      <p class="text-sm text-gray-500 mb-3">${task.description || ""}</p>

      <div class="flex gap-2">
        <button onclick="moveTask(${task.id}, 'todo')" class="text-xs bg-blue-100 px-2 py-1 rounded">To Do</button>
        <button onclick="moveTask(${task.id}, 'in_progress')" class="text-xs bg-yellow-100 px-2 py-1 rounded">In Progress</button>
        <button onclick="moveTask(${task.id}, 'done')" class="text-xs bg-green-100 px-2 py-1 rounded">Done</button>
      </div>
    `;

    container.appendChild(div);
  });
}

// 🔄 Оновлення статусу (KANBAN)
async function moveTask(taskId, status) {
  try {
    await apiRequest(`/tasks/${taskId}/status`, "PATCH", { status });
    loadProject();
  } catch (error) {
    alert("Помилка зміни статусу");
  }
}

// ➕ СТВОРЕННЯ ЗАДАЧІ (РЕАЛЬНЕ)
async function createNewTask() {
  const title = prompt("Назва задачі:");
  if (!title) return;

  const description = prompt("Опис задачі:") || "";

  try {
    await apiRequest("/tasks", "POST", {
      title,
      description,
      status: "todo",
      priority: "Medium",
      deadline: null,
      project_id: projectId
    });

    loadProject();
  } catch (error) {
    alert("Помилка створення задачі");
  }
}

// 🔙 Назад
function goBack() {
  window.location.href = "dashboard.html";
}

// 🚀 запуск
document.addEventListener("DOMContentLoaded", loadProject);