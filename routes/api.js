const express = require("express");
const router = express.Router();
const db = require("../config/db");

// API JSON de mensajes de soporte del usuario autenticado
router.get('/mensajes/:usuarioId?', async (req, res) => {
  if (!req.session.usuario)
    return res.status(401).json({ error: 'No autenticado' })

  const usuario = req.session.usuario
  const usuarioId = req.params.usuarioId || usuario.id

  if (usuario.rol !== 'admin' && usuarioId != usuario.id) {
    return res.status(403).json({ error: 'Sin permisos' })
  }

  try {
    const [mensajes] = await db.query(
      'SELECT * FROM mensajes_soporte WHERE usuario_id = ? ORDER BY fecha ASC',
      [usuarioId]
    )
    res.json(mensajes)
  } catch (err) {
    console.error('❌ Error obteniendo mensajes:', err)
    res.status(500).json({ error: 'Error del servidor' })
  }
})

module.exports = router;
