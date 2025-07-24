// 🏠 Rutas principales de la aplicación
const express = require("express")
const router = express.Router()

/**
 * Página principal / landing page
 */
router.get("/", (req, res) => {
  res.render("index", {
    title: "Inicio",
    usuario: req.session.usuario || null,
  })
})

/**
 * Dashboard general (redirige según el rol del usuario)
 */
router.get("/dashboard", (req, res) => {
  if (!req.session.usuario) {
    return res.redirect("/auth/login")
  }

  // Redirigir según el rol
  if (req.session.usuario.rol === "admin") {
    res.redirect("/admin")
  } else {
    res.redirect("/pedidos")
  }
})

module.exports = router
