// js/auth.js
const login = async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Будь ласка, заповніть усі поля");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || data.error || "Невірний email або пароль");
    }
  } catch (error) {
    console.error(error);
    alert("Помилка з'єднання з сервером");
  }
};

// Функція для Register буде нижче
const register = async () => {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!name || !email || !password) {
    alert("Будь ласка, заповніть усі поля");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Реєстрація успішна! Тепер увійдіть.");
      window.location.href = "login.html";
    } else {
      alert(data.message || data.error || "Помилка реєстрації");
    }
  } catch (error) {
    alert("Помилка з'єднання з сервером");
  }
};