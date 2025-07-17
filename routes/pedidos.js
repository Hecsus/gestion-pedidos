// 🛒 Rutas de gestión de pedidos
const express = require("express")
const router = express.Router()
const pedidosController = require("../controllers/pedidosController")
const { requireAuth } = require("../middlewares/auth")
const { body, param } = require("express-validator")

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
router.post(
  "/crear",
  [
    body("productos").isArray({ min: 1 }),
    body("productos.*.id").isInt(),
    body("productos.*.cantidad").isInt({ gt: 0 }),
  ],
  pedidosController.crear,
)

/**
 * Ver detalle de un pedido específico
 */
router.get("/:id", [param("id").isInt()], pedidosController.verDetalle)

/** Cancelar pedido */
router.post(
  "/:id/cancelar",
  [param("id").isInt()],
  pedidosController.cancelar,
)

module.exports = router
