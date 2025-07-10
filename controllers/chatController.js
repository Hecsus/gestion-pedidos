const db = require("../config/db")

exports.renderChat = (req, res) => {
  if (!req.session.usuario) return res.redirect("/auth/login")

  res.render("chat/chat", {
    title: "Chat de Soporte",
    usuario: req.session.usuario,
  })
}

exports.guardarMensaje = async (usuario, mensaje, rol) => {
  try {
    await db.query(
      "INSERT INTO mensajes_soporte (usuario_id, mensaje, emisor_rol) VALUES (?, ?, ?)",
      [usuario.id, mensaje, rol],
    )
  } catch (err) {
    console.error("❌ Error al guardar mensaje:", err)
  }
}
