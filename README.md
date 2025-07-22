# Gestión de Pedidos

Este proyecto es una aplicación web de ejemplo desarrollada con **Node.js**, **Express**, **EJS** y **MySQL**. Permite gestionar usuarios, productos y pedidos, además de contar con un chat de soporte en tiempo real usando **Socket.IO**. A continuación se describe de forma detallada la estructura del repositorio y la funcionalidad de cada archivo.

## Tabla de contenido

- [Instalación](#instalación)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Descripción de archivos](#descripción-de-archivos)
  - [Archivos de configuración](#archivos-de-configuración)
  - [Aplicación principal](#aplicación-principal)
  - [Carpeta `controllers`](#carpeta-controllers)
  - [Carpeta `middlewares`](#carpeta-middlewares)
  - [Carpeta `routes`](#carpeta-routes)
  - [Carpeta `views`](#carpeta-views)
  - [Carpeta `public`](#carpeta-public)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Base de datos](#base-de-datos)

## Instalación

1. Clonar el repositorio.
2. Ejecutar `npm install` para instalar las dependencias.
3. Crear un archivo `.env` con la configuración de la base de datos y la clave de sesión.
4. Iniciar la aplicación con `npm start` o `npm run dev` (usa `nodemon`).

## Estructura del proyecto

```
.
├── app.js             # Aplicación principal de Express
├── bin/
│   └── www            # Ejemplo de inicialización con Socket.IO
├── config/
│   └── db.js          # Conexión a MySQL
├── controllers/       # Controladores para cada sección
├── middlewares/       # Middlewares de autenticación
├── public/            # Archivos estáticos (CSS)
├── routes/            # Definición de rutas
├── views/             # Plantillas EJS
├── package.json       # Dependencias y scripts
└── README.md          # Documentación (este archivo)
```

## Descripción de archivos

### Archivos de configuración

- **`config/db.js`**  
  Crea un *pool* de conexiones a MySQL usando variables de entorno (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`). Incluye una función `testConnection` para comprobar la conexión al iniciar la aplicación.

- **`.env`** (no incluido en el repositorio)  
  Debe contener las variables de entorno necesarias: datos de la base de datos, puerto y `SESSION_SECRET`.

### Aplicación principal

- **`app.js`**  
  Archivo principal que configura Express. Carga las variables de entorno con `dotenv`, aplica middlewares básicos (`morgan`, `cookie-parser`, `express.json`, `express.urlencoded`) y protege la aplicación con `helmet` y `express-rate-limit`.
  Administra sesiones con `express-session` y sirve archivos estáticos desde `public/`.
  Configura EJS como motor de plantillas y define las rutas principales importando los routers de la carpeta `routes`.  
  También inicializa un servidor HTTP con Socket.IO para el chat de soporte, compartiendo la sesión con los sockets. Maneja los eventos de conexión, recepción de mensajes y desconexión.  
  Finalmente levanta el servidor en el puerto especificado y exporta la instancia de Express.

- **`bin/www`**  
  Alternativa de arranque del servidor (usado comúnmente por `express-generator`). Obtiene la instancia de `io` desde `app.js` y define el comportamiento del chat cuando un usuario se conecta. Actualmente se incluye solo como referencia.

### Carpeta `controllers`

Contiene la lógica de negocio para cada módulo de la aplicación:

- **`adminController.js`** – Maneja el panel de administración.  
  - `dashboard` obtiene estadísticas generales (cantidad de pedidos, clientes, productos e ingresos totales) y las muestra en `views/admin/dashboard.ejs`.  
  - `pedidos` lista todos los pedidos con información del cliente y número de productos.  
  - `cambiarEstado` y `cambiarEstadoPago` actualizan el estado de un pedido o el estado de pago respectivamente.
  - `verDetalle` muestra toda la información de un pedido para administradores.
  - `eliminar` borra un pedido y sus detalles asociados.

- **`authController.js`** – Gestión de autenticación.  
  - `mostrarLogin` y `mostrarRegistro` renderizan los formularios de inicio de sesión y registro.  
  - `procesarRegistro` valida y crea un nuevo usuario (puede ser administrador si se proporciona la contraseña de administrador).  
  - `procesarLogin` verifica las credenciales y almacena los datos del usuario en la sesión.  
  - `logout` destruye la sesión y redirige a la página principal.

- **`chatController.js`** – Lógica del chat de soporte.  
  - `renderChat` muestra la vista del chat.  
  - `guardarMensaje` persiste cada mensaje en la tabla `mensajes_soporte` indicando quién lo envió (rol).

- **`pedidosController.js`** – Operaciones de pedidos para el usuario autenticado.  
  - `listar` obtiene todos los pedidos del usuario junto con un resumen de productos.  
  - `mostrarFormulario` presenta el formulario para crear un nuevo pedido, listando los productos disponibles.  
  - `crear` valida los productos seleccionados, crea el pedido y actualiza el stock dentro de una transacción MySQL.  
  - `verDetalle` muestra toda la información de un pedido específico.  
  - `cancelar` cambia el estado del pedido a `cancelado`.

- **`productosController.js`** – CRUD de productos (solo admins).  
  - `listar` muestra todos los productos.  
  - `mostrarFormularioCrear` y `mostrarFormularioEditar` renderizan el formulario correspondiente.  
  - `crear`, `actualizar` y `eliminar` realizan las operaciones en la base de datos validando la información enviada.

### Carpeta `middlewares`

Define funciones para proteger rutas:

- **`auth.js`**  
  - `requireAuth` verifica si el usuario está autenticado.  
  - `requireAdmin` exige que el usuario tenga rol `admin`.  
  - `requireClient` comprueba que el usuario sea un cliente.

- **`authMiddleware.js`**, **`verificarAdmin.js`**, **`verificarSesion.js`**  
  Middlewares más simples (en algunos casos redundantes) que realizan comprobaciones básicas de sesión y rol. Se conservan para compatibilidad con algunas rutas.

### Carpeta `routes`

Cada router agrupa las rutas según su funcionalidad:

- **`index.js`** – Página principal y redirección al dashboard dependiendo del rol del usuario.  
- **`auth.js`** – Registra y autentica usuarios usando validaciones con `express-validator`.  
- **`pedidos.js`** – Rutas de pedidos; todas requieren estar autenticado (`requireAuth`).  
- **`admin.js`** – Panel de administración; todas las rutas usan `requireAdmin` para asegurar que solo los administradores puedan acceder.  
- **`productos.js`** – CRUD de productos restringido a administradores.  
- **`chat.js`** – Muestra la vista del chat y, si el usuario es admin, permite seleccionar el cliente a consultar.  
- **`api.js`** – Devuelve un listado en JSON de mensajes del chat para el usuario autenticado (o el usuario indicado si es admin).

### Carpeta `views`

Contiene las plantillas EJS. Entre ellas:

- **`layout.ejs`** – Plantilla base con la estructura HTML principal.  
- **`index.ejs`**, **`error.ejs`** – Página de inicio y plantilla para errores.  
- **`auth/`** – Formularios de login y registro.  
- **`admin/`** – Dashboard, listado de pedidos, detalle de pedidos y formularios de productos para el panel de administración.
- **`pedidos/`** – Listado, creación y detalle de pedidos para el usuario.  
- **`productos/`** – Formularios y listados de productos.  
- **`chat/`** – Interfaz del chat de soporte.  
- **`partials/`** – Cabecera, pie y elementos comunes incluidos en otras vistas.

### Carpeta `public`

- **`public/css/style.css`** – Hojas de estilo principales que definen los colores y aspectos de toda la aplicación.
- **`public/stylesheets/style.css`** – Archivo creado por la plantilla inicial de Express, se mantiene para compatibilidad.

## Variables de entorno

El proyecto espera un archivo `.env` con al menos las siguientes variables:

```
PORT=3000
SESSION_SECRET=tu_clave_de_sesion
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=gestion_pedidos
```

## Scripts disponibles

- `npm start` – Ejecuta `node app.js` para iniciar el servidor.
- `npm run dev` – Utiliza `nodemon` para reiniciar el servidor en desarrollo.

## Base de datos

Se utiliza MySQL. Las tablas esperadas son:

- `usuarios` – Información básica del usuario (`nombre`, `email`, `password`, `rol`).
- `productos` – Productos disponibles (nombre, descripción, precio y stock).
- `pedidos` – Cabecera de cada pedido con total y estado.
- `detalle_pedido` – Detalle de productos incluidos en un pedido.
- `mensajes_soporte` – Historial de mensajes del chat de soporte.

Cada controlador asume que estas tablas existen con los campos utilizados en las consultas SQL.

---

Este README resume de forma detallada la funcionalidad de cada carpeta y archivo. Revisa el código fuente para más información específica sobre cada implementación.

### Cambios recientes

- Añadida vista de detalle de pedidos para administradores (`views/admin/pedido_detalle.ejs`).
- Se añadió ruta y controlador `verDetalle` para acceder a dicha vista.
- La gestión de pedidos ahora muestra indicadores de color en los select de estado y pago y solo mantiene un botón de eliminación por pedido.
- Correcciones en el cambio de estado de pedidos cancelados y mejora en las insignias de estado/pago del detalle para mostrar texto explicativo.
- Se corrigió la vista de detalle para mostrar correctamente el estado y pago
  alineando los colores con la gestión de pedidos.
- Se añadió el estado **cancelado** con un estilo rojo a rayas y se actualizó la
  base de datos. Nuevos scripts en `scripts/` permiten recrear y actualizar la
  base de datos existente.
- Se añadieron los middlewares de seguridad `helmet` y `express-rate-limit`.
  Ahora las rutas de autenticación están protegidas ante abusos y se aplican
  cabeceras HTTP seguras. Además se corrige el texto del estado en el
  dashboard cuando un pedido carece de valor.
- Los selectores de estado y pago muestran cada opción con su color correspondiente
  para facilitar la identificación antes de elegir un valor. Se corrigen también
  las insignias de estado en el dashboard para mantener los mismos colores.
- El chat de soporte ahora indica si un cliente está conectado, permite seleccionar
cualquier cliente en todo momento y muestra cuántos mensajes quedan pendientes de atender por cada uno.
- Eliminado el borde lateral de las alertas de éxito y error.
- La página de error mantiene ahora la cabecera y pie de la aplicación.
- Arreglado el doble footer en el detalle de pedidos del cliente.
- El chat de clientes informa si hay administradores conectados y muestra un aviso al recibir respuesta.
- La portada se adapta al rol del usuario mostrando botones coherentes y el enlace
  a soporte para clientes incluye un indicador de mensajes sin leer.
- El limitador de peticiones solo afecta ahora a las rutas de inicio de sesión y
  registro para evitar bloqueos tras cerrar sesión.
- Además, los inicios de sesión correctos ya no cuentan para el límite de
  intentos, evitando bloqueos al cambiar de cuenta.
- Se corrige la columna de estado en el dashboard eliminando espacios y unificando
  los colores con la gestión de pedidos.
- El indicador de mensajes pendientes usa la última visita al chat y se limpia la
  cookie de sesión al cerrar sesión mostrando un aviso con SweetAlert.
- La portada muestra opciones adaptadas: los clientes no ven el control de inventario
  y los administradores disponen de un mensaje para ayudar a los usuarios.
- Los títulos de cada página ahora muestran correctamente el nombre de la vista.
- El limitador de peticiones se trasladó a un middleware y vuelve a funcionar
  para los formularios de login y registro.
- El dashboard administra los ingresos totales de forma precisa y muestra
  decimales.
- La página principal centra las tarjetas informativas cuando solo hay dos
  disponibles.
- Los estados de los pedidos recientes en el dashboard muestran el texto y los
  colores coherentes con la gestión de pedidos.
- Los intentos fallidos de autenticación devuelven ahora códigos de estado
  adecuados para que el limitador de peticiones funcione correctamente.
- Al cancelar un pedido se solicita confirmación con un mensaje más descriptivo.
- El cálculo de ingresos en el dashboard considera los pedidos cuyo pago está
  registrado como pagado o pagado parcial.
- Al iniciar sesión se marca como leída la conversación de soporte para que el
  contador de mensajes muestre únicamente los nuevos.
- Se ajustó la insignia de estado en los pedidos recientes del dashboard para
  usar el mismo formato que en la gestión de pedidos.
- La insignia del chat vuelve a mostrar cuántos mensajes de soporte quedan por
  leer y se actualiza automáticamente al recibirlos.
- Se corrige la columna de estado de los pedidos recientes en el dashboard para
  garantizar que siempre muestre texto y colores coherentes.

