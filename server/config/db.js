// server/config/db.js
const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });   // ← важливо: вказуємо шлях явно

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

console.log('📌 DB Config loaded with database:', process.env.DB_NAME);
console.log('📌 DB Host:', process.env.DB_HOST);

// Тест підключення до бази
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Помилка підключення до PostgreSQL:', err.message);
    } else {
        console.log('✅ PostgreSQL підключено успішно! Час сервера:', res.rows[0].now);
    }
});

module.exports = pool;