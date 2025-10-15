// 📦 Controlador de productos
const db = require("../config/db")

/**
 * Listar todos los productos (admin)
 */
exports.listar = async (req, res) => {
  try {
    // Usar created_at que existe en usuarios, no fecha_creacion
    const [productos] = await db.query("SELECT *, id as fecha_creacion FROM productos ORDER BY id DESC")

    // Convertir precios y stock a números
    const productosFormateados = productos.map((producto) => ({
      ...producto,
      precio: Number(producto.precio) || 0,
      stock: Number(producto.stock) || 0,
    }))

    res.render("productos/lista", {
      title: "Gestión de Productos",
      productos: productosFormateados,
      usuario: req.session.usuario,
      query: req.query,
    })
  } catch (error) {
    console.error("❌ Error al obtener productos:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar los productos",
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Mostrar formulario para crear producto
 */
exports.mostrarFormularioCrear = (req, res) => {
  res.render("productos/form", {
    title: "Nuevo Producto",
    producto: {},
    accion: "crear",
    usuario: req.session.usuario,
  })
}

/**
 * Crear nuevo producto
 */
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock } = req.body

    // Validaciones básicas
    if (!nombre || !precio) {
      throw new Error("Nombre y precio son obligatorios")
    }

    if (precio <= 0) {
      throw new Error("El precio debe ser mayor a 0")
    }

    await db.query("INSERT INTO productos (nombre, descripcion, precio, stock) VALUES (?, ?, ?, ?)", [
      nombre,
      descripcion || null,
      Number.parseFloat(precio),
      Number.parseInt(stock) || 0,
    ])

    console.log(`✅ Producto creado: ${nombre}`)
    res.redirect("/productos?success=created")
  } catch (error) {
    console.error("❌ Error al crear producto:", error)
    res.render("productos/form", {
      title: "Nuevo Producto",
      producto: req.body,
      accion: "crear",
      usuario: req.session.usuario,
      error: error.message,
    })
  }
}

/**
 * Mostrar formulario para editar producto
 */
exports.mostrarFormularioEditar = async (req, res) => {
  try {
    const { id } = req.params
    const [productos] = await db.query("SELECT * FROM productos WHERE id = ?", [id])

    if (productos.length === 0) {
      return res.status(404).render("error", {
        title: "Producto no encontrado",
        message: "El producto solicitado no existe",
        error: { status: 404 },
        usuario: req.session.usuario,
      })
    }

    // Convertir precio a número
    const producto = productos[0]
    producto.precio = Number(producto.precio) || 0
    producto.stock = Number(producto.stock) || 0

    res.render("productos/form", {
      title: "Editar Producto",
      producto: producto,
      accion: "editar",
      usuario: req.session.usuario,
    })
  } catch (error) {
    console.error("❌ Error al obtener producto:", error)
    res.render("error", {
      title: "Error",
      message: "Error al cargar el producto",
      error: error,
      usuario: req.session.usuario,
    })
  }
}

/**
 * Actualizar producto existente
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio, stock } = req.body

    // Validaciones básicas
    if (!nombre || !precio) {
      throw new Error("Nombre y precio son obligatorios")
    }

    if (precio <= 0) {
      throw new Error("El precio debe ser mayor a 0")
    }

    await db.query("UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ? WHERE id = ?", [
      nombre,
      descripcion || null,
      Number.parseFloat(precio),
      Number.parseInt(stock) || 0,
      id,
    ])

    console.log(`✅ Producto actualizado: ${nombre} (ID: ${id})`)
    res.redirect("/productos?success=updated")
  } catch (error) {
    console.error("❌ Error al actualizar producto:", error)

    // Recargar formulario con error
    const [productos] = await db.query("SELECT * FROM productos WHERE id = ?", [req.params.id])

    res.render("productos/form", {
      title: "Editar Producto",
      producto: productos[0] || req.body,
      accion: "editar",
      usuario: req.session.usuario,
      error: error.message,
    })
  }
}

/**
 * Eliminar producto
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params

    // Verificar si el producto tiene pedidos asociados
    const [pedidosAsociados] = await db.query("SELECT COUNT(*) as total FROM detalle_pedido WHERE producto_id = ?", [
      id,
    ])

    if (pedidosAsociados[0].total > 0) {
      return res.redirect("/productos?error=cannot_delete_with_orders")
    } else {
      // Si no tiene pedidos, eliminar completamente
      await db.query("DELETE FROM productos WHERE id = ?", [id])
      console.log(`✅ Producto eliminado: ID ${id}`)
    }

    res.redirect("/productos?success=deleted")
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error)
    res.redirect("/productos?error=delete_failed")
  }
}
