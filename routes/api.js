const express = require("express");
const router = express.Router();
const db = require("../config/db");

// API JSON de mensajes de soporte del usuario autenticado
router.get("/mensajes", async (req, res) => {
  if (!req.session.usuario)
    return res.status(401).json({ error: "No autenticado" })

  try {
    let userId = req.session.usuario.id
    if (req.session.usuario.rol === "admin" && req.query.usuario_id) {
      userId = req.query.usuario_id
    }
    const [mensajes] = await db.query(
      "SELECT * FROM mensajes_soporte WHERE usuario_id = ? ORDER BY fecha ASC",
      [userId],
    )
    res.json(mensajes)
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err)
    res.status(500).json({ error: "Error del servidor" })
  }
})

module.exports = router;
