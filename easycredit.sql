-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-03-2024 a las 22:59:45
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `easycredit`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registers`
--

CREATE TABLE `registers` (
  `id` int(11) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` text NOT NULL,
  `email` text NOT NULL,
  `numero_identidad` text NOT NULL,
  `numero_telefono` text NOT NULL,
  `estado` tinyint(1) NOT NULL,
  `flag` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registers`
--

INSERT INTO `registers` (`id`, `username`, `password`, `email`, `numero_identidad`, `numero_telefono`, `estado`, `flag`) VALUES
(896421, 'sebxstt', '$2b$10$5xCpxjlrKikxLDk2d4p6buqvOh6ZH1TCZVtw58ih5vzap1UzXSrWu', 'sebastiangarces152@gmail.com', '$2b$10$gMSET4f.V/3JRBBAez30Du1eQChiOSg6cBr/pRUtDL.4ddbJoLFPG', '$2b$10$h5oZWByUe/WCtWQDCqBgo.JvcB.OSDTqBmlOqqzgvPpTpFQ6RX0si', 1, '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `words`
--

CREATE TABLE `words` (
  `word` text NOT NULL,
  `es` text NOT NULL,
  `en` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `words`
--

INSERT INTO `words` (`word`, `es`, `en`) VALUES
('article_1_description', 'Realiza todos los trámites y gestiones de tu crédito libre inversión de manera conveniente y segura a través de nuestro proceso 100% en línea. Desde la solicitud hasta la aprobación, te ofrecemos una experiencia eficiente y sin complicaciones.', 'Carry out all the procedures and procedures for your free investment credit in a convenient and secure manner through our 100% online process. From application to approval, we offer you an efficient and hassle-free experience.'),
('article_1_titulo', 'Proceso 100% en linea', '100% online process'),
('article_2_description', 'Utiliza nuestra herramienta de simulación para calcular la cuota de tu crédito libre inversión. Personaliza las condiciones según tus necesidades financieras, incluyendo montos, plazos y tasas de interés, y obtén un plan de pagos transparente y adaptado a ti.', 'Use our simulation tool to calculate the quota of your free investment credit. Customize the conditions according to your financial needs, including amounts, terms and interest rates, and get a transparent payment plan adapted to you.'),
('article_2_titulo', 'Calcula tu cuota', 'Calculate your fee'),
('article_3_description', 'Adaptamos el plazo de pago de tu crédito a tus necesidades financieras. Ofrecemos flexibilidad en los términos, permitiéndote ajustar el período de amortización según tus circunstancias. Así, puedes planificar tus pagos de manera conveniente y mantener el control de tus finanzas.', 'We adapt the payment term of your credit to your financial needs. We offer flexibility in terms, allowing you to adjust the repayment period according to your circumstances. This way, you can plan your payments conveniently and maintain control of your finances.'),
('article_3_titulo', 'Plazo de pago flexible', 'Flexible payment term'),
('article_4_description', 'Obtén estabilidad financiera con nuestra tasa de interés y cuotas fijas. Conoce de antemano el costo total de tu préstamo y planifica tus pagos con seguridad. Nuestra transparencia y predictibilidad te brindan la tranquilidad que necesitas para tomar decisiones informadas sobre tu crédito libre inversión.', 'Obtain financial stability with our fixed interest rate and installments. Know in advance the total cost of your loan and plan your payments safely. Our transparency and predictability give you the peace of mind you need to make informed decisions about your free credit investment.'),
('article_4_titulo', 'Tasa y cuota fijas', 'Fixed rate and fee'),
('descripcion_inicio', 'Explora las posibilidades con nuestro simulador de crédito. Calcula las cuotas y diseña tu plan de pago en línea de manera conveniente y sin complicaciones.', 'Explore the possibilities with our credit simulator. Calculate installments and design your payment plan online in a convenient and hassle-free way.'),
('iniciar_text', 'Iniciar sesión', 'Sign In'),
('item_1_inicio', 'Proceso 100% en linea', '100% online process'),
('item_2_inicio', 'Calcula tu cuota', 'Calculate your fee'),
('item_3_inicio', 'Plazo de pago flexible', 'Flexible payment term'),
('item_4_inicio', 'Tasa y cuota fijas', 'Fixed rate and fee'),
('nombre_inicio', 'EasyCredit', 'EasyCredit'),
('registrarse_text', 'Sign Up', 'Registrarse'),
('rights_footer', '© 2024 EasyCredit™. Todos los derechos reservados.', '© 2024 EasyCredit™. All Rights Reserved.'),
('titulo_inicio', 'Simulador de crédito', 'Credit simulator');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `registers`
--
ALTER TABLE `registers`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `UNIQUE` (`email`,`numero_identidad`,`numero_telefono`) USING HASH;

--
-- Indices de la tabla `words`
--
ALTER TABLE `words`
  ADD PRIMARY KEY (`word`(700)) USING BTREE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
