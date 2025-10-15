// 🗄️ Configuración de conexión a base de datos MySQL
const mysql = require("mysql2/promise")
require("dotenv").config()

// 🏗️ Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gestion_pedidos",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
})

// 🧪 Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexión a MySQL establecida correctamente")
    console.log(`📊 Base de datos: ${process.env.DB_NAME}`)
    connection.release()
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message)
    console.error("🔧 Verifica que MySQL esté ejecutándose y las credenciales sean correctas")
  }
}

// Probar conexión al iniciar
testConnection()

module.exports = pool
