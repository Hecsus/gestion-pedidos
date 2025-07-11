// 🛒 Rutas de gestión de pedidos
const express = require("express")
const router = express.Router()
const pedidosController = require("../controllers/pedidosController")
const { requireAuth } = require("../middlewares/auth")

// Todas las rutas requieren autenticación
router.use(requireAuth)

/**
 * Listar pedidos del usuario
 */
router.get("/", pedidosController.listar)

/**
 * Formulario para crear nuevo pedido
 */
router.get("/crear", pedidosController.mostrarFormulario)

/**
 * Procesar creación de pedido
 */
router.post("/crear", pedidosController.crear)

/**
 * Ver detalle de un pedido específico
 */
router.get("/:id", pedidosController.verDetalle)

module.exports = router
