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
    // Obtener mensajes junto con el nombre del usuario para formatearlos
    const [mensajes] = await db.query(
      `SELECT m.mensaje, m.emisor_rol, m.fecha, u.nombre
        FROM mensajes_soporte m
        JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.usuario_id = ?
        ORDER BY m.fecha ASC`,
      [userId],
    )

    // Formatear la estructura para que coincida con los datos del socket
    const formateados = mensajes.map((m) => ({
      usuario: m.emisor_rol === 'admin' ? 'Soporte' : m.nombre,
      mensaje: m.mensaje,
      rol: m.emisor_rol,
      timestamp: new Date(m.fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

    res.json(formateados)
  } catch (err) {
    console.error("❌ Error obteniendo mensajes:", err)
    res.status(500).json({ error: "Error del servidor" })
  }
})

// Marcar como leídos los mensajes recibidos hasta el momento
router.post("/mensajes/leido", async (req, res) => {
  if (!req.session.usuario)
    return res.status(401).json({ error: "No autenticado" })

  try {
    const userId = req.session.usuario.id
    const [row] = await db.query(
      "SELECT MAX(id) AS lastId FROM mensajes_soporte WHERE usuario_id = ?",
      [userId],
    )
    const lastId = row[0].lastId || req.session.ultimaLecturaSoporte || 0
    req.session.ultimaLecturaSoporte = lastId
    res.cookie("ultimaLecturaSoporte", lastId, { maxAge: 31536000000 })
    res.json({ success: true })
  } catch (err) {
    console.error("❌ Error marcando mensajes como leídos:", err)
    res.status(500).json({ error: "Error del servidor" })
  }
})

module.exports = router;
