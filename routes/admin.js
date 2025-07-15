// 👑 Rutas del panel de administración
const express = require("express")
const router = express.Router()
const adminController = require("../controllers/adminController")
const { requireAdmin } = require("../middlewares/auth")

// Todas las rutas requieren permisos de administrador
router.use(requireAdmin)

/**
 * Dashboard principal del admin
 */
router.get("/", adminController.dashboard)

/**
 * Gestión de pedidos
 */
router.get("/pedidos", adminController.pedidos)

/**
 * Cambiar estado de pedido
 */
router.post("/pedidos/:id/estado", adminController.cambiarEstado)

/**
 * Cambiar estado de pago
 */
router.post("/pedidos/:id/pago", adminController.cambiarEstadoPago)

/**
 * Eliminar un pedido
 */
router.post("/pedidos/:id/eliminar", adminController.eliminar) // Borra el pedido y sus detalles

module.exports = router
