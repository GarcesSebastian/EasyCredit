import {emailNotificationsElements, smsNotificationsElements} from "./localStorage";

async function sendLoanNotificationEmail(data){
    const action = data.action_loan;
    const name = data.name_loan;
    const specifics_loan = {
        name: data.name_loan,
        email: data.email_user,
        telefono: data.numero_telefono_loan,
        id_loan: data.id_loan,
        amount: data.action_loan,
        tasa: data.tasa_loan,
        cuotas: data.cuotas,
        frecuencia: data.frecuencia,
        tasa_variable: data.tasa_variable,
        tasa_fija: data.tasa_fija,
        date: data.date
    }

    const tasaVariable = data.tasa_variable ? "Tasa Variable" : "Tasa Fija";

    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Préstamo</title>
        <style>
            body {
                background-color: #f2f2f2;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
            .container {
                max-width: 600px;
                margin: auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                text-align: center;
            }
            .header {
                margin-bottom: 20px;
            }
            .header h1 {
                color: #333;
            }
            .details {
                margin-bottom: 20px;
            }
            .details table {
                width: 100%;
                border-collapse: collapse;
            }
            .details table td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                color: #666;
            }
            .details table td:first-child {
                width: 30%; /* Ancho de la primera columna */
            }
            .details table td:last-child {
                text-align: right;
                font-weight: normal;
                color: #333;
            }
            .thanks {
                text-align: center;
                color: #666;
                font-size: 16px;
                margin-top: 20px;
                padding-bottom: 20px;
            }
        </style>
    </head>
    <body style="background-color: #f2f2f2; padding: 20px;">
    <div class="container">
    
        <header style="background: #272525; width: 100%; padding: .5rem 0; border-radius: 8px 8px 0px 0px;">
            <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
        </header>
    
        <div class="header">
            <h1>Notificación de Préstamo</h1>
            <p>Estimado <strong>${name}</strong>,</p>
            <p>Nos complace informarle que su solicitud de préstamo por <span style="font-weight: bold;">${action}$</span> ha sido aprobada.</p>
        </div>
        
        <div class="details">
            <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Detalles del Préstamo</h2>
            <table>
                <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${specifics_loan.name}</td>
                </tr>
                <tr>
                    <td><strong>Email:</strong></td>
                    <td>${specifics_loan.email}</td>
                </tr>
                <tr>
                    <td><strong>Teléfono:</strong></td>
                    <td>${specifics_loan.telefono}</td>
                </tr>
                <tr>
                    <td><strong>ID del préstamo:</strong></td>
                    <td>${specifics_loan.id_loan}</td>
                </tr>
                <tr>
                    <td><strong>Monto:</strong></td>
                    <td>${specifics_loan.amount}</td>
                </tr>
                <tr>
                    <td><strong>Tasa:</strong></td>
                    <td>${specifics_loan.tasa}%</td>
                </tr>
                <tr>
                    <td><strong>Cuotas:</strong></td>
                    <td>${specifics_loan.cuotas}</td>
                </tr>
                <tr>
                    <td><strong>Frecuencia:</strong></td>
                    <td>${specifics_loan.frecuencia}</td>
                </tr>
                <tr>
                    <td><strong>Tipo de Tasa:</strong></td>
                    <td>${tasaVariable}</td>
                </tr>
                <tr>
                    <td><strong>Fecha:</strong></td>
                    <td>${specifics_loan.date}</td>
                </tr>
            </table>
        </div>
        
        <footer style="width: 100%; text-align: center; background: #272525; padding: .8rem 0; border-radius: 0 0 8px 8px;">
            <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
        </footer>
    </div>
    
    </body>
    </html>
        
    
    `;
    const subject = `Loan Notification`;
    const email = data.email_user;

    const emailData = {
        email,
        subject,
        htmlMessage
    }

    const response_send_email = await fetch("http://localhost:4000/email/send_loan", {
        method: "POST",
        body: JSON.stringify(emailData),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await response_send_email.json();
    if(response.state !== "Good Request"){
        console.log("Error sending email");
    }
}

async function sendTransferNotificationEmail(data){
    const action = data.action;
    const origin = data.origin;
    const message = data.message;
    const numero_card = data.numero_card;
    let date = new Date();

    const subject = `Transfer Notification`;
    const emailData = {
        action,
        origin,
        message,
        numero_card,
        subject,
        date
    }

    const response_send_email = await fetch("http://localhost:4000/email/send_transfer", {
        method: "POST",
        body: JSON.stringify(emailData),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await response_send_email.json();
    if(response.state !== "Good Request"){
        console.log("Error sending email");
    }
}

async function sendMovementNotificationEmail(data){
    //Enviar reporte de los movimientos del usuario

    const num_movements = data.user_movements_complete.length;
    let amount_movements = 0;
    data.user_movements_complete.forEach(movement => {
        amount_movements += parseFloat(movement.action_movement);
    });
    const name = data.user_info[0].name_user;
    const number_card = data.user_info[0].number_card;
    const saldo_disponible = data.user_info[0].saldo_disponible;
    const ingresos_totales = data.user_info[0].ingresos_totales;
    const email = data.user_info[0].email_user;
    const fecha_update = data.user_info[0].fecha_update;

    const subject = `Movement Notification`;
    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example</title>
        <style>
            
            * {
                text-decoration: none;
                list-style: none;
                box-sizing: border-box;
                text-align: center;
            }
    
            body {
                background-color: #f2f2f2;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
    
            .container {
                max-width: 500px;
                margin: auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            header {
                background: #272525;
                width: 100%;
                padding: .5rem 0;
                border-radius: 8px 8px 0px 0px;
            }
    
            .headerInfo{
                align-items: center;
            }
    
            .headerInfo p{
                text-align: center;
            }
    
            .headerInfo p:nth-child(3){
                padding: 0 1rem;
            }
    
            .headerInfo h1 {
                color: #333;
            }
    
            .details {
                box-sizing: border-box;
                padding: .5rem 1rem;
            }
    
            .details table {
                width: 100%;
                
                border-collapse: collapse;
            }
    
            .details table td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
                font-weight: bold;
                color: #666;
            }
    
            .details table td:first-child {
                width: 30%;
                /* Ancho de la primera columna */
            }
    
            .details table td:last-child {
                text-align: right;
                font-weight: normal;
                color: #333;
            }
    
            .thanks {
                text-align: center;
                color: #666;
                font-size: 16px;
            }
    
            .date {
                padding: 1rem 10rem;
                margin-top: -10px;
            }
    
            .date h3 {
                padding: 1rem;
                border-radius: 8px;
                color: white;
                background-color: rgb(0, 115, 230);
            }
    
            @media (max-width: 640px) {
                .email {
                    width: 90%;
                    height: fit-content;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <header>
                <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
            </header>
    
            <div class="headerInfo">
                <h1>Notificación del Movimientos</h1>
                <p>Estimado <strong>${name}</strong>,</p>
                <p>Recibió una notificación de movimientos en su cuenta de 
                    <span style="font-weight: bold;">EasyCredit</span>
                </p>
            </div>
    
            <section class="date">
                <h3>${fecha_update.split("T")[0]}</h3>
            </section>
    
            <div class="details">
                <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px; text-align: left;">Detalles del
                    Movimiento</h2>
                <table>
                    <tr>
                        <td><strong>Nombre:</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>ID del préstamo:</strong></td>
                        <td>${name}</td>
                    </tr>
                    <tr>
                        <td><strong>Monto:</strong></td>
                        <td>${saldo_disponible}</td>
                    </tr>
                    <tr>
                        <td><strong>Numero de tarjeta:</strong></td>
                        <td>${number_card}</td>
                    </tr>
                </table>
            </div>
    
    
            <footer
                style="width: 100%; text-align: center; background: #272525; padding: .8rem 0; border-radius: 0 0 8px 8px; margin-top: 1rem;">
                <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
            </footer>
        </div>
        </div>
    </body>
    
    </html>
    
    `;

    const emailData = {
        email,
        subject,
        htmlMessage
    }

    const response_send_email = await fetch("http://localhost:4000/email/send_movement", {
        method: "POST",
        body: JSON.stringify(emailData),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await response_send_email.json();
    if(response.state !== "Good Request"){
        console.log("Error sending email");
        return;
    }


}

async function sendMovementNotificationEA(data){
    const emailData = {
        id_user: getCookie("ID-USER"),
        origin: "Bank",
        tipo_notification: "Movement",
    }

    const response_send_email = await fetch("http://localhost:4000/EA/movement", {
        method: "POST",
        body: JSON.stringify(emailData),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await response_send_email.json();
    if(!response_send_email.ok){
        console.log("Error sending email");
        return;
    }


}

async function sendActivityNotificationEmail(id_user, activityType) {

    if(emailNotificationsElements.check_email_others.checked != true){
        return;
    }

    const subject = `Notificación de Actividad en tu Cuenta`;

    let htmlMessage = "";

    switch (activityType) {
        case "Nuevo Registro":
            htmlMessage = generateNewRegistrationEmail();
            break;
        case "Publicación de Contenido":
            htmlMessage = generateContentPublicationEmail();
            break;
        case "Oferta Especial":
            htmlMessage = await generateSpecialOfferEmail();
            break;
        default:
            htmlMessage = generateDefaultEmail();
    }

    const emailData = {
        id_user,
        subject,
        htmlMessage
    };

    try {
        const response = await fetch("http://localhost:4000/email/send_simulated_activity", {
            method: "POST",
            body: JSON.stringify(emailData),
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        if (result.state !== "Good Request") {
            console.log("Error sending simulated activity email");
        }
    } catch (error) {
        console.error("Error sending simulated activity email:", error.message);
    }
}

function generateNewRegistrationEmail() {
    const content = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example</title>
        <style>
            * {
                text-decoration: none;
                list-style: none;
                box-sizing: border-box;
                text-align: center;
            }
    
            body {
                background-color: #f2f2f2;
                padding: 20px;
                font-family: Arial, sans-serif;
            }
    
            .container {
                max-width: 500px;
                margin: auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            header {
                width: 100%;
                text-align: center;
                background: #272525;
                padding: .8rem 0;
                border-radius: 8px 8px 0 0;
            }
    
            footer {
                margin-top: 1.5rem;
                width: 100%;
                text-align: center;
                background: #272525;
                padding: .8rem 0;
                border-radius: 0 0 8px 8px;
            }
    
            section{
                padding: 1rem;
                width: 100%;
            }
    
            article{
                align-items: center;
            }
    
            .info p:nth-child(1){
                font-size: 2rem;
                font-weight: bold;
            }
    
            .info p:nth-child(2){
                font-size: 1.2rem;
                font-weight:600;
            }
    
            .message p{
                color: rgb(128, 128, 128);
                font-weight: 500;
                text-align: center;
            }
    
            .details{
                padding: .5rem 0;
                margin-bottom: 1.5rem;
            }
    
            .details p:nth-child(1){
                font-size: 1.2rem;
                font-weight: 600;
            }
            .details p:nth-child(2){
                color:rgb(128, 128, 128) ;
            }
    
            section a {
                font-size: 1.5rem;
                font-weight:500;
                border-radius: 10px;
                color: white;
                background-color: rgb(31, 177, 255);
                padding: 1.2rem 2rem;
            }
    
            @media (max-width: 640px) {
                .email {
                    width: 90%;
                    height: fit-content;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <header>
                <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
            </header>
    
            <section>
                <article class="info">
                    <p>Bienvenido</p>
                    <p>¡Gracias por registrarte en EasyCredit!</p>
                </article>
    
                <article class="message">
                    <p>Gracias por unirte a nuestra plataforma, te damos la bienvenida a nuestra comunidad esperamos que disfrutes de nuestros servicios.</p>
                </article>
    
                <article class="details">
                    <p>¿Todo Listo para Empezar?</p>
                    <p>Para comenzar a explorar, Inicia sesión en tu cuenta</p>
                </article>
                <a href="http://localhost:4321/SignIn">Iniciar Sesión</a>
            </section>
    
            <footer>
                <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
            </footer>
        </div>
        </div>
    </body>
    
    </html>
    `;
    return content;
}

function generateContentPublicationEmail() {
    const content = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example</title>
        <style>
            * {
                color: black;
                text-decoration: none;
                list-style: none;
                box-sizing: border-box;
                text-align: center;
            }
    
            img {
                height: 10rem;
            }
    
            body {
                background-color: rgb(237, 237, 237);
                padding: 20px;
                font-family: Arial, sans-serif;
            }
    
            .container {
                align-items: center;
                max-width: 500px;
                margin: auto;
                padding: 20px;
                background-color: rgb(255, 255, 255);
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            header {
                width: 100%;
                text-align: center;
                background: rgb(39, 37, 37);
                padding: .8rem 0;
                border-radius: 8px 8px 0 0;
            }
    
            footer {
                width: 100%;
                text-align: center;
                background: #272525;
                margin-top: 1.5rem;
                padding: .8rem 0;
                border-radius: 0 0 8px 8px;
            }
    
            section {
                padding: 1.5rem;
                width: 100%;
            }
    
            article {
                align-items: center;
            }
    
            .info p:nth-child(1) {
                font-size: 2rem;
                font-weight: bold;
            }
    
            .info p:nth-child(2) {
                font-size: 1.2rem;
                padding: 0 1rem;
                text-align: center;
                font-weight: 600;
            }
    
            .message span {
                font-weight: 700;
                color: rgb(0, 0, 0);
            }
    
            .message p {
                color: rgb(128, 128, 128);
                font-weight: 500;
                text-align: center;
            }
    
            .details {
                padding: 1rem 0;
                margin-bottom: 1rem;
            }
    
            .details p:nth-child(1) {
                font-weight: 600;
            }
    
            .details p:nth-child(2) {
                color: rgb(128, 128, 128);
            }
    
            section a {
                font-size: 1.5rem;
                font-weight: 500;
                border-radius: 10px;
                color: white;
                background-color: rgb(31, 177, 255);
                padding: 1.2rem 2rem;
            }
    
            @media (max-width: 640px) {
                .email {
                    width: 90%;
                    height: fit-content;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <header>
                <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
            </header>
    
            <section>
                <article class="info">
                    <p>¡Nueva Publicacion!</p>
                    <p>Descubre lo ultimo en nuestra plataforma</p>
                    <img src="https://main-pdf2-aspose-app.s3.us-west-2.amazonaws.com/b6c05d20-6d51-40c4-8c4a-5dc087002e6d/undraw_web_development_0l6v.png?X-Amz-Expires=86400&response-content-disposition=attachment%3B%20filename%3D%22undraw_web_development_0l6v.png%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4XIV7DNDPELHCB2Q%2F20240521%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240521T231504Z&X-Amz-SignedHeaders=host&X-Amz-Signature=73f4640562389f0fe82bd9178f84de79a70c0adafe50db7983086210228f65fc"
                        alt="">
                </article>
    
                <article class="message">
                    <p><span>¡Hola!, </span>
                        Hemos añadido nuevo contenido fresco y emocionante a nuestra plataforma, no te lo pierdas ¡Hechale
                        un vistazo!.</p>
                </article>
    
                <article class="details">
                    <p>¡Contenido Emocionante!</p>
                    <p>Para ver mas detalles, Inicia sesión en tu cuenta</p>
    
                </article>
                <a href="http://localhost:4321/SignIn">Iniciar Sesión</a>
            </section>
    
            <footer>
                <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
            </footer>
        </div>
        </div>
    </body>
    
    </html>
    `;
    return content;
}

let attemps = 0;
let maxAttempts = 100;

async function generateSpecialOfferEmail() {
    const res_codes = await fetch("http://localhost:4000/codes/promotion");
    const codes = await res_codes.json();

    const randomIndex = Math.floor(Math.random() * codes.length);
    const code = codes[randomIndex].code;
    const date = new Date();
    const expired = new Date(code.expired);
    if (expired < date && attemps < maxAttempts) {
        attemps++;
        return generateSpecialOfferEmail();
    }

    if(attemps >= maxAttempts){
        return;
    }

    const content = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example</title>
        <style>
            * {
                text-decoration: none;
                list-style: none;
                text-align: center;
                color:black;
                box-sizing: border-box;
            }
    
            body {
                padding: 20px;
                background-color: #f2f2f2;
                font-family: Arial, sans-serif;
            }
    
            .container {
                width: 500px;
                margin: auto;
                padding: 20px;
                background-color: #fff;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            header {
                width: 100%;
                text-align: center;
                background: #272525;
                padding: .8rem 0;
                border-radius: 8px 8px 0 0;
            }
    
            footer {
                width: 100%;
                text-align: center;
                background: #272525;
                padding: .8rem 0;
                margin-top: 1.2rem;
                border-radius: 0 0 8px 8px;
            }
    
            section {
                text-align: center;
                padding: 1rem;
                width: 100%;
            }
    
            article {
                padding: 1rem;
                text-align: center;
            }
    
            .info p:nth-child(1) {
                font-size: 2rem;
                font-weight: bold;
                text-align: center;
            }
    
            .info p:nth-child(2) {
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
            }
    
            .message p {
                color: rgb(128, 128, 128);
                font-weight: 500;
                font-size:1.1rem;
                text-align: center;
            }
    
            .details {
                text-align: center;
                padding: 1rem 0;
            }
    
            .details p {
                font-size: 1.2rem;
                text-align: center;
                font-weight: 600;
                padding: 0 0 2rem 0;
            }
            
            a {
                font-size: 1.5rem;
                font-weight:500;
                border-radius: 10px;
                color: white;
                background-color: rgb(31, 177, 255);
                padding: 1.2rem 2rem;
            }
    
            @media (max-width: 640px) {
                .email {
                    width: 90%;
                    height: fit-content;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <header>
                <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
            </header>
    
            <section>
                <article class="info">
                    <p>¡Hola!</p>
                    <p>Oferta especial por tiempo limitado</p>
                </article>
    
                <article class="message">
                    <p>No te pierdas nuestra oferta exclusiva para nuestros usuarios para obtener beneficios increibles.</p>
                </article>
    
                <article class="details">
                    <p>Usa el siguiente codigo de promocion</p>
                    <a href="http://localhost:4321/">${code}</a>
                </article>
            </section>
    
            <footer>
                <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
            </footer>
        </div>
        </div>
    </body>
    
    </html>
    `;
    return content;
}

function generateDefaultEmail() {
    const content = `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Example</title>
        <style>
            * {
                color: black;
                text-decoration: none;
                list-style: none;
                box-sizing: border-box;
                text-align: center;
            }
    
            img {
                height: 10rem;
            }
    
            body {
                background-color: rgb(237, 237, 237);
                padding: 20px;
                font-family: Arial, sans-serif;
            }
    
            .container {
                align-items: center;
                max-width: 500px;
                margin: auto;
                padding: 20px;
                background-color: rgb(255, 255, 255);
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
    
            header {
                width: 100%;
                text-align: center;
                background: rgb(39, 37, 37);
                padding: .8rem 0;
                border-radius: 8px 8px 0 0;
            }
    
            footer {
                width: 100%;
                text-align: center;
                background: #272525;
                margin-top: 1.5rem;
                padding: .8rem 0;
                border-radius: 0 0 8px 8px;
            }
    
            section {
                padding: 1.5rem;
                gap: 1rem;
                width: 100%;
            }
    
            article {
                align-items: center;
            }
    
            .info p:nth-child(1) {
                font-size: 2rem;
                font-weight: bold;
            }
    
            .info p:nth-child(2) {
                font-size: 1.2rem;
                padding: 0 1rem;
                text-align: center;
                font-weight: 600;
            }
    
            .message span{
                font-weight: 700;
                color: rgb(0, 0, 0);
            }
    
            .message p {
                color: rgb(128, 128, 128);
                font-weight: 500;
                text-align: center;
            }
    
            .details {
                padding: 1rem 0;
                margin-bottom: 1rem;
            }
    
            .details p:nth-child(1) {
                font-weight: 600;
            }
    
            .details p:nth-child(2) {
                color: rgb(128, 128, 128);
            }
    
            section a {
                font-size: 1.5rem;
                font-weight:500;
                border-radius: 10px;
                color: white;
                background-color: rgb(31, 177, 255);
                padding: 1.2rem 2rem;
            }
    
            @media (max-width: 640px) {
                .email {
                    width: 90%;
                    height: fit-content;
                }
            }
        </style>
    </head>
    
    <body>
        <div class="container">
            <header>
                <span style="color: white; font-size: 1.3rem;">EasyCredit</span>
            </header>
    
            <section>
                <article class="info">
                    <p>¡Actualizacion Disponible!</p>
                    <p>Una nueva actualizacion ha llegado a EasyCredit</p>
                    <img src="https://main-pdf2-aspose-app.s3.us-west-2.amazonaws.com/81fe4cfc-144d-498a-8884-44b6621208e0/undraw_details_8k13.png?X-Amz-Expires=86400&response-content-disposition=attachment%3B%20filename%3D%22undraw_details_8k13.png%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIA4XIV7DNDPELHCB2Q%2F20240521%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20240521T230827Z&X-Amz-SignedHeaders=host&X-Amz-Signature=e2dca4538bd72e1fc46afa40b87bca47b0c2eeee9176b5e805923aea84844fad" alt="">
                </article>
    
                <article class="message">
                    <p><span>¡Hola!, </span>
                        Queriamos informarte que tu plataforma de credito preferida ha agregado algunos cambios importantes con respecto a la version anterior.
                        disfrutes de nuestros servicios.</p>
                </article>
    
                <article class="details">
                    <p>¡Nuevos Cambios y Mejoras!</p>
                    <p>Para ver mas detalles, Inicia sesión en tu cuenta</p>
                    
                </article>
                <a href="http://localhost:4321/SignIn">Iniciar Sesión</a>
            </section>
    
            <footer>
                <span style="color: white; font-size: 1.3rem;">Gracias por elegir EasyCredit</span>
            </footer>
        </div>
        </div>
    </body>
    
    </html>
    `;
    return content;
}

function generateEmailTemplate(content) {
    const template = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notificación</title>
            <style>
                body {
                    background-color: #f8f9fa;
                    font-family: 'Trebuchet MS', 'Lucida Sans', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .header h1 {
                    color: #007bff;
                }
                .message {
                    color: #333;
                    line-height: 1.5;
                }
                .thanks {
                    text-align: center;
                    color: #666;
                    font-size: 16px;
                    margin-top: 20px;
                    padding-bottom: 20px;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    font-weight: bold;
                }
                #ul {
                    counter-reset: li;
                    list-style: none;
                    padding: 0;
                }
                #ul li {
                    position: relative;
                    padding: .4em .4em .4em 2em;
                    margin: .5em 0;
                    background: #ddd;
                    color: #444;
                    transition: all .3s ease-out;
                }
                #ul li:before {
                    content: counter(li);
                    counter-increment: li;
                    position: absolute;
                    left: .4em;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #fa8072;
                    height: 1.5em;
                    width: 1.5em;
                    line-height: 1.5em;
                    text-align: center;
                    color: #fff;
                    font-weight: bold;
                }
                #ul li:hover {
                    background: #eee;
                }
            </style>
        </head>
        <body>
            ${content}
        </body>
        </html>
    `;
    return template;
}

function getCookie(cookieName) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(cookieName + '=')) {
            return cookie.substring(cookieName.length + 1);
        }
    }
    return null;
}

export {
    sendLoanNotificationEmail, 
    sendTransferNotificationEmail, 
    sendMovementNotificationEmail,
    sendMovementNotificationEA,
    sendActivityNotificationEmail
};