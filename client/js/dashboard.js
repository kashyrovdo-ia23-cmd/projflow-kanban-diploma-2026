document.addEventListener("DOMContentLoaded", () => {
  loadUserInfo();
  loadDashboardStats();
  loadProjects();
});

// ========== ЗАВАНТАЖЕННЯ ІНФОРМАЦІЇ ПРО КОРИСТУВАЧА ==========
function loadUserInfo() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const nameEl = document.getElementById("user-name"); // якщо додаси пізніше
    if (nameEl) nameEl.textContent = payload.name || "Користувач";

    // Привітання
    document.getElementById("greeting-name").textContent = payload.name?.split(" ")[0] || "Друже";
  } catch (e) {
    console.error("Не вдалося розшифрувати токен", e);
    document.getElementById("greeting-name").textContent = "Друже";
  }
}

// ========== ВИХІД З АКАУНТУ ==========
function logout() {
  if (confirm("Ви дійсно хочете вийти з акаунту?")) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}

// ========== СТАТИСТИКА НА DASHBOARD ==========
async function loadDashboardStats() {
  try {
    const projects = await apiRequest("/projects");
    
    let totalTasks = 0;
    let doneTasks = 0;

    for (const project of projects) {
      try {
        const kanban = await apiRequest(`/tasks/project/${project.id}/kanban`);
        totalTasks += (kanban.todo?.length || 0) + 
                      (kanban.in_progress?.length || 0) + 
                      (kanban.done?.length || 0);
        doneTasks += (kanban.done?.length || 0);
      } catch (e) {
        // якщо якийсь проєкт не завантажився — пропускаємо
      }
    }

    document.getElementById("stat-projects").textContent = projects.length;
    document.getElementById("stat-tasks").textContent = totalTasks;
    document.getElementById("stat-done").textContent = doneTasks;

  } catch (error) {
    console.error("Помилка завантаження статистики:", error);
  }
}

// ========== ЗАВАНТАЖЕННЯ ПРОЄКТІВ (твій поточний код) ==========
async function loadProjects() {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  container.innerHTML = `
    <div class="col-span-3 text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-indigo-500"></i>
      <p class="mt-4 text-gray-500">Завантаження проєктів...</p>
    </div>`;

  try {
    const projects = await apiRequest("/projects");

    container.innerHTML = "";

    if (!projects || projects.length === 0) {
      container.innerHTML = `
        <div class="col-span-3 bg-white rounded-3xl p-12 text-center">
          <i class="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <h3 class="text-2xl font-medium text-gray-700 mb-2">У вас ще немає проєктів</h3>
          <p class="text-gray-500 mb-6">Створіть перший проєкт, щоб почати роботу</p>
          <button onclick="createNewProject()" 
                  class="bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition">
            + Створити перший проєкт
          </button>
        </div>`;
      return;
    }

    projects.forEach(project => {
      const cardHTML = `
        <div class="bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-1">${project.name}</h3>
            <p class="text-gray-600 text-sm mb-4">${project.description || "Без опису"}</p>
          </div>

          <div class="p-4 border-t flex justify-between items-center text-sm">
            <button onclick="editProject(${project.id}, '${project.name.replace(/'/g, "\\'")}', '${(project.description || '').replace(/'/g, "\\'")}'); event.stopImmediatePropagation()" 
                    class="flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium">
              <i class="fas fa-edit"></i>
              <span>Редагувати</span>
            </button>

            <button onclick="openProject(${project.id}); event.stopImmediatePropagation()" 
                    class="text-indigo-600 hover:text-indigo-700 font-medium">Відкрити</button>

            <button onclick="deleteProject(${project.id}); event.stopImmediatePropagation()" 
                    class="text-red-500 hover:text-red-600 font-medium">Видалити</button>
          </div>
        </div>`;
      container.innerHTML += cardHTML;
    });

  } catch (error) {
    console.error("Помилка завантаження проєктів:", error);
    container.innerHTML = `
      <div class="col-span-3 text-center text-red-500 p-6 bg-red-50 rounded-2xl">
        Не вдалося завантажити проєкти
      </div>`;
  }
}

// ========== ДОПОМІЖНІ ФУНКЦІЇ ==========
function openProject(id) {
  window.location.href = `project.html?id=${id}`;
}

async function createNewProject() {
  const name = prompt("Введіть назву проєкту:");
  if (!name || name.trim() === "") return;

  const description = prompt("Введіть короткий опис проєкту:") || "";

  try {
    const result = await apiRequest("/projects", "POST", {
      name: name.trim(),
      description: description.trim()
    });

    if (result && result.id) {
      alert("✅ Проєкт успішно створено!");
      loadDashboardStats(); // оновлюємо статистику
      loadProjects();
    }
  } catch (error) {
    console.error(error);
    alert("Помилка при створенні проєкту");
  }
}

async function deleteProject(id) {
  if (!confirm("Видалити цей проєкт і всі його задачі?")) return;

  try {
    await apiRequest(`/projects/${id}`, "DELETE");
    loadDashboardStats(); // оновлюємо статистику
    loadProjects();
  } catch (error) {
    alert("Не вдалося видалити проєкт");
  }
}

// ========== РЕДАГУВАННЯ ПРОЄКТУ ==========
let currentEditId = null;

function editProject(id, name, description) {
  currentEditId = id;
  document.getElementById("edit-name").value = name || "";
  document.getElementById("edit-description").value = description || "";
  document.getElementById("edit-modal").classList.remove("hidden");
}

function hideEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

async function saveProjectEdit() {
  const name = document.getElementById("edit-name").value.trim();
  const description = document.getElementById("edit-description").value.trim();

  if (!name) {
    alert("Назва проєкту обов'язкова");
    return;
  }

  try {
    await apiRequest(`/projects/${currentEditId}`, "PUT", { name, description });
    alert("✅ Зміни збережено!");
    hideEditModal();
    loadDashboardStats(); // оновлюємо статистику
    loadProjects();
  } catch (error) {
    alert("Не вдалося зберегти зміни");
  }
}