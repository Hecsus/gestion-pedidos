const db = require("../config/db")
const bcrypt = require("bcryptjs")
const { validationResult } = require("express-validator")

/**
 * Mostrar formulario de login
 */
exports.mostrarLogin = (req, res) => {
  res.render("auth/login", {
    title: "Iniciar Sesión",
    errors: [],
    oldData: {},
    usuario: req.session.usuario || null,
  })
}

/**
 * Mostrar formulario de registro
 */
exports.mostrarRegistro = (req, res) => {
  res.render("auth/register", {
    title: "Registro de Usuario",
    errors: [],
    oldData: {},
    usuario: req.session.usuario || null,
  })
}

/**
 * Procesar registro de nuevo usuario
 */
exports.procesarRegistro = async (req, res) => {
  const errors = validationResult(req)
  const { nombre, email, password, rol, admin_password } = req.body

  // Si hay errores de validación, mostrar formulario con errores
  if (!errors.isEmpty()) {
    return res.render("auth/register", {
      title: "Registro de Usuario",
      errors: errors.array(),
      oldData: req.body,
      usuario: req.session.usuario || null,
    })
  }

  // Validar contraseña de administrador si se intenta crear un admin
  if (rol === "admin") {
    if (!admin_password || admin_password !== "4dm1n") {
      return res.render("auth/register", {
        title: "Registro de Usuario",
        errors: [{ msg: "Contraseña de administrador incorrecta" }],
        oldData: req.body,
        usuario: req.session.usuario || null,
      })
    }
  }

  try {
    // Verificar si el email ya existe
    const [existingUser] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email])

    if (existingUser.length > 0) {
      return res.render("auth/register", {
        title: "Registro de Usuario",
        errors: [{ msg: "Este email ya está registrado" }],
        oldData: req.body,
        usuario: req.session.usuario || null,
      })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insertar nuevo usuario
    await db.query("INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)", [
      nombre,
      email,
      hashedPassword,
      rol || "cliente",
    ])

    console.log(`✅ Usuario registrado: ${email} (${rol || "cliente"})`)
    res.redirect("/auth/login?registered=true")
  } catch (error) {
    console.error("❌ Error en registro:", error)
    res.render("auth/register", {
      title: "Registro de Usuario",
      errors: [{ msg: "Error interno del servidor" }],
      oldData: req.body,
      usuario: req.session.usuario || null,
    })
  }
}

/**
 * Procesar login de usuario
 */
exports.procesarLogin = async (req, res) => {
  const errors = validationResult(req)
  const { email, password } = req.body

  // Si hay errores de validación
  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      title: "Iniciar Sesión",
      errors: errors.array(),
      oldData: req.body,
      usuario: req.session.usuario || null,
    })
  }

  try {
    // Buscar usuario por email
    const [usuarios] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email])

    // Verificar si existe el usuario y la contraseña es correcta
    if (usuarios.length === 0 || !(await bcrypt.compare(password, usuarios[0].password))) {
      return res.render("auth/login", {
        title: "Iniciar Sesión",
        errors: [{ msg: "Email o contraseña incorrectos" }],
        oldData: { email },
        usuario: req.session.usuario || null,
      })
    }

    // Guardar usuario en sesión (sin la contraseña)
    const usuario = usuarios[0]
    delete usuario.password
    req.session.usuario = usuario

    console.log(`✅ Usuario logueado: ${email} (${usuario.rol})`)

    // Redirigir a la página que intentaba acceder o al dashboard
    const redirectTo = req.session.redirectTo || (usuario.rol === "admin" ? "/admin" : "/pedidos")
    delete req.session.redirectTo

    res.redirect(redirectTo)
  } catch (error) {
    console.error("❌ Error en login:", error)
    res.render("auth/login", {
      title: "Iniciar Sesión",
      errors: [{ msg: "Error interno del servidor" }],
      oldData: { email },
      usuario: req.session.usuario || null,
    })
  }
}

/**
 * Cerrar sesión
 */
exports.logout = (req, res) => {
  const usuario = req.session.usuario
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Error al cerrar sesión:", err)
    } else {
      console.log(`✅ Sesión cerrada: ${usuario?.email || "usuario"}`)
    }
    res.redirect("/")
  })
}
