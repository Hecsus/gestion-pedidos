// 📦 Rutas de gestión de productos
const express = require("express")
const router = express.Router()
const productosController = require("../controllers/productosController")
const { requireAdmin } = require("../middlewares/auth")
const { body } = require("express-validator")

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
router.post(
  "/crear",
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("precio").isFloat({ gt: 0 }).withMessage("Precio inválido"),
    body("stock").optional().isInt({ min: 0 }).toInt(),
    body("descripcion").optional().trim().escape(),
  ],
  productosController.crear,
)

/**
 * Formulario para editar producto
 */
router.get("/:id/editar", productosController.mostrarFormularioEditar)

/**
 * Procesar actualización de producto
 */
router.post(
  "/:id/editar",
  [
    body("nombre").trim().notEmpty().withMessage("El nombre es obligatorio"),
    body("precio").isFloat({ gt: 0 }).withMessage("Precio inválido"),
    body("stock").optional().isInt({ min: 0 }).toInt(),
    body("descripcion").optional().trim().escape(),
  ],
  productosController.actualizar,
)

/**
 * Eliminar producto
 */
router.post(
  "/:id/eliminar",
  [body("_csrf").exists()],
  productosController.eliminar,
)

module.exports = router
