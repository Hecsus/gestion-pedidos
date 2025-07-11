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
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "secreto_por_defecto_cambiar",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambiar a true en producción con HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
})
app.use(sessionMiddleware)

// Hacer disponible el usuario en todas las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null
  next()
})

// 🛠️ Middlewares básicos de Express
app.use(logger("dev")) // Log de peticiones HTTP
app.use(express.json()) // Parsear JSON en el body
// Usar extended:true para permitir estructuras anidadas en formularios
app.use(express.urlencoded({ extended: true }))
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
const apiRouter = require("./routes/api")

// 📍 Definir rutas principales
app.use("/", indexRouter) // Página principal
app.use("/auth", authRouter) // Autenticación (login/registro)
app.use("/pedidos", pedidosRouter) // Gestión de pedidos
app.use("/admin", adminRouter) // Panel de administración
app.use("/productos", productosRouter) // Gestión de productos
app.use("/chat", chatRouter) // Chat de soporte
app.use("/api", apiRouter) // Endpoints REST internos

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

// Compartir la sesión con Socket.IO
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next)
})

const chatController = require("./controllers/chatController")

// 💬 Configurar Socket.IO para chat en tiempo real
io.on("connection", (socket) => {
  const usuario = socket.request.session?.usuario
  const roomUserId = socket.handshake.query.roomUserId || usuario?.id
  if (roomUserId) {
    socket.join(`user_${roomUserId}`)
  }
  console.log("👤 Usuario conectado al chat")

  socket.on("mensaje", async (data) => {
    const destino = data.para || roomUserId
    const payload = {
      usuario: usuario?.nombre || "Anónimo",
      mensaje: data.mensaje,
      rol: usuario?.rol || "cliente",
      timestamp: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }

    if (destino) io.to(`user_${destino}`).emit("mensaje", payload)

    if (usuario) {
      chatController.guardarMensaje(destino || usuario.id, data.mensaje, payload.rol)
    }
  })

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
