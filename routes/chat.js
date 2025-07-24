// 💬 Rutas del chat de soporte
const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middlewares/auth")
const db = require("../config/db")
const chatController = require("../controllers/chatController")

/**
 * Página del chat (requiere autenticación)
 */
router.get("/", requireAuth, async (req, res) => {
  let cliente = null
  let clientes = []
  if (req.session.usuario.rol === "admin") {
    const [rows] = await db.query(
      `SELECT u.id, u.nombre,
        (SELECT COUNT(*) FROM mensajes_soporte m
           WHERE m.usuario_id = u.id AND m.emisor_rol = 'cliente'
             AND m.id > COALESCE((SELECT MAX(id) FROM mensajes_soporte
                                  WHERE usuario_id = u.id AND emisor_rol = 'admin'),0)
        ) AS sin_leer
       FROM usuarios u
       WHERE u.rol = 'cliente'
       ORDER BY u.nombre`
    )
    clientes = rows
    if (req.query.cliente) {
      cliente = clientes.find((c) => c.id == req.query.cliente) || null
    }
  }

  res.locals.cliente = cliente
  res.locals.clientes = clientes
  chatController.renderChat(req, res)
})

module.exports = router
