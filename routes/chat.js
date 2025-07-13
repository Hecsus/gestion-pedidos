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
    if (req.query.cliente) {
      const [rows] = await db.query("SELECT id, nombre FROM usuarios WHERE id = ?", [req.query.cliente])
      cliente = rows[0] || null
    } else {
      const [rows] = await db.query("SELECT id, nombre FROM usuarios WHERE rol = 'cliente' ORDER BY nombre")
      clientes = rows
    }
  }
  res.locals.cliente = cliente
  res.locals.clientes = clientes
  chatController.renderChat(req, res)
})

module.exports = router
