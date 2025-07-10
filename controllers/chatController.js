const db = require("../config/db");

exports.vistaChat = (req, res) => {
  const usuario = req.session.usuario;
  if (!usuario) return res.redirect("/auth/login");

  exports.renderChat = (req, res) => {
    if (!req.session.usuario) return res.redirect("/auth/login");

    res.render("chat/chat", {
      usuario: req.session.usuario,
      title: "Soporte en línea",
    });
  };
  exports.guardarMensaje = (usuario, mensaje, rol) => {
    db.query(
      "INSERT INTO mensajes_soporte (usuario_id, mensaje, emisor_rol) VALUES (?, ?, ?)",
      [usuario.id, mensaje, rol],
      (err) => {
        if (err) console.error("❌ Error al guardar mensaje:", err);
      }
    );
  };
};
