// 🔒 Middlewares de autenticación y autorización

/**
 * Verificar si el usuario está autenticado
 * Redirige al login si no hay sesión activa
 */
function requireAuth(req, res, next) {
  if (!req.session.usuario) {
    req.session.redirectTo = req.originalUrl // Guardar URL para redirigir después del login
    return res.redirect("/auth/login")
  }
  next()
}

/**
 * Verificar si el usuario es administrador
 * Devuelve error 403 si no es admin
 */
function requireAdmin(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/auth/login")
  }

  if (req.session.usuario.rol !== "admin") {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "No tienes permisos para acceder a esta página",
      error: { status: 403 },
      usuario: req.session.usuario,
    })
  }

  next()
}

/**
 * Verificar si el usuario es cliente
 * Útil para rutas específicas de clientes
 */
function requireClient(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect("/auth/login")
  }

  if (req.session.usuario.rol !== "cliente") {
    return res.status(403).render("error", {
      title: "Acceso Denegado",
      message: "Esta página es solo para clientes",
      error: { status: 403 },
      usuario: req.session.usuario,
    })
  }

  next()
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireClient,
}
