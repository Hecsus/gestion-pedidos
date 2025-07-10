// 💬 Rutas del chat de soporte
const express = require("express")
const router = express.Router()
const { requireAuth } = require("../middlewares/auth")
const chatController = require("../controllers/chatController")

/**
 * Página del chat (requiere autenticación)
 */
router.get("/", requireAuth, chatController.renderChat)

module.exports = router
