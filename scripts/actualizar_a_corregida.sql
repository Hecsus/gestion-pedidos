-- Consultas para actualizar la base de datos existente
-- Agregar el nuevo valor 'cancelado' en el ENUM de pedidos.estado
ALTER TABLE pedidos
  MODIFY estado ENUM('recibido','en_proceso','terminado','entregado','cancelado') DEFAULT 'recibido';

-- Asignar 'recibido' a pedidos que tengan estado vacío
UPDATE pedidos SET estado = 'recibido' WHERE estado = '' OR estado IS NULL;
