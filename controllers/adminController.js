// 👑 Controlador del panel de administración
const db = require("../config/db")

/**
 * Dashboard principal del administrador
 */
exports.dashboard = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM pedidos) as total_pedidos,
        (SELECT COUNT(*) FROM usuarios WHERE rol = 'cliente') as total_clientes,
        (SELECT COUNT(*) FROM productos) as total_productos,
        (SELECT COALESCE(SUM(total), 0) FROM pedidos WHERE estado = 'entregado') as ingresos_totales
    `)

    // Obtener pedidos recientes (ajustado a tu estructura de BD)
    const [pedidosRecientes] = await db.query(`
      SELECT
        p.id,
        p.total,
        p.estado,
        p.pago_estado AS estado_pago,
        p.fecha_pedido,
        u.nombre as cliente_nombre,
        u.email as cliente_email
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.fecha_pedido DESC
      LIMIT 10
    `)

    // Asegurar que los valores sean números
    const statsData = stats[0]
    statsData.total_pedidos = Number(statsData.total_pedidos) || 0
    statsData.total_clientes = Number(statsData.total_clientes) || 0
    statsData.total_productos = Number(statsData.total_productos) || 0
    statsData.ingresos_totales = Number(statsData.ingresos_totales) || 0

    res.render("admin/dashboard", {
      title: "Panel de Administración",
      stats: statsData,
      pedidosRecientes,
      usuario: req.session.usuario,
    })
  } catch (error) {
    console.error("❌ Error en dashboard admin:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar el dashboard",
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Gestión de pedidos - Lista completa
 */
exports.pedidos = async (req, res) => {
  try {
    const [pedidos] = await db.query(`
      SELECT 
        p.id,
        p.total,
        p.estado,
        p.pago_estado AS estado_pago,
        p.fecha_pedido,
        u.nombre as cliente_nombre,
        u.email as cliente_email,
        COUNT(dp.id) as total_productos
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
      GROUP BY p.id
      ORDER BY p.fecha_pedido DESC
    `)

    const pedidosFormateados = pedidos.map((p) => ({
      ...p,
      total: Number(p.total) || 0,
      estado_pago: p.estado_pago,
    }))

    res.render("admin/pedidos", {
      title: "Gestión de Pedidos",
      pedidos: pedidosFormateados,
      usuario: req.session.usuario,
      query: req.query,
    })
  } catch (error) {
    console.error("❌ Error al obtener pedidos:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar los pedidos",
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Cambiar estado de un pedido
 */
exports.cambiarEstado = async (req, res) => {
  try {
    const { id } = req.params
    const { estado } = req.body

    const estadosValidos = ["recibido", "en_proceso", "terminado", "entregado", "cancelado"]

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: "Estado no válido" })
    }

    await db.query("UPDATE pedidos SET estado = ? WHERE id = ?", [estado, id])

    console.log(`✅ Estado del pedido ${id} cambiado a: ${estado}`)
    res.redirect("/admin/pedidos?success=estado_actualizado")
  } catch (error) {
    console.error("❌ Error al cambiar estado:", error)
    res.redirect("/admin/pedidos?error=estado_no_actualizado")
  }
}

/**
 * Cambiar estado de pago de un pedido
 */
exports.cambiarEstadoPago = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_pago } = req.body

    const estadosValidos = ["Sin liquidar", "Pagado parcial", "Pagado"]

    if (!estadosValidos.includes(estado_pago)) {
      return res.status(400).json({ error: "Estado de pago no válido" })
    }

    await db.query("UPDATE pedidos SET pago_estado = ? WHERE id = ?", [estado_pago, id])

    console.log(`✅ Estado de pago del pedido ${id} cambiado a: ${estado_pago}`)
    res.redirect("/admin/pedidos?success=pago_actualizado")
  } catch (error) {
    console.error("❌ Error al cambiar estado de pago:", error)
    res.redirect("/admin/pedidos?error=pago_no_actualizado")
  }
}

/**
 * Ver detalle completo de un pedido
 */
exports.verDetalle = async (req, res) => {
  try {
    const { id } = req.params

    const [pedido] = await db.query(
      `
      SELECT p.*, u.nombre as cliente_nombre, u.email as cliente_email
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ?
    `,
      [id],
    )

    if (pedido.length === 0) {
      return res.status(404).render('error', {
        title: 'Pedido no encontrado',
        message: 'El pedido solicitado no existe',
        error: { status: 404 },
        usuario: req.session.usuario,
      })
    }

    const [detalles] = await db.query(
      `
      SELECT dp.*, pr.nombre as producto_nombre, pr.descripcion as producto_descripcion
      FROM detalle_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = ?
    `,
      [id],
    )

    const pedidoFormateado = {
      ...pedido[0],
      total: Number(pedido[0].total) || 0,
    }

    const detallesFormateados = detalles.map((d) => ({
      ...d,
      precio_unitario: Number(d.precio_unitario) || 0,
    }))

    res.render('admin/pedido_detalle', {
      title: `Pedido #${id}`,
      pedido: pedidoFormateado,
      detalles: detallesFormateados,
      usuario: req.session.usuario,
      query: req.query,
    })
  } catch (error) {
    console.error('❌ Error al obtener detalle del pedido:', error)
    res.render('error', {
      title: 'Error',
      message: 'Error al cargar el pedido',
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Eliminar un pedido y sus detalles
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params
    // Borrar primero los detalles para mantener la integridad referencial
    await db.query('DELETE FROM detalle_pedido WHERE pedido_id = ?', [id])
    await db.query('DELETE FROM pedidos WHERE id = ?', [id])

    console.log(`✅ Pedido ${id} eliminado`)
    res.redirect('/admin/pedidos?success=eliminado')
  } catch (error) {
    console.error('❌ Error al eliminar pedido:', error)
    res.redirect('/admin/pedidos?error=no_eliminado')
  }
}
