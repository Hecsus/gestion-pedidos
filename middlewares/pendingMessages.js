const db = require('../config/db')

async function pendingMessages(req, res, next) {
  res.locals.pendingChats = 0
  try {
    if (req.session.usuario?.rol === 'admin') {
      const [rows] = await db.query(`
        SELECT usuario_id
        FROM mensajes_soporte
        GROUP BY usuario_id
        HAVING MAX(CASE WHEN emisor_rol='cliente' THEN id ELSE 0 END) > MAX(CASE WHEN emisor_rol='admin' THEN id ELSE 0 END)
      `)
      res.locals.pendingChats = rows.length
    }
  } catch (err) {
    console.error('❌ Error obteniendo mensajes pendientes:', err)
  }
  next()
}

module.exports = pendingMessages
