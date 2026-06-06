// js/api.js
const BASE_URL = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const apiRequest = async (endpoint, method = "GET", body = null) => {
  const token = getToken();

  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Токен відсутній у localStorage!");
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });

    // Додаємо детальний лог для діагностики
    console.log(`📡 ${method} ${endpoint} → Status: ${res.status}`);

    const data = await res.json().catch(() => ({})); // якщо немає json

    if (!res.ok) {
      console.error("❌ Server error:", data);
      throw new Error(data.message || data.error || `HTTP error! status: ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error(`🚨 Помилка запиту ${endpoint}:`, error);
    throw error;
  }
};