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
            }
            .header {
                text-align: center;
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
                    <td>${specifics_loan.tasa}</td>
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
        
        <p class="thanks">¡Gracias por elegir EasyCredit!</p>
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

    const subject = `Transfer Notification`;
    const emailData = {
        action,
        origin,
        message,
        numero_card,
        subject,
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
    const numbre_card = data.user_info[0].number_card;
    const saldo_disponible = data.user_info[0].saldo_disponible;
    const ingresos_totales = data.user_info[0].ingresos_totales;
    const email = data.user_info[0].email_user;
    const fecha_update = data.user_info[0].fecha_update;

    const subject = `Movement Notification`;
    const htmlMessage = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Notificación de Movimientos</title>
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
            }
            .header {
                text-align: center;
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
        <div class="header">
            <h1>Notificación de Movimientos</h1>
            <p>Estimado <strong>${name}</strong>,</p>
            <p>A continuación se presenta un resumen de tus movimientos:</p>
        </div>
        
        <div class="details">
            <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Resumen de Movimientos ${fecha_update}</h2>
            <table>
                <tr>
                    <td><strong>Número de Movimientos:</strong></td>
                    <td>${num_movements}</td>
                </tr>
                <tr>
                    <td><strong>Total de Movimientos:</strong></td>
                    <td>${amount_movements}</td>
                </tr>
                <tr>
                    <td><strong>Nombre:</strong></td>
                    <td>${name}</td>
                </tr>
                <tr>
                    <td><strong>Número de Tarjeta:</strong></td>
                    <td>${numbre_card}</td>
                </tr>
                <tr>
                    <td><strong>Saldo Disponible:</strong></td>
                    <td>${saldo_disponible}</td>
                </tr>
                <tr>
                    <td><strong>Ingresos Totales:</strong></td>
                    <td>${ingresos_totales}</td>
                </tr>
            </table>
        </div>
        
        <p class="thanks">¡Gracias por elegir nuestro servicio!</p>
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
            htmlMessage = generateSpecialOfferEmail();
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
        <div class="container">
            <div class="header">
                <h1 style="color: #007bff;">Notificación</h1>
            </div>
            <div class="message">
                <p>Hola,</p>
                <p>¡Gracias por unirte a nuestra plataforma! Te damos la bienvenida a nuestra comunidad.</p>
                <p>Empieza a disfrutar de los beneficios exclusivos que ofrecemos:</p>
                <ol id="ul">
                    <li>Acceso a contenido premium</li>
                    <li>Oportunidades de participación en eventos</li>
                    <li>Actualizaciones periódicas sobre nuevas funciones</li>
                </ol>
                <p>Para comenzar a explorar, <a href="#" style="color: #007bff; text-decoration: none;">inicia sesión en tu cuenta</a>.</p>
            </div>
            <p class="thanks" style="color: #666;">¡Gracias por elegirnos!</p>
        </div>
    `;
    return generateEmailTemplate(content);
}

function generateContentPublicationEmail() {
    const content = `
        <div class="container">
            <div class="header">
                <h1 style="color: #007bff;">Notificación</h1>
            </div>
            <div class="message">
                <p>Hola,</p>
                <p>¡Descubre lo último en nuestra plataforma!</p>
                <p>Hemos añadido contenido fresco y emocionante que no te puedes perder.</p>
                <ol id="ul">
                    <li>Ve el nuevo contenido</li>
                </ol>
            </div>
            <p class="thanks" style="color: #666;">¡Gracias por elegirnos!</p>
        </div>
    `;
    return generateEmailTemplate(content);
}

function generateSpecialOfferEmail() {
    const content = `
        <div class="container">
            <div class="header">
                <h1 style="color: #dc3545;">Notificación</h1>
            </div>
            <div class="message">
                <p>Hola,</p>
                <p>¡Oferta Especial por Tiempo Limitado!</p>
                <p>No te pierdas nuestra oferta exclusiva para usuarios nuevos.</p>
                <p>Usa el siguiente código al registrarte: <strong style="color: #dc3545;">SPECIAL50</strong></p>
                <p>Regístrate <a href="#" style="color: #dc3545; text-decoration: none;">aquí</a> para aprovechar esta oferta.</p>
            </div>
            <p class="thanks" style="color: #666;">¡Gracias por elegirnos!</p>
        </div>
    `;
    return generateEmailTemplate(content);
}

function generateDefaultEmail() {
    const content = `
        <div class="container">
            <div class="header">
                <h1 style="color: #007bff;">Notificación</h1>
            </div>
            <div class="message">
                <p>Hola,</p>
                <p>Queríamos informarte sobre una actualización reciente en nuestra plataforma.</p>
                <p>Para obtener más detalles, <a href="#" style="color: #007bff; text-decoration: none;">inicia sesión en tu cuenta</a>.</p>
            </div>
            <p class="thanks" style="color: #666;">¡Gracias por elegirnos!</p>
        </div>
    `;
    return generateEmailTemplate(content);
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

async function sendLoanNotificationsEA(data){
    const specifics_loan = {
        amount: data.action_loan,
        date: data.date,
        origin: "Bank",
        tipo: "Bank Loan",
        state: "positivo"
    }

    
}

export {
    sendLoanNotificationEmail, 
    sendTransferNotificationEmail, 
    sendMovementNotificationEmail,
    sendLoanNotificationsEA,
    sendActivityNotificationEmail
};