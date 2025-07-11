-- 🗄️ Script para crear la base de datos y tablas necesarias
-- Ejecutar este script en MySQL para configurar la base de datos

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS gestion_pedidos;
USE gestion_pedidos;

-- 👥 Tabla de usuarios (clientes y administradores)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol ENUM('cliente', 'admin') DEFAULT 'cliente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📦 Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🛒 Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente', 'procesando', 'completado', 'cancelado') DEFAULT 'pendiente',
    estado_pago ENUM('pendiente', 'pagado', 'reembolsado') DEFAULT 'pendiente',
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 📋 Tabla de detalles de pedidos (productos en cada pedido)
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- 💬 Tabla de mensajes de chat/soporte
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 🌱 Insertar datos de ejemplo

-- Insertar usuario administrador por defecto si no existe
INSERT IGNORE INTO usuarios (nombre, email, password, rol) VALUES 
('Administrador Sistema', 'admin@ejemplo.com', '$2a$10$rHqQqKvtF.8E5aBWQZBpKOXOGYd8W8nQQGvz8W8nQQGvz8W8nQQGv', 'admin');

-- Actualizar stock de productos que tienen 0
UPDATE productos SET stock = 25 WHERE stock = 0;

-- Actualizar productos existentes para que estén activos
UPDATE productos SET activo = TRUE WHERE activo IS NULL;

-- Productos de ejemplo
INSERT IGNORE INTO productos (nombre, descripcion, precio, stock) VALUES 
('Laptop Gaming', 'Laptop para gaming con RTX 4060', 1299.99, 10),
('Mouse Inalámbrico', 'Mouse ergonómico inalámbrico', 29.99, 50),
('Teclado Mecánico', 'Teclado mecánico RGB', 89.99, 25),
('Monitor 4K', 'Monitor 27 pulgadas 4K', 399.99, 15),
('Auriculares Gaming', 'Auriculares con micrófono', 79.99, 30);

-- Verificar estructura de tablas
SELECT 'Verificación completada - Base de datos lista para usar' as status;
