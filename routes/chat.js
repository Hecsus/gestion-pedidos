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
  if (req.session.usuario.rol === "admin" && req.query.cliente) {
    const [rows] = await db.query("SELECT id, nombre FROM usuarios WHERE id = ?", [req.query.cliente])
    cliente = rows[0] || null
  }
  res.locals.cliente = cliente
  chatController.renderChat(req, res)
})

module.exports = router
