-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 21-07-2025 a las 02:26:48
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_pedidos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`) VALUES
(4, 3, 4, 1, 1800.00),
(5, 4, 5, 3, 200.00),
(7, 6, 4, 4, 1800.00),
(8, 6, 1, 6, 500.00),
(9, 7, 8, 2, 50.00),
(24, 10, 5, 1, 200.00),
(25, 10, 3, 2, 2500.00),
(26, 10, 2, 3, 1200.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes_soporte`
--

CREATE TABLE `mensajes_soporte` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `emisor_rol` enum('cliente','admin') NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes_soporte`
--

INSERT INTO `mensajes_soporte` (`id`, `usuario_id`, `emisor_rol`, `mensaje`, `fecha`) VALUES
(5, 8, 'cliente', 'hola', '2025-07-11 01:45:41'),
(7, 8, 'admin', 'hol pepita', '2025-07-13 16:33:21'),
(8, 8, 'admin', '654', '2025-07-13 16:33:33'),
(9, 8, 'cliente', 'quiro cancelar un pedido', '2025-07-13 16:34:36'),
(10, 8, 'cliente', 'dfhd', '2025-07-13 16:35:02'),
(11, 8, 'cliente', 'fwefwe', '2025-07-13 22:43:15'),
(12, 8, 'cliente', 'werwer', '2025-07-13 22:43:16'),
(13, 8, 'cliente', '4556h', '2025-07-13 22:43:18'),
(14, 8, 'admin', 'sgrg', '2025-07-13 22:45:22'),
(15, 8, 'admin', 'gyhutgy', '2025-07-13 22:45:24'),
(18, 10, 'cliente', 'asfds', '2025-07-17 22:17:15'),
(19, 10, 'cliente', 'gryery', '2025-07-17 22:17:17'),
(20, 10, 'cliente', 'afafg', '2025-07-17 22:18:01'),
(21, 10, 'admin', 'sdgsdg', '2025-07-17 22:18:31'),
(22, 10, 'admin', 'edgdhg', '2025-07-17 22:18:34'),
(23, 8, 'admin', 'dsdg', '2025-07-17 22:20:00'),
(24, 10, 'admin', 'setstg', '2025-07-17 22:21:25'),
(25, 10, 'admin', 'yuo', '2025-07-17 22:21:36'),
(26, 8, 'admin', 'uoup', '2025-07-17 22:21:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `estado` enum('recibido','en_proceso','terminado','entregado') DEFAULT 'recibido',
  `pago_estado` varchar(50) DEFAULT 'Sin liquidar',
  `total` decimal(10,2) DEFAULT 0.00,
  `fecha_pedido` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `estado`, `pago_estado`, `total`, `fecha_pedido`) VALUES
(3, 8, '', 'Pagado', 1800.00, '2025-07-11 01:07:40'),
(4, 8, 'en_proceso', 'Pagado parcial', 600.00, '2025-07-11 01:36:37'),
(6, 8, 'terminado', 'Pagado parcial', 10200.00, '2025-07-11 01:43:14'),
(7, 8, 'entregado', 'Pagado', 100.00, '2025-07-13 22:42:26'),
(10, 10, '', 'Sin liquidar', 8800.00, '2025-07-17 22:16:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `stock` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `stock`) VALUES
(1, 'Diseño de Logo', 'Diseño profesional de logotipo corporativo', 500.00, 91),
(2, 'Página Web Básica', 'Desarrollo de sitio web responsive básico', 1200.00, 42),
(3, 'Página Web Avanzada', 'Desarrollo de sitio web con funcionalidades avanzadas', 2500.00, 20),
(4, 'Branding Completo', 'Paquete completo de identidad corporativa', 1800.00, 22),
(5, 'Mantenimiento Web', 'Mantenimiento mensual de sitio web', 200.00, 187),
(8, 'Tarjetas de Visita', 'Diseño e impresión de tarjetas de presentación', 50.00, 983),
(10, 'Flyer Publicitario', 'Diseño de flyer para promociones', 80.00, 100),
(11, 'qweqwr', 'erfwsfsgrsg', 2342.00, 200);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','cliente') DEFAULT 'cliente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `rol`, `created_at`) VALUES
(7, 'Pepito', 'pepito@email.com', '$2b$12$ZlfI9TYlyor3GQvsu77BoOCuA/E.P.6ERQ.en3/smil23skSVLxbW', 'admin', '2025-07-10 16:17:02'),
(8, 'pepita', 'pepita@email.com', '$2b$12$VevT2iy4vkeSAcnzn2Hg0uYL04dfMND5oJ/DF5YZcoCufZHuF3Zu2', 'cliente', '2025-07-10 16:18:22'),
(10, 'uno', 'uno@email.com', '$2a$10$t1h7u3zeumKyieJgXYI25.b2FSkSQ7l7a5An8/RbBEEx9/yKBBbI2', 'cliente', '2025-07-17 22:16:29'),
(11, 'una', 'una@email.com', '$2a$10$ZLMke1JSQYbpy1QI2yAYuO9K5.q6NwXBrcpM8.UVUGOeXQdpwg34W', 'admin', '2025-07-17 22:20:54');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `mensajes_soporte`
--
ALTER TABLE `mensajes_soporte`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `mensajes_soporte`
--
ALTER TABLE `mensajes_soporte`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `mensajes_soporte`
--
ALTER TABLE `mensajes_soporte`
  ADD CONSTRAINT `mensajes_soporte_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
