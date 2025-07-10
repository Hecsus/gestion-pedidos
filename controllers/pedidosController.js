const db = require("../config/db")

// 🛒 Controlador de pedidos

/**
 * Listar pedidos del usuario autenticado
 */
exports.listar = async (req, res) => {
  try {
    const usuarioId = req.session.usuario.id

    // Obtener pedidos con detalles (ajustado a tu estructura)
    const [pedidos] = await db.query(
      `
      SELECT 
        p.id,
        p.total,
        p.estado,
        p.pago_estado,
        p.fecha_pedido,
        COUNT(dp.id) as total_productos
      FROM pedidos p
      LEFT JOIN detalle_pedido dp ON p.id = dp.pedido_id
      WHERE p.usuario_id = ?
      GROUP BY p.id
      ORDER BY p.fecha_pedido DESC
    `,
      [usuarioId],
    )

    // Convertir totales a números
    const pedidosFormateados = pedidos.map((pedido) => ({
      ...pedido,
      total: Number(pedido.total) || 0,
    }))

    res.render("pedidos/lista", {
      title: "Mis Pedidos",
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
 * Mostrar formulario para crear nuevo pedido
 */
exports.mostrarFormulario = async (req, res) => {
  try {
    // Obtener productos disponibles con stock > 0
    const [productos] = await db.query("SELECT * FROM productos WHERE stock > 0 ORDER BY nombre")

    // Convertir precios y stock a números
    const productosFormateados = productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio) || 0,
      stock: Number(producto.stock) || 0,
    }))

    res.render("pedidos/crear", {
      title: "Nuevo Pedido",
      productos: productosFormateados,
      usuario: req.session.usuario,
    })
  } catch (error) {
    console.error("❌ Error al cargar productos:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar el formulario",
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Crear nuevo pedido
 */
exports.crear = async (req, res) => {
  const connection = await db.getConnection()

  try {
    await connection.beginTransaction()

    const usuarioId = req.session.usuario.id
    const { productos } = req.body // Array de {id, cantidad}

    if (!productos || productos.length === 0) {
      throw new Error("Debe seleccionar al menos un producto")
    }

    let total = 0
    const detallesPedido = []

    // Validar productos y calcular total
    for (const item of productos) {
      if (!item.id || !item.cantidad || item.cantidad <= 0) {
        continue // Saltar productos sin cantidad
      }

      const [producto] = await connection.query("SELECT * FROM productos WHERE id = ?", [item.id])

      if (producto.length === 0) {
        throw new Error(`Producto con ID ${item.id} no encontrado`)
      }

      const prod = producto[0]
      const precio = Number(prod.precio) || 0
      const stock = Number(prod.stock) || 0

      if (stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${prod.nombre}. Disponible: ${stock}`)
      }

      const subtotal = precio * item.cantidad
      total += subtotal

      detallesPedido.push({
        producto_id: prod.id,
        cantidad: item.cantidad,
        precio_unitario: precio,
      })
    }

    if (detallesPedido.length === 0) {
      throw new Error("Debe seleccionar al menos un producto con cantidad válida")
    }

    // Crear pedido
    const [resultPedido] = await connection.query("INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)", [
      usuarioId,
      total,
    ])

    const pedidoId = resultPedido.insertId

    // Insertar detalles y actualizar stock
    for (const detalle of detallesPedido) {
      await connection.query(
        "INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [pedidoId, detalle.producto_id, detalle.cantidad, detalle.precio_unitario],
      )

      await connection.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [
        detalle.cantidad,
        detalle.producto_id,
      ])
    }

    await connection.commit()
    console.log(`✅ Pedido creado: ID ${pedidoId}, Total: €${total}`)

    res.redirect("/pedidos?success=created")
  } catch (error) {
    await connection.rollback()
    console.error("❌ Error al crear pedido:", error)

    // Recargar formulario con error
    const [productos] = await db.query("SELECT * FROM productos WHERE stock > 0 ORDER BY nombre")
    const productosFormateados = productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio) || 0,
      stock: Number(producto.stock) || 0,
    }))

    res.render("pedidos/crear", {
      title: "Nuevo Pedido",
      productos: productosFormateados,
      usuario: req.session.usuario,
      error: error.message,
    })
  } finally {
    connection.release()
  }
}

/**
 * Ver detalles de un pedido específico
 */
exports.verDetalle = async (req, res) => {
  try {
    const pedidoId = req.params.id
    const usuarioId = req.session.usuario.id

    // Obtener pedido con detalles
    const [pedido] = await db.query(
      `
      SELECT 
        p.*,
        u.nombre as cliente_nombre,
        u.email as cliente_email
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = ? AND p.usuario_id = ?
    `,
      [pedidoId, usuarioId],
    )

    if (pedido.length === 0) {
      return res.status(404).render("error", {
        title: "Pedido no encontrado",
        message: "El pedido solicitado no existe o no tienes permisos para verlo",
        error: { status: 404 },
        usuario: req.session.usuario,
      })
    }

    // Obtener detalles del pedido
    const [detalles] = await db.query(
      `
      SELECT 
        dp.*,
        pr.nombre as producto_nombre,
        pr.descripcion as producto_descripcion
      FROM detalle_pedido dp
      JOIN productos pr ON dp.producto_id = pr.id
      WHERE dp.pedido_id = ?
    `,
      [pedidoId],
    )

    // Convertir precios a números
    const pedidoFormateado = {
      ...pedido[0],
      total: Number(pedido[0].total) || 0,
    }

    const detallesFormateados = detalles.map((detalle) => ({
      ...detalle,
      precio_unitario: Number(detalle.precio_unitario) || 0,
    }))

    res.render("pedidos/detalle", {
      title: `Pedido #${pedidoId}`,
      pedido: pedidoFormateado,
      detalles: detallesFormateados,
      usuario: req.session.usuario,
    })
  } catch (error) {
    console.error("❌ Error al obtener detalle del pedido:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar el pedido",
      error: error,
      usuario: req.session.usuario,
    })
  }
}
