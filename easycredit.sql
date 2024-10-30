-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-05-2024 a las 01:37:41
-- Versión del servidor: 10.4.27-MariaDB
-- Versión de PHP: 8.0.25

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
-- Estructura de tabla para la tabla `codes`
--

CREATE TABLE `codes` (
  `email` text NOT NULL,
  `code` text NOT NULL,
  `type` text NOT NULL,
  `action` int(11) NOT NULL,
  `used` longtext NOT NULL,
  `expired` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `codes`
--

INSERT INTO `codes` (`email`, `code`, `type`, `action`, `used`, `expired`) VALUES
('easycredit4321@gmail.com', '3DFW8H', 'promotion', 1200000, '', 'Sun May 16 2024 20:10:00 GMT-0500 (hora estándar de Colombia)');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `history_2fa`
--

CREATE TABLE `history_2fa` (
  `id_user` int(11) NOT NULL,
  `device` text NOT NULL,
  `country` text NOT NULL,
  `date` text NOT NULL,
  `type` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movements`
--

CREATE TABLE `movements` (
  `id_movement` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `origin` text NOT NULL,
  `index_movement` int(11) NOT NULL,
  `tipo_movement` text NOT NULL,
  `fecha_movement` text NOT NULL,
  `action_movement` text NOT NULL,
  `state_movement` text NOT NULL,
  `message` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--

CREATE TABLE `notifications` (
  `id_notification` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `origin` text NOT NULL,
  `index_notification` int(11) NOT NULL,
  `tipo_notification` text NOT NULL,
  `fecha_notification` text NOT NULL,
  `action_notification` text NOT NULL,
  `state_notification` text NOT NULL,
  `message` text NOT NULL,
  `isActive` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id_loan` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `name_loan` text NOT NULL,
  `numero_telefono_loan` text NOT NULL,
  `tasa_interes` double NOT NULL,
  `cuotas` int(11) NOT NULL,
  `frecuencia_pago` text NOT NULL,
  `action_prestamo` text NOT NULL,
  `tasa_variable` tinyint(1) NOT NULL,
  `tasa_fija` tinyint(1) NOT NULL,
  `fecha` text NOT NULL,
  `fecha_next` text NOT NULL,
  `excedent_now` text NOT NULL,
  `simulate` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `fecha_creacion` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `name_user` varchar(45) NOT NULL,
  `email_user` text NOT NULL,
  `number_card` text NOT NULL,
  `ingresos_totales` text NOT NULL,
  `saldo_disponible` text NOT NULL,
  `fecha_update` text NOT NULL,
  `fecha_activity` text NOT NULL,
  `image_profile` longtext NOT NULL,
  `history_credit` int(11) NOT NULL,
  `limit_prestamo` int(11) NOT NULL,
  `limit_monto` text NOT NULL,
  `discount_tasa` double NOT NULL,
  `state_prestamo` int(11) NOT NULL,
  `level_account` int(11) NOT NULL,
  `multiplier` int(11) NOT NULL,
  `ingreso_mensual` text NOT NULL,
  `devices` longtext NOT NULL,
  `is2fa` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
('active_2fa_text', 'Activar la autenticación de dos pasos', 'Activate Two-Step Authentication'),
('agree_text', 'Estoy de acuerdo con los', 'I agree with the'),
('amount_text', 'Monto', 'Amount'),
('article_1_description', 'Realiza todos los trámites y gestiones de tu crédito libre inversión de manera conveniente y segura a través de nuestro proceso 100% en línea. Desde la solicitud hasta la aprobación, te ofrecemos una experiencia eficiente y sin complicaciones.', 'Carry out all the procedures and procedures for your free investment credit in a convenient and secure manner through our 100% online process. From application to approval, we offer you an efficient and hassle-free experience.'),
('article_1_titulo', 'Proceso 100% en linea', '100% online process'),
('article_2_description', 'Utiliza nuestra herramienta de simulación para calcular la cuota de tu crédito libre inversión. Personaliza las condiciones según tus necesidades financieras, incluyendo montos, plazos y tasas de interés, y obtén un plan de pagos transparente y adaptado a ti.', 'Use our simulation tool to calculate the quota of your free investment credit. Customize the conditions according to your financial needs, including amounts, terms and interest rates, and get a transparent payment plan adapted to you.'),
('article_2_titulo', 'Calcula tu cuota', 'Calculate your fee'),
('article_3_description', 'Adaptamos el plazo de pago de tu crédito a tus necesidades financieras. Ofrecemos flexibilidad en los términos, permitiéndote ajustar el período de amortización según tus circunstancias. Así, puedes planificar tus pagos de manera conveniente y mantener el control de tus finanzas.', 'We adapt the payment term of your credit to your financial needs. We offer flexibility in terms, allowing you to adjust the repayment period according to your circumstances. This way, you can plan your payments conveniently and maintain control of your finances.'),
('article_3_titulo', 'Plazo de pago flexible', 'Flexible payment term'),
('article_4_description', 'Obtén estabilidad financiera con nuestra tasa de interés y cuotas fijas. Conoce de antemano el costo total de tu préstamo y planifica tus pagos con seguridad. Nuestra transparencia y predictibilidad te brindan la tranquilidad que necesitas para tomar decisiones informadas sobre tu crédito libre inversión.', 'Obtain financial stability with our fixed interest rate and installments. Know in advance the total cost of your loan and plan your payments safely. Our transparency and predictability give you the peace of mind you need to make informed decisions about your free credit investment.'),
('article_4_titulo', 'Tasa y cuota fijas', 'Fixed rate and fee'),
('available_balance', 'Saldo disponible', 'Available Balance'),
('balance_avaible_is_text', 'El saldo disponible es de', 'The available balance is'),
('bill_text', 'factura', 'bill'),
('calcular_inicio', 'Calcular', 'Calculate'),
('calculate_cuotas_text', 'Calcular Pago', 'Calculate Payment'),
('change_password_text', 'Cambiar la contraseña', 'Change password'),
('check_card_text', '¡Consulte nuestra opción de simulación de crédito!', 'Check out our credit simulation option!'),
('check_card_text_second', '¡Consulte nuestra opción de simulación de crédito!', 'Check out our credit simulation option!'),
('clear_all_text', 'Borrar todo', 'Clear all'),
('clear_text', 'Borrar', 'Clear'),
('code_auth_text', 'Autenticación de código', 'Code Authentication'),
('configure_2fa_text', 'Configurar la autenticación de dos pasos', 'Configure Two-Step Authentication'),
('consent_text', 'Consentimiento para el uso de datos', 'Consent for data use'),
('content_check_card_text', '¿Necesitas calcular tus pagos mensuales de préstamo antes de comprometerte? ¡Estás en el lugar correcto! Con nuestra herramienta de simulación de crédito, puedes explorar diferentes escenarios financieros y planificar tu futuro con confianza.', 'Do you need to calculate your monthly loan payments before committing? You are in the right place! With our credit simulation tool, you can explore different financial scenarios and plan your future with confidence.'),
('content_check_card_text_second', '¿Necesita calcular los pagos mensuales de su préstamo antes de comprometerse? Estás en el lugar correcto! Con nuestra herramienta de simulación de crédito, podrá explorar diferentes escenarios financieros y planificar su futuro con confianza.', 'Do you need to calculate your monthly loan payments before committing? You are in the right place! With our credit simulation tool, you can explore different financial scenarios and plan your future with confidence.'),
('content_security_text', '¿Necesitas enviar dinero a amigos o familiares? Con nuestra función de transferencia a otros usuarios, puedes enviar fondos de manera rápida y segura. Ya sea que estés compartiendo gastos, ayudando a un ser querido o simplemente pagando por un servicio, nuestra plataforma te permite realizar transferencias de manera conveniente y sin complicaciones. Olvídate de los largos procesos bancarios y las comisiones excesivas. Con nosotros, enviar dinero es tan fácil como pulsar un botón.', 'Do you need to send money to friends or family? With our transfer feature to other users, you can send funds quickly and securely. Whether you\'re sharing expenses, helping a loved one, or simply paying for a service, our platform allows you to make transfers conveniently and without complications. Forget about long banking processes and excessive commissions. With us, sending money is as easy as pressing a button.'),
('continue_with_text', 'O CONTINUAR CON', 'OR CONTINUE WITH'),
('crear_cuenta_text', 'Crea una cuenta', 'Create an account'),
('current_password_text', 'Contraseña actual', 'Current password'),
('descripcion_inicio', 'Explora las posibilidades con nuestro simulador de crédito. Calcula las cuotas y diseña tu plan de pago en línea de manera conveniente y sin complicaciones.', 'Explore the possibilities with our credit simulator. Calculate installments and design your payment plan online in a convenient and hassle-free way.'),
('description_2fa_text', 'Ingrese el código de verificación enviado a su correo electrónico para completar la autenticación de dos factores (2FA).', 'Enter the verification code sent to your email to complete two-factor authentication (2FA).'),
('description_forgot_password', 'Ingresa tu correo electronico y te enviaremos un codigo de verificacion para que puedas recuperar tu contraseña.', 'Enter your email and we will send you a verification code so you can recover your password.'),
('description_new_password', 'Ingresa tu nueva contraseña y confírmala para recuperar tu cuenta.', 'Enter your new password and confirm it to recover your account.'),
('description_notifications_text', 'Es posible que aún le enviemos notificaciones importantes sobre su cuenta fuera de su configuración de notificaciones.', 'We may still send you important notifications about your account outside of your notification settings.'),
('description_pay_cuotas_text', 'Debe elegir el numero de cuotas que desea pagar, debe comprender que dependiendo del numero de cuotas incrementara su historial crediticio.', 'You must choose the number of installments you want to pay, you must understand that depending on the number of installments your credit history will increase.'),
('description_privacy_text', 'Personalice su configuración de privacidad para proteger sus datos personales.', 'Customize your privacy settings to protect your personal data.'),
('description_profile_picture_text', 'Sube tu foto de perfil aquí.', 'Upload your profile picture here.'),
('description_profile_text', 'Administra la configuración de tu perfil', 'Manage your profile settings'),
('description_recover_code', 'Ingresa el código de verificación que te enviamos a tu correo electrónico.', 'Enter the verification code that we sent to your email.'),
('description_security_text', 'Las configuraciones de seguridad ofrecen opciones como cambio de contraseña, autenticación en dos pasos, registro de actividad, entre otras. Esto es para proteger los datos del usuario y garantizar un entorno seguro en la aplicación.', 'The security settings offer options such as password change, two-step authentication, activity log, among others. This is to protect user data and ensure a secure environment in the application.'),
('description_subtitle_profile_text', 'Cuéntanos tus datos básicos de información', 'Tell us your basic info details'),
('description_text', 'Descripción', 'Description'),
('description_validate_email_text', 'Hemos enviado un código de verificación a tu correo electrónico. Por favor, ingresa el código a continuación.', 'We have sent a verification code to your email. Please enter the code below.'),
('email_text', 'Correo electrónico', 'Email'),
('excedent_pay_text', 'Excedente pago actual', 'Current payment surplus'),
('exists_text', 'Ya tienes una cuenta?', 'Already have an account?'),
('fecha_text', 'Fecha', 'Date'),
('first_loan_text', 'primer préstamo', 'first loan'),
('first_part_make_loan', '¿Eres nuevo? ¿Quieres hacer tu ', 'Are you new? Would you like to make your '),
('forgot_password_text', '¿Olvidaste tu contraseña?', 'Forgot your password?'),
('frecuencia_one_text', 'Frecuencia', 'Frecuencia'),
('from_text', 'De', 'From'),
('get_transfer_text', 'Haz recibido una transferencia de', 'You have received a transfer of'),
('have_you_text', 'Tienes ', 'You have '),
('hide_all_text', 'Ocultar todo', 'Hide all'),
('history_movements_text', 'Historial de movimientos', 'History Movements'),
('id_loan_text', 'ID del préstamo', 'Loan ID'),
('id_number_text', 'Número de identificación', 'ID number'),
('income_amount_is_text', 'El monto acumulado de ingresos es de', 'The accumulated amount of income is'),
('income_monthly_text', 'Ingresos mensuales estimados', 'Estimated monthly income'),
('iniciar_text', 'Iniciar sesión', 'Sign In'),
('interes_text', 'Interés', 'Interest'),
('learn_more_text', 'Aprende Más', 'Learn More'),
('legal_footer_titulo', 'Legal', 'Legal'),
('legal_item_1', 'Política de Privacidad', 'Privacy Policy'),
('legal_item_2', 'Términos y Condiciones', 'Terms & Conditions'),
('make_loan_text', 'Hacer préstamo', 'Make loan'),
('make_transfer', 'Hacer transferencia', 'Make transfer'),
('more_text', 'Más', 'More'),
('movement_text', 'Movimiento', 'Movement'),
('name_text', 'Nombre', 'Name'),
('new_notifications_text', ' nuevas notificaciones', ' new notifications'),
('new_text', 'Nuevo', 'New'),
('next_date_text', 'Próxima fecha de pago', 'Next payment date'),
('nombre_inicio', 'EasyCredit', 'EasyCredit'),
('notifications_text', 'Notificaciones', 'Notifications'),
('not_found_loans_text', 'No se encontraron préstamos', 'No loans found'),
('not_found_notifications_text', 'No se encontraron notificaciones', 'No notifications found'),
('not_found_text', 'Movimientos históricos no encontrados', 'Not Found History Movements'),
('not_register_income_text', 'No se han registrado ingresos en tu cuenta.', 'No deposits have been posted to your account.'),
('number_cuotas_text', 'Número de cuotas', 'Number of installments'),
('number_register_is_text', 'El número de movimientos registrados en tu cuenta es de', 'The number of movements registered in your account is'),
('password_text', 'Contraseña', 'Password'),
('pay_cuotas_text', 'Pagar cuotas', 'Pay dues'),
('pay_loan_text', 'Pagar préstamo', 'Pay loan'),
('phone_text', 'Número de teléfono', 'Phone number'),
('placeholder_promo_text', 'Código de promoción', 'Promotion Code'),
('please_enter_text', 'Por favor ingresa aquí', 'Please enter here'),
('profile_picture_text', 'Foto de perfil', 'Profile Picture'),
('recursos_footer_titulo', 'Recursos', 'Resources'),
('recursos_item_1', 'Astro', 'Astro'),
('recursos_item_2', 'Tailwind CSS', 'Tailwind CSS'),
('recursos_item_3', 'NodeJS', 'NodeJS'),
('recursos_item_4', 'ExpressJS', 'ExpressJS'),
('registrarse_text', 'Registrarse', 'Sign Up'),
('registrarse_with_google', 'Inicia sesión con Google', 'Sign in with Google'),
('rights_footer', 'Todos los derechos reservados.', 'All Rights Reserved.'),
('security_text', '¡Transfiere fondos a otros usuarios de manera rápida y segura!', 'Transfer funds to other users quickly and securely!'),
('send_code', 'Enviar Código', 'Send code'),
('send_loan_text', 'Usted hizo un préstamo al', 'You made a loan to'),
('send_text', 'Enviar', 'Send'),
('send_transfer_text', 'Haz enviado una transferencia a', 'You have sent a transfer to'),
('show_text', 'Mostrar', 'Show'),
('siganos_footer_titulo', 'Síganos', 'Follow us'),
('siganos_item_1', 'Github', 'Github'),
('siganos_item_2', 'Linkedin', 'Linkedin'),
('simulate_loan_text', 'Simular Préstamo', 'Simulate Loan'),
('subdescription2_notifications_text', 'Reciba notificaciones de EasyCredit sobre la actividad de su cuenta y nuestras actualizaciones.', 'Receive EasyCredit notifications about your account activity and updates from us.'),
('subdescription2_privacy_text', 'Cambie su contraseña actual por una nueva para mantener su cuenta segura.', 'Change your current password to a new one to keep your account secure.'),
('subdescription2_security_text', 'Comprueba en qué dispositivos está tu cuenta y configura a cuáles tiene acceso.', 'Check which devices your account is on and configure which ones they have access to.'),
('subdescription_notifications_text', 'Reciba correos electrónicos sobre la actividad de su cuenta y nuestras actualizaciones.', 'Receive emails about your account activity and updates from us.'),
('subdescription_privacy_text', 'Asegúrese de dar su consentimiento para el uso y el intercambio de sus datos personales.', 'Please make sure you consent to the use and sharing of your personal data.'),
('subdescription_security_text', 'Utilice la autenticación de dos pasos para mejorar la seguridad de su cuenta', 'Use two-step authentication to improve your account security'),
('subtitle2_notifications_text', 'Notificaciones de EasyCredit', 'EasyCredit Notifications'),
('subtitle2_privacy_text', 'Contraseña', 'Password'),
('subtitle2_security_text', 'Registro de actividad', 'Activity Register'),
('subtitle_notifications_text', 'Notificaciónes de Correo Electrónico', 'Email Notifications'),
('subtitle_privacy_text', 'Consentimiento explícito', 'Explicit consent'),
('subtitle_profile_text', 'Información básica', 'Basic Info'),
('subtitle_security_text', 'Autenticación de dos pasos', 'Two-step Authentication'),
('text_amount_loan', 'Monto del Préstamo', 'Loan Amount'),
('text_confirm', 'Confirmar', 'Confirm'),
('text_confirm_code', 'Confirmar Codigo', 'Confirm Code'),
('text_cuotas', 'Cuotas', 'Dues'),
('text_description_transfer', 'Descripción de la transferencia', 'Transfer Description'),
('text_finish_loan', 'Finalizar Préstamo', 'Finalize Loan'),
('text_frecuencia', 'Frecuencia de pagos', 'Payment Frequency'),
('text_information_loan', 'Información del Préstamo', 'Loan Information'),
('text_information_personal', 'Información Personal', 'Personal information'),
('text_monto_transfer', 'Monto de la transferencia', 'Transfer amount'),
('text_name_complete', 'Nombre Completo', 'Full name'),
('text_new_password', 'Nueva Contraseña', 'New Password'),
('text_new_password_invert', 'Contraseña Nueva', 'New password'),
('text_numero_tarjeta_destino', 'Número de Tarjeta del destino', 'Fate Card Number'),
('text_password_update', 'Contraseña actualizada correctamente', 'Password updated successfully'),
('text_recover_code', 'Codigo de Recuperación', 'Recovery Code'),
('text_repeat_new_password', 'Repetir Nueva Contraseña', 'Repeat New Password'),
('text_select_cuotas', 'Seleccione las cuotas', 'Select the installments'),
('text_select_frecuencia', 'Seleccione la frecuencia', 'Select the frequency'),
('text_simulate', 'Simular', 'Simulate'),
('text_tasa_fija', 'Tasa Fija', 'Fixed rate'),
('text_tasa_loan', 'Tasa de Interés', 'Interest rate'),
('text_tasa_variable', 'Tasa Variable', 'Variable rate'),
('text_transfer', 'Transferencia', 'Transfer'),
('title_2fa_text', 'Verificación de Correo Electrónico (2FA)', 'Email Verification (2FA)'),
('title_loan_text', 'Préstamos', 'Loans'),
('title_movements_text', 'Movimientos', 'Movements'),
('title_others_text', 'Otras actividades', 'Other activities'),
('title_pay_cuotas_text', 'Pago de Cuotas', 'Payment of Fees'),
('title_privacy_text', 'Privacidad', 'Privacy'),
('title_profile_text', 'Perfil', 'Profile'),
('title_promo_text', 'Ingrese el código', 'Enter the code'),
('title_security_text', 'Seguridad', 'Security'),
('title_Transfer_text', 'Transferencias', 'Transfers'),
('title_validate_email_text', 'Validar Correo Electrónico', 'Validate Email'),
('titulo_inicio', 'Simulador de crédito', 'Credit simulator'),
('total_income_text', 'Ingresos totales', 'Total Income'),
('transferir_text', 'Transferir', 'Transfer'),
('type_description_transfer', 'Escribe la descripción de la transferencia aquí...', 'Write the description of the transfer here...'),
('type_email', 'Escribe tu correo electronico', 'Write your email'),
('type_loan', 'Tipo de Préstamo', 'Loan Type'),
('type_recover_code', 'Escribe tu Codigo de Recuperación', 'Write your Recovery Code'),
('update_text', 'Actualizar', 'Update'),
('username_text', 'Nombre de usuario', 'Username'),
('value_cuotas_text', 'Valor a pagar', 'Amount to be paid'),
('verify_email_text', 'Verificar correo', 'Check email'),
('view_all_text', 'Ver todo', 'View all'),
('welcome_back_text', 'Bienvenido de nuevo ', 'Welcome back '),
('with_amout_text', 'con un monto de', 'with an amount of');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `codes`
--
ALTER TABLE `codes`
  ADD PRIMARY KEY (`email`(250));

--
-- Indices de la tabla `history_2fa`
--
ALTER TABLE `history_2fa`
  ADD PRIMARY KEY (`device`(250)) USING BTREE;

--
-- Indices de la tabla `movements`
--
ALTER TABLE `movements`
  ADD PRIMARY KEY (`id_movement`);

--
-- Indices de la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notification`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id_loan`);

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
  ADD UNIQUE KEY `email_no_repeat` (`email_user`,`number_card`) USING HASH;

--
-- Indices de la tabla `words`
--
ALTER TABLE `words`
  ADD PRIMARY KEY (`word`(700)) USING BTREE;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `registers` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
