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
    sendLoanNotificationsEA
};