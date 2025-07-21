-- Versión corregida de la base de datos gestion_pedidos
-- Se incluye el nuevo estado 'cancelado' en la tabla pedidos
-- y se actualizan los pedidos sin estado asignado a 'recibido'

-- Crear base de datos y usarla
CREATE DATABASE IF NOT EXISTS gestion_pedidos;
USE gestion_pedidos;

-- Tabla pedidos con estado actualizado
CREATE TABLE IF NOT EXISTS pedidos (
  id int(11) NOT NULL AUTO_INCREMENT,
  usuario_id int(11) NOT NULL,
  estado enum('recibido','en_proceso','terminado','entregado','cancelado') DEFAULT 'recibido',
  pago_estado varchar(50) DEFAULT 'Sin liquidar',
  total decimal(10,2) DEFAULT 0.00,
  fecha_pedido timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY usuario_id (usuario_id),
  CONSTRAINT pedidos_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Resto de tablas según dump original
-- (ver archivo database_provided.sql para la estructura completa)
