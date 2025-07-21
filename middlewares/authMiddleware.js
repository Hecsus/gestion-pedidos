// middlewares/authMiddleware.js

exports.verificarSesion = (req, res, next) => {
  if (!req.session.usuario) return res.redirect("/auth/login");
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.usuario || req.session.usuario.rol !== "admin") {
    return res.status(403).send("Acceso denegado");
  }
  next();
};
