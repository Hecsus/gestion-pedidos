const express = require("express");
const router = express.Router();
const db = require("../config/db");

// API JSON de mensajes de soporte del usuario autenticado
router.get("/mensajes", async (req, res) => {
  if (!req.session.usuario)
    return res.status(401).json({ error: "No autenticado" });

  try {
    const [mensajes] = await db.query(
      "SELECT * FROM mensajes_soporte WHERE usuario_id = ? ORDER BY fecha ASC",
      [req.session.usuario.id]
    );
    res.json(mensajes);
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;
