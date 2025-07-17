// 🌱 Cargar variables de entorno desde archivo .env
require("dotenv").config()

// 📦 Importar dependencias necesarias
const express = require("express")
const session = require("express-session")
const helmet = require("helmet")
const path = require("path")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const createError = require("http-errors")
const http = require("http")
const { Server } = require("socket.io")
const pendingMessages = require("./middlewares/pendingMessages")

// 🏗️ Crear aplicación Express
const app = express()
const server = http.createServer(app)
const io = new Server(server)

// 🛡️ Añadir cabeceras de seguridad por defecto
app.use(helmet())

// 💾 Guardar instancia de Socket.IO en la app para usarla en otros archivos
app.set("io", io)

// 🔒 Configurar middleware de sesiones
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "secreto_por_defecto_cambiar",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Solo cookies seguras en producción
    httpOnly: true, // No accesible desde JS del cliente
    sameSite: "lax", // Protege de CSRF básico
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
  },
})
app.use(sessionMiddleware)

// 🛠️ Middlewares básicos de Express
app.use(logger("dev")) // Log de peticiones HTTP
app.use(express.json()) // Parsear JSON en el body
// Usar extended:true para permitir estructuras anidadas en formularios
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // Parsear cookies
// 🛡️ Protección CSRF
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null
  next()
})
app.use(pendingMessages)

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

// Almacenar usuarios conectados
const onlineUsers = new Map()

// 💬 Configurar Socket.IO para chat en tiempo real
io.on("connection", (socket) => {
  const usuario = socket.request.session?.usuario
  let roomUserId = socket.handshake.query.roomUserId
  if (!roomUserId || roomUserId === "null") {
    roomUserId = usuario?.id
  }
  if (roomUserId) {
    socket.join(`user_${roomUserId}`)
  }

  if (usuario?.id) {
    onlineUsers.set(usuario.id, usuario.rol)
    io.emit("userStatus", { userId: usuario.id, role: usuario.rol, online: true })
    for (const [id, role] of onlineUsers.entries()) {
      if (id !== usuario.id) {
        socket.emit("userStatus", { userId: id, role, online: true })
      }
    }
  }

  console.log("👤 Usuario conectado al chat")

  socket.on("mensaje", async (data) => {
    let destino = data.para
    if (!destino || destino === "null") destino = roomUserId
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

    if (usuario && destino) {
      const userId = parseInt(destino, 10) || usuario.id
      chatController.guardarMensaje(userId, data.mensaje, payload.rol)
    }
  })

  socket.on("getUserStatus", (target) => {
    if (target === "admin") {
      const adminOnline = [...onlineUsers.values()].some((r) => r === "admin")
      socket.emit("userStatus", { userId: "admin", role: "admin", online: adminOnline })
    } else if (target) {
      const id = parseInt(target, 10)
      socket.emit("userStatus", { userId: target, online: onlineUsers.has(id) })
    }
  })

  socket.on("disconnect", () => {
    if (usuario?.id) {
      onlineUsers.delete(usuario.id)
      io.emit("userStatus", { userId: usuario.id, role: usuario.rol, online: false })
    }
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
