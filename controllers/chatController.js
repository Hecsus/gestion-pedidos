const db = require('../config/db');

exports.renderChat = async (req, res) => {
  const usuario = req.session.usuario;
  if (!usuario) return res.redirect('/auth/login');

  if (usuario.rol === 'admin') {
    const [clientes] = await db.query(
      `SELECT u.id, u.nombre,
        SUM(CASE WHEN m.leido_admin = 0 AND m.emisor_rol='cliente' THEN 1 ELSE 0 END) AS pendientes
       FROM usuarios u
       LEFT JOIN mensajes_soporte m ON u.id = m.usuario_id
       WHERE u.rol='cliente'
       GROUP BY u.id
       ORDER BY pendientes DESC, u.nombre`
    );

    const clienteId = req.query.usuario || (clientes[0] ? clientes[0].id : null);
    let mensajes = [];
    if (clienteId) {
      [mensajes] = await db.query(
        'SELECT * FROM mensajes_soporte WHERE usuario_id = ? ORDER BY fecha ASC',
        [clienteId]
      );
      await db.query(
        "UPDATE mensajes_soporte SET leido_admin = 1 WHERE usuario_id = ? AND emisor_rol='cliente'",
        [clienteId]
      );
    }

    return res.render('chat/chatAdmin', {
      title: 'Soporte - Admin',
      usuario,
      clientes,
      clienteId,
      mensajes,
    });
  }

  const [mensajes] = await db.query(
    'SELECT * FROM mensajes_soporte WHERE usuario_id = ? ORDER BY fecha ASC',
    [usuario.id]
  );
  await db.query(
    "UPDATE mensajes_soporte SET leido_cliente = 1 WHERE usuario_id = ? AND emisor_rol='admin'",
    [usuario.id]
  );

  res.render('chat/chat', {
    title: 'Chat de Soporte',
    usuario,
    mensajes,
  });
};

exports.guardarMensaje = async (usuarioId, mensaje, emisorRol) => {
  try {
    await db.query(
      `INSERT INTO mensajes_soporte (usuario_id, mensaje, emisor_rol, leido_admin, leido_cliente)
       VALUES (?, ?, ?, ?, ?)`,
      [
        usuarioId,
        mensaje,
        emisorRol,
        emisorRol === 'cliente' ? 0 : 1,
        emisorRol === 'cliente' ? 1 : 0,
      ]
    );
  } catch (err) {
    console.error('❌ Error al guardar mensaje:', err);
  }
};
