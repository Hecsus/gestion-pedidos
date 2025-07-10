// 🌱 Cargar variables de entorno desde archivo .env
require("dotenv").config()

// 📦 Importar dependencias necesarias
const express = require("express")
const session = require("express-session")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const createError = require("http-errors")
const http = require("http")
const { Server } = require("socket.io")

// 🏗️ Crear aplicación Express
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// 💾 Guardar instancia de Socket.IO en la app para usarla en otros archivos
app.set("io", io)

// 🔒 Configurar middleware de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto_por_defecto_cambiar",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Cambiar a true en producción con HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }),
)

// 🛠️ Middlewares básicos de Express
app.use(logger("dev")) // Log de peticiones HTTP
app.use(express.json()) // Parsear JSON en el body
app.use(express.urlencoded({ extended: false })) // Parsear formularios
app.use(cookieParser()) // Parsear cookies

// 🌐 Servir archivos estáticos (CSS, JS, imágenes) - IMPORTANTE: antes de las rutas
app.use(express.static(path.join(__dirname, "public")))

// 🎨 Configurar motor de plantillas EJS
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// 🛣️ Importar y configurar rutas
const indexRouter = require("./routes/index")
const authRouter = require("./routes/auth")
const pedidosRouter = require("./routes/pedidos")
const adminRouter = require("./routes/admin")
const productosRouter = require("./routes/productos")
const chatRouter = require("./routes/chat")

// 📍 Definir rutas principales
app.use("/", indexRouter) // Página principal
app.use("/auth", authRouter) // Autenticación (login/registro)
app.use("/pedidos", pedidosRouter) // Gestión de pedidos
app.use("/admin", adminRouter) // Panel de administración
app.use("/productos", productosRouter) // Gestión de productos
app.use("/chat", chatRouter) // Chat de soporte

// ❌ Manejar rutas no encontradas (404)
app.use((req, res, next) => {
  next(createError(404))
})

// 💥 Manejador de errores global
app.use((err, req, res, next) => {
  // Solo mostrar stack trace en desarrollo
  const error = req.app.get("env") === "development" ? err : {}

  res.status(err.status || 500)
  res.render("error", {
    title: "Error",
    message: err.message,
    error: error,
    usuario: req.session.usuario || null,
  })
})

// 💬 Configurar Socket.IO para chat en tiempo real
io.on("connection", (socket) => {
  console.log("👤 Usuario conectado al chat")

  // Escuchar mensajes del cliente
  socket.on("mensaje", (data) => {
    console.log(`💬 Mensaje recibido de ${data.usuario}: ${data.mensaje}`)

    // Reenviar mensaje a todos los usuarios conectados
    io.emit("mensaje", {
      usuario: data.usuario || "Anónimo",
      mensaje: data.mensaje,
      rol: data.rol || "cliente",
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    })
  })

  // Manejar desconexión
  socket.on("disconnect", () => {
    console.log("👤 Usuario desconectado del chat")
  })
})

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`)
  console.log(`📊 Entorno: ${process.env.NODE_ENV || "development"}`)
  console.log(`🗄️ Base de datos: ${process.env.DB_NAME}@${process.env.DB_HOST}`)
  console.log(`📁 Archivos estáticos: ${path.join(__dirname, "public")}`)
})

module.exports = app
