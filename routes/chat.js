// 💬 Rutas del chat de soporte
const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middlewares/auth")

/**
 * Página del chat (requiere autenticación)
 */
router.get("/", requireAuth, (req, res) => {
  res.render("chat/chat", {
    title: "Chat de Soporte",
    usuario: req.session.usuario,
  })
})

module.exports = router
