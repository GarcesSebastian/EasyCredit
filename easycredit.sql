-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
<<<<<<< HEAD
-- Tiempo de generación: 16-03-2024 a las 23:17:26
=======
-- Tiempo de generación: 16-03-2024 a las 23:14:09
>>>>>>> 81ce318a7008fd66ea88ba323bc415d51d2d7212
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
-- Estructura de tabla para la tabla `movements`
--

CREATE TABLE `movements` (
  `id_user` int(11) NOT NULL,
  `index_movement` int(11) NOT NULL,
  `tipo_movement` text NOT NULL,
  `fecha_movement` text NOT NULL,
  `action_movement` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `movements`
--

INSERT INTO `movements` (`id_user`, `index_movement`, `tipo_movement`, `fecha_movement`, `action_movement`) VALUES
(444949, 1, 'Bank Loan', '16/03/2024', 50000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id_user` int(11) NOT NULL,
  `name_user` varchar(45) NOT NULL,
  `email_user` text NOT NULL,
  `numero_notifications` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `notifications`
--

INSERT INTO `notifications` (`id_user`, `name_user`, `email_user`, `numero_notifications`) VALUES
(444949, 'Sebxstt', 'sebastiangarces152@gmail.com', 0),
(560951, 'sebastian', 'sebastiangarces158@gmail.com', 0);

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
  `estado` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registers`
--

INSERT INTO `registers` (`id`, `username`, `password`, `email`, `numero_identidad`, `numero_telefono`, `estado`) VALUES
(444949, 'Sebxstt', '$2b$10$IO8wqnvBCnTltDacz9XfIOV4zBx8X.fmv0YlsK5cehQK312glZSyq', 'sebastiangarces152@gmail.com', '$2b$10$bPlfckWqo3IdkTBvbpz1feft6TucaTngfxAAfVQ61ToXYmImOQLdq', '$2b$10$gqvoGR2sFkn8GGr0qaZIVu8/dKyUuyTk3cMXAFRyl00Cz515qCYsy', 1),
(560951, 'sebastian', '$2b$10$80hdef6W/5bfauYIwmIsJuwHGKXzkav.VOKbFTob0eTY9RxWk/oMm', 'sebastiangarces158@gmail.com', '$2b$10$QB1d6BVZ0ZQfLevbdb4tk.TZM5HjllhxAlphT0N/LK/bbleIAPL6i', '$2b$10$A73xf0n4EzaioQGJ9deUxeMCaEcHk/YbV.d2jwuiIT61AJc7.602m', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name_user` varchar(45) NOT NULL,
  `email_user` text NOT NULL,
  `saldo_disponible` int(250) NOT NULL,
  `ingresos_totales` int(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id_user`, `name_user`, `email_user`, `saldo_disponible`, `ingresos_totales`) VALUES
(444949, 'Sebxstt', 'sebastiangarces152@gmail.com', 25000, 25000),
(560951, 'sebastian', 'sebastiangarces158@gmail.com', 0, 0);

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
('agree_text', 'Estoy de acuerdo con el', 'I agree with the'),
('article_1_description', 'Realiza todos los trámites y gestiones de tu crédito libre inversión de manera conveniente y segura a través de nuestro proceso 100% en línea. Desde la solicitud hasta la aprobación, te ofrecemos una experiencia eficiente y sin complicaciones.', 'Carry out all the procedures and procedures for your free investment credit in a convenient and secure manner through our 100% online process. From application to approval, we offer you an efficient and hassle-free experience.'),
('article_1_titulo', 'Proceso 100% en linea', '100% online process'),
('article_2_description', 'Utiliza nuestra herramienta de simulación para calcular la cuota de tu crédito libre inversión. Personaliza las condiciones según tus necesidades financieras, incluyendo montos, plazos y tasas de interés, y obtén un plan de pagos transparente y adaptado a ti.', 'Use our simulation tool to calculate the quota of your free investment credit. Customize the conditions according to your financial needs, including amounts, terms and interest rates, and get a transparent payment plan adapted to you.'),
('article_2_titulo', 'Calcula tu cuota', 'Calculate your fee'),
('article_3_description', 'Adaptamos el plazo de pago de tu crédito a tus necesidades financieras. Ofrecemos flexibilidad en los términos, permitiéndote ajustar el período de amortización según tus circunstancias. Así, puedes planificar tus pagos de manera conveniente y mantener el control de tus finanzas.', 'We adapt the payment term of your credit to your financial needs. We offer flexibility in terms, allowing you to adjust the repayment period according to your circumstances. This way, you can plan your payments conveniently and maintain control of your finances.'),
('article_3_titulo', 'Plazo de pago flexible', 'Flexible payment term'),
('article_4_description', 'Obtén estabilidad financiera con nuestra tasa de interés y cuotas fijas. Conoce de antemano el costo total de tu préstamo y planifica tus pagos con seguridad. Nuestra transparencia y predictibilidad te brindan la tranquilidad que necesitas para tomar decisiones informadas sobre tu crédito libre inversión.', 'Obtain financial stability with our fixed interest rate and installments. Know in advance the total cost of your loan and plan your payments safely. Our transparency and predictability give you the peace of mind you need to make informed decisions about your free credit investment.'),
('article_4_titulo', 'Tasa y cuota fijas', 'Fixed rate and fee'),
('available_balance', 'Saldo disponible', 'Available Balance'),
('calcular_inicio', 'Calcular', 'Calculate'),
('check_card_text', '¡Consulte nuestra opción de simulación de crédito!', 'Check out our credit simulation option!'),
('content_check_card_text', '¿Necesitas calcular tus pagos mensuales de préstamo antes de comprometerte? ¡Estás en el lugar correcto! Con nuestra herramienta de simulación de crédito, puedes explorar diferentes escenarios financieros y planificar tu futuro con confianza.', 'Do you need to calculate your monthly loan payments before committing? You are in the right place! With our credit simulation tool, you can explore different financial scenarios and plan your future with confidence.'),
('content_security_text', '¿Necesitas enviar dinero a amigos o familiares? Con nuestra función de transferencia a otros usuarios, puedes enviar fondos de manera rápida y segura. Ya sea que estés compartiendo gastos, ayudando a un ser querido o simplemente pagando por un servicio, nuestra plataforma te permite realizar transferencias de manera conveniente y sin complicaciones. Olvídate de los largos procesos bancarios y las comisiones excesivas. Con nosotros, enviar dinero es tan fácil como pulsar un botón.', 'Do you need to send money to friends or family? With our transfer feature to other users, you can send funds quickly and securely. Whether you\'re sharing expenses, helping a loved one, or simply paying for a service, our platform allows you to make transfers conveniently and without complications. Forget about long banking processes and excessive commissions. With us, sending money is as easy as pressing a button.'),
('continue_with_text', 'O CONTINUAR CON', 'OR CONTINUE WITH'),
('crear_cuenta_text', 'Crea una cuenta', 'Create an account'),
('descripcion_inicio', 'Explora las posibilidades con nuestro simulador de crédito. Calcula las cuotas y diseña tu plan de pago en línea de manera conveniente y sin complicaciones.', 'Explore the possibilities with our credit simulator. Calculate installments and design your payment plan online in a convenient and hassle-free way.'),
('email_text', 'Correo electrónico', 'Email'),
('exists_text', 'Ya tienes una cuenta?', 'Already have an account?'),
('first_loan_text', 'primer préstamo', 'first loan'),
('first_part_make_loan', '¿Eres nuevo? ¿Quieres hacer tu ', 'Are you new? Would you like to make your '),
('forgot_password_text', '¿Olvidaste tu contraseña?', 'Forgot your password?'),
('have_you_text', 'Tienes', 'You have'),
('history_movements_text', 'Historial de movimientos', 'History Movements'),
('id_number_text', 'Número de identificación', 'ID number'),
('iniciar_text', 'Iniciar sesión', 'Sign In'),
('learn_more_text', 'Aprende Más', 'Learn More'),
('legal_footer_titulo', 'Legal', 'Legal'),
('legal_item_1', 'Política de Privacidad', 'Privacy Policy'),
('legal_item_2', 'Términos y Condiciones', 'Terms & Conditions'),
('make_loan_text', 'Hacer préstamo', 'Make loan'),
('more_text', 'Más', 'More'),
('new_notifications_text', 'nuevas notificaciones', 'new notifications'),
('new_text', 'Nuevo', 'New'),
('nombre_inicio', 'EasyCredit', 'EasyCredit'),
('not_found_text', 'Movimientos históricos no encontrados', 'Not Found History Movements'),
('password_text', 'Contraseña', 'Password'),
('phone_text', 'Número de teléfono', 'Phone number'),
('please_enter_text', 'Por favor ingresa aquí', 'Please enter here'),
('recursos_footer_titulo', 'Recursos', 'Resources'),
('recursos_item_1', 'Astro', 'Astro'),
('recursos_item_2', 'Tailwind CSS', 'Tailwind CSS'),
('recursos_item_3', 'NodeJS', 'NodeJS'),
('recursos_item_4', 'ExpressJS', 'ExpressJS'),
('registrarse_text', 'Registrarse', 'Sign Up'),
('registrarse_with_google', 'Inicia sesión con Google', 'Sign in with Google'),
('rights_footer', 'Todos los derechos reservados.', 'All Rights Reserved.'),
('security_text', '¡Transfiere fondos a otros usuarios de manera rápida y segura!', 'Transfer funds to other users quickly and securely!'),
('siganos_footer_titulo', 'Síganos', 'Follow us'),
('siganos_item_1', 'Github', 'Github'),
('siganos_item_2', 'Linkedin', 'Linkedin'),
('simulate_loan_text', 'Simular Préstamo', 'Simulate Loan'),
('titulo_inicio', 'Simulador de crédito', 'Credit simulator'),
('total_income_text', 'Ingresos totales', 'Total Income'),
('transferir_text', 'Transferir', 'Transfer'),
('username_text', 'Nombre de usuario', 'Username'),
('view_all_text', 'Ver todo', 'View all'),
('welcome_back_text', 'Bienvenido de nuevo ', 'Welcome back ');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email_no_repeat` (`email_user`) USING HASH;

--
-- Indices de la tabla `registers`
--
ALTER TABLE `registers`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `UNIQUE` (`email`,`numero_identidad`,`numero_telefono`) USING HASH;

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email_no_repeat` (`email_user`) USING HASH;

--
-- Indices de la tabla `words`
--
ALTER TABLE `words`
  ADD PRIMARY KEY (`word`(700)) USING BTREE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
