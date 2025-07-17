// 🔐 Rutas de autenticación
const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const authController = require("../controllers/authController")
const rateLimiter = require("../middlewares/rateLimiter")

/**
 * Rutas de registro
 */
router.get("/register", authController.mostrarRegistro)
router.post(
  "/register",
  rateLimiter,
  [
    body("nombre").trim().isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres"),
    body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol").optional().isIn(["cliente", "admin"]).withMessage("Rol no válido"),
  ],
  authController.procesarRegistro,
)

/**
 * Rutas de login
 */
router.get("/login", authController.mostrarLogin)
router.post(
  "/login",
  rateLimiter,
  [
    body("email").isEmail().normalizeEmail().withMessage("Debe ser un email válido"),
    body("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
  authController.procesarLogin,
)

/**
 * Ruta de logout
 */
router.get("/logout", authController.logout)

module.exports = router
