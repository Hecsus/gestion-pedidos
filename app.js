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
const db = require("./config/db")

// 🏗️ Crear aplicación Express
const app = express()
const server = http.createServer(app)
const io = new Server(server)
// Mapa para llevar registro de usuarios conectados
const onlineUsers = new Set()
const onlineAdmins = new Set()

// Limitador de peticiones para rutas sensibles
const { authLimiter } = require("./middlewares/rateLimiter")

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

// Contar mensajes de soporte sin leer para clientes
app.use(async (req, res, next) => {
  res.locals.mensajesSinLeer = 0
  if (req.session.usuario && req.session.usuario.rol === 'cliente') {
    try {
      const userId = req.session.usuario.id
      const lastRead = req.session.ultimaLecturaSoporte || 0
      const [rows] = await db.query(
        `SELECT COUNT(*) AS sin_leer
           FROM mensajes_soporte
          WHERE usuario_id = ?
            AND emisor_rol = 'admin'
            AND id > ?`,
        [userId, lastRead],
      )
      res.locals.mensajesSinLeer = rows[0].sin_leer
    } catch (err) {
      console.error('❌ Error contando mensajes sin leer:', err)
    }
  }
  next()
})

// 🛠️ Middlewares básicos de Express
app.use(logger("dev")) // Log de peticiones HTTP
app.use(express.json()) // Parsear JSON en el body
// Usar extended:true para permitir estructuras anidadas en formularios
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser()) // Parsear cookies
app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
)

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
  let roomUserId = socket.handshake.query.roomUserId
  if (!roomUserId || roomUserId === "null") {
    roomUserId = usuario?.id
  }
  if (roomUserId) {
    socket.join(`user_${roomUserId}`)
  }
  console.log("👤 Usuario conectado al chat")

  socket.emit("adminsOnline", onlineAdmins.size)

  if (usuario?.id) {
    onlineUsers.add(usuario.id)
    if (usuario.rol === 'admin') onlineAdmins.add(usuario.id)
    io.emit("userStatus", { userId: usuario.id, rol: usuario.rol, online: true })
    io.emit("adminsOnline", onlineAdmins.size)
  }

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

  socket.on("solicitarEstado", (id) => {
    socket.emit("userStatus", { userId: id, online: onlineUsers.has(Number(id)) })
  })

  socket.on("disconnect", () => {
    if (usuario?.id) {
      onlineUsers.delete(usuario.id)
      if (usuario.rol === 'admin') onlineAdmins.delete(usuario.id)
      io.emit("userStatus", { userId: usuario.id, rol: usuario.rol, online: false })
      io.emit("adminsOnline", onlineAdmins.size)
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
