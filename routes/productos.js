// 📦 Rutas de gestión de productos
const express = require("express")
const router = express.Router()
const productosController = require("../controllers/productosController")
const { requireAdmin } = require("../middlewares/auth")

// Todas las rutas requieren permisos de administrador
router.use(requireAdmin)

/**
 * Listar productos
 */
router.get("/", productosController.listar)

/**
 * Formulario para crear producto
 */
router.get("/crear", productosController.mostrarFormularioCrear)

/**
 * Procesar creación de producto
 */
router.post("/crear", productosController.crear)

/**
 * Formulario para editar producto
 */
router.get("/:id/editar", productosController.mostrarFormularioEditar)

/**
 * Procesar actualización de producto
 */
router.post("/:id/editar", productosController.actualizar)

/**
 * Eliminar producto
 */
router.post("/:id/eliminar", productosController.eliminar)

module.exports = router
