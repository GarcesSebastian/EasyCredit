import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";
import CryptoJS from 'crypto-js';
import { createServer } from 'node:http';
// import { Server } from 'socket.io';
import nodemailer from 'nodemailer';

const app = express();
const server = createServer(app);

const port = process.env.PORT || 4000;

// Configuración inicial
app.set("port", port);

// Middlewares
app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:4321', 'http://localhost:4322', "https://1rhbb29z-4321.use2.devtunnels.ms", "https://c2hccs03-4321.use2.devtunnels.ms", "https://easy-credit.vercel.app"];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permite solicitudes desde cualquier origen
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Encabezados permitidos
    next();
});

// const io = new Server(server, {
//     cors: {
//         origin: (origin, callback) => {
//         const allowedOrigins = ['http://localhost:4321', "https://1rhbb29z-4321.use2.devtunnels.ms", "https://c2hccs03-4321.use2.devtunnels.ms"];
//         if (allowedOrigins.includes(origin) || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('No permitido por CORS'));
//         }
//         },
//         methods: ['GET', 'POST', 'PUT', 'DELETE'],
//         credentials: true
//     }
// });

// io.on('connection', (socket) => {
//     socket.on("client_enter", (id) => {
//         console.log("Cliente: " + id);
//         socket.join(id);
//         // console.log(io.sockets.adapter.rooms);
//     })

//     socket.on("transfer", async (data) => {
//         const connection = await database.getConnection();

//         let id_origin = data.origin;
//         let id_destiny;
//         let number_card = "";
//         const response_data_user = await connection.query("SELECT * FROM users WHERE number_card = ?", [convertCard(number_card, data.numero_card)]);

//         if(response_data_user.length > 0){
//             id_destiny = response_data_user[0].id_user;
//         }else{
//             console.log("No entrooo");
//         }

//         console.log("Transferencia de " + id_origin + " a " + id_destiny);
//         io.sockets.to(id_destiny).emit("transfer_received");
//     })
// });

app.post("/register/auth", async (req, res) => {
    if (req.body && req.body.email) {
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email FROM registers WHERE email = ?", [req.body.email]);

        if (emailExists.length > 0) {
            res.status(400).json({ message: "Correo electrónico ya registrado." });
            return;
        }

        let user_id;
        let isAvailable = false;
        let attempts = 0;
        let min = 9999;
        let max = 999999;
        const maxAttempts = 100; 

        while (!isAvailable && attempts < maxAttempts) {
            user_id = Math.floor(Math.random() * max) + min;

            const userIdExists = await connection.query("SELECT id FROM registers WHERE id = ?", [user_id]);
            if (userIdExists.length === 0) {
                isAvailable = true;
            }

            attempts++;
        }

        if (attempts >= maxAttempts) {
            res.status(500).json({ message: "Unable to generate a unique ID" });
            return;
        }

        const hashedPassword = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);

        let year = new Date().getFullYear().toString().split("");
        year = year[year.length - 2] + year[year.length - 1]
        let fecha_creacion = (new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate()) + "/" + (new Date().getMonth() < 10 ? "0" + (new Date().getMonth() + 1) : new Date.getMonth() + 1) + "/" + year;

        let digits_card = [];
        let number_card = "";
        let attemps_card = 100;
        
        for(let i = 0; i < 4; i++){
            let randomDigits = Math.floor(Math.random() * 9000) + 1000;
            digits_card.push(randomDigits);     
            
            if(attemps_card == 0){
                number_card = "No se permite"
                break;
            }

            if(i == 3){
                number_card += randomDigits
                let card_users = await connection.query("SELECT * FROM users WHERE number_card = ?",[number_card]);

                if(card_users.length > 0){
                    number_card = "";
                    digits_card = [];
                    attemps_card --;
                    i = -1;
                }

            }else{
                number_card += randomDigits + " "
            }
        }
        
        connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, hashedPassword, req.body.numero_identidad, req.body.numero_telefono, false, fecha_creacion]);
        connection.query("INSERT INTO users (id_user, name_user, email_user, number_card, saldo_disponible, fecha_update) VALUES (?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, number_card, "0", fecha_creacion]);

        res.status(200).json({ message: "Register Successful"});
        
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/auth/google", async (req, res) => {
    if (req.body && req.body.email && req.body.username) {
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT * FROM registers WHERE email = ?", [req.body.email]);

        if (emailExists.length > 0) {
            if(emailExists[0].numero_identidad == "google" && emailExists[0].numero_telefono == "google"){
                if(req.body.numero_identidad && req.body.numero_telefono){
                    await connection.query("UPDATE registers SET numero_identidad = ?, numero_telefono = ?, estado = ? WHERE email = ?", [req.body.numero_identidad, req.body.numero_telefono, true, req.body.email]);
                    return res.status(200).json({ status: "Good Request", message: "Login Successful", id: emailExists[0].id });
                }
                return res.status(200).json({ status: "Good Request Incomplete", message: "Login Successful", id: emailExists[0].id });
            }

            return res.status(200).json({ status: "Good Request", message: "Login Successful", id: emailExists[0].id });
        } else {
            let user_id;
            let isAvailable = false;
            let attempts = 0;
            let min = 9999;
            let max = 999999;
            const maxAttempts = 100; 
    
            while (!isAvailable && attempts < maxAttempts) {
                user_id = Math.floor(Math.random() * max) + min;
    
                const userIdExists = await connection.query("SELECT id FROM registers WHERE id = ?", [user_id]);
                if (userIdExists.length === 0) {
                    isAvailable = true;
                }
    
                attempts++;
            }
    
            if (attempts >= maxAttempts) {
                return res.status(500).json({ message: "Unable to generate a unique ID" });
            }

            let year = new Date().getFullYear().toString().split("");
            year = year[year.length - 2] + year[year.length - 1]
            let fecha_creacion = (new Date().getDate() < 10 ? "0" + new Date().getDate() : new Date().getDate()) + "/" + (new Date().getMonth() < 10 ? "0" + (new Date().getMonth() + 1) : new Date.getMonth() + 1) + "/" + year;
    
            let digits_card = [];
            let number_card = "";
            let attemps_card = 100;
            
            for(let i = 0; i < 4; i++){
                let randomDigits = Math.floor(Math.random() * 9000) + 1000;
                digits_card.push(randomDigits);     
                
                if(attemps_card == 0){
                    number_card = "No se permite"
                    break;
                }
    
                if(i == 3){
                    number_card += randomDigits
                    let card_users = await connection.query("SELECT * FROM users WHERE number_card = ?",[number_card]);
    
                    if(card_users.length > 0){
                        number_card = "";
                        digits_card = [];
                        attemps_card --;
                        i = -1;
                    }
    
                }else{
                    number_card += randomDigits + " "
                }
            }

            await connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, "google", "google", "google", true, fecha_creacion]);
            await connection.query("INSERT INTO users (id_user, name_user, email_user, number_card, saldo_disponible, fecha_update) VALUES (?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, number_card, "0", fecha_creacion]);
        
            return res.status(200).json({ status: "Good Request", message: "Register Successful", id: user_id});
        }
    } else {
        return res.status(400).json({ status: "Bad Request", message: "Bad Request" });
    }
})

app.post("/update/data", async (req, res) => {
    if(req.body){
        const id_user = req.body.id_user;
        const id = req.body.id;
        const phone = req.body.phone;
        const username = req.body.username;
        const email = req.body.email;

        const connection = await database.getConnection();
        const res_update_registers = await connection.query("UPDATE registers SET numero_telefono = ?, numero_identidad = ?, username = ?, email = ? WHERE id = ?", [phone, id, username, email, id_user]);
        const res_update_users = await connection.query("UPDATE users SET name_user = ?, email_user = ? WHERE id_user = ?", [username, email, id_user]);

        if(res_update_registers && res_update_users){
            res.status(200).json({ message: "Update Successful"});
        }else{
            res.status(400).json({ message: "Bad Request" });
        }
    }
});

app.post("/login/auth", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email, password, id FROM registers WHERE email = ?", [req.body.email]);

        if (!emailExists.length > 0) {
            res.status(400).json({ message: "Correo electrónico incorrecto." });
        } else {
            const hashedPassword = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);

            if (emailExists[0].password === hashedPassword) {
                connection.query("UPDATE registers SET estado = ? WHERE email = ?", [true, req.body.email]);
                res.status(200).json({ message: "Login Successful", id: emailExists[0].id});
            } else {
                res.status(400).json({ message: "Contraseña incorrecta." });
            }
        }
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/user/loan", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const email_user = req.body.email_user;
        const id_loan = req.body.id_loan;

        const tasa_loan = req.body.tasa_loan;
        const cuotas = req.body.cuotas;
        const frecuencia = req.body.frecuencia;
        const name_loan = req.body.name_loan;
        const numero_telefono_loan = req.body.numero_telefono_loan;
        const action_loan = req.body.action_loan;        
        const tasa_fija = req.body.tasa_fija;
        const tasa_variable = req.body.tasa_variable;

        const data_user_basic = await connection.query("SELECT * FROM easycredit.users WHERE email_user = ?", [email_user]);
        const data_user_import = await connection.query("SELECT * FROM easycredit.registers WHERE email = ?", [email_user]);

        if(data_user_basic.length > 0 && data_user_import.length > 0){
            if(data_user_basic[0].id_user == req.body.id_client){
                let is_id = id_loan == data_user_import[0].numero_identidad;
                if(is_id){
                    let sumary_action = parseFloat(action_loan) + parseFloat(data_user_basic[0].saldo_disponible);
                    
                    await connection.query("INSERT INTO prestamos(id_user, name_loan, numero_telefono_loan, tasa_interes, cuotas, frencuencia_pago, action_prestamo, tasa_variable, tasa_fija) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data_user_basic[0].id_user, name_loan, numero_telefono_loan, tasa_loan, cuotas, frecuencia, action_loan, tasa_variable, tasa_fija]);            
                    
                    let movements = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_basic[0].id_user]);
                    let notifications = await connection.query("SELECT * FROM easycredit.notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_basic[0].id_user]);
                    let date_now_string = getDateNow();
                    
                    let id_movement = await generateIdMovements(connection);
                    let id_notification = await generateIdNotifications(connection);

                    if(id_movement == null){
                        res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del origen" });
                    }

                    let message_origin = `Hizo un prestamo por un monto de ${action_loan}$.`;
                    await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement, data_user_basic[0].id_user, "Bank" ,movements.length + 1, "Bank Loan", date_now_string, action_loan, "positivo", message_origin]);
                    await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification, data_user_basic[0].id_user, "Bank" ,notifications.length + 1, "Bank Loan", date_now_string, action_loan, "positivo", message_origin]);

                    await connection.query("UPDATE users SET saldo_disponible=? ,ingresos_totales=?  WHERE id_user = ?", [sumary_action, sumary_action, data_user_basic[0].id_user]);
                    res.status(200).json({ message: "Loan Successful" });
                }else{
                    res.status(400).send({ state: "Bad Request", message: "Numero de Identificacion Invalido." });
                }
            }else{
                res.status(400).send({ state: "Bad Request", message: "Correo Electronico no valido." });
            }
        }else{
            res.status(400).send({ state: "Bad Request", message: "Correo Electronico no valido." });
        }
    }else{
        res.status(400).send({ state: "Bad Request" });
    }
});

app.post("/user/transfer", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const origin = req.body.origin;
        const destino_id = req.body.numero_card;
        const action = req.body.action;
        const message = req.body.message;

        let numero_card = convertCard("", destino_id);

        const data_user_register_origin = await connection.query("SELECT * FROM easycredit.registers WHERE id = ?", [origin]);

        if(data_user_register_origin.length > 0){
            const data_user_origin = await connection.query("SELECT * FROM easycredit.users WHERE id_user = ?", [data_user_register_origin[0].id]);

            if(data_user_origin.length > 0){

                if(data_user_origin[0].number_card != numero_card){

                    if(parseFloat(data_user_origin[0].saldo_disponible) >= parseFloat(action)){
                        const data_user_register_destino = await connection.query("SELECT * FROM easycredit.users WHERE number_card = ?", [numero_card]);
    
                        if(data_user_register_destino.length > 0){
                            let saldo_disponible_destino = data_user_register_destino[0].saldo_disponible;
                            let saldo_enviado_destino = parseFloat(saldo_disponible_destino) + parseFloat(action);

                            let saldo_disponible_origen = data_user_origin[0].saldo_disponible;
                            let saldo_restado_origen = parseFloat(saldo_disponible_origen) - parseFloat(action);
                            
                            
                            //Actulizamos los saldos de ambos
                            await connection.query("UPDATE users SET saldo_disponible=? ,ingresos_totales=?  WHERE id_user = ?", [saldo_enviado_destino, saldo_enviado_destino, data_user_register_destino[0].id_user]);
                            await connection.query("UPDATE users SET saldo_disponible=? ,ingresos_totales=?  WHERE id_user = ?", [saldo_restado_origen, saldo_restado_origen, data_user_origin[0].id_user]);
                            
                            //Agregamos movimientos a ambos y notificaciones

                            //Movimiento para el destino
                            let date_now_string_destino = getDateNow();
                            let movements_destino = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_register_destino[0].id_user]);
                            let notifications_destino = await connection.query("SELECT * FROM easycredit.notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_register_destino[0].id_user]);
                            
                            let id_movement_destino = await generateIdMovements(connection);
                            let id_notification_destino = await generateIdNotifications(connection);

                            if(id_movement_destino == null || id_notification_destino == null){
                                res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del destino" });
                            }

                            await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement_destino, data_user_register_destino[0].id_user, data_user_origin[0].name_user ,movements_destino.length + 1, "Transfer", date_now_string_destino, action, "positivo", message]);
                            await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification_destino, data_user_register_destino[0].id_user, data_user_origin[0].name_user ,notifications_destino.length + 1, "Transfer", date_now_string_destino, action, "positivo", message]);

                            //Movimiento para el origen
                            let date_now_string_origin = getDateNow();
                            let movements_origin = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_origin[0].id_user]);
                            let notifications_origin = await connection.query("SELECT * FROM easycredit.notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_origin[0].id_user]);
                                                        
                            let id_movement_origin = await generateIdMovements(connection);
                            let id_notification_origin = await generateIdNotifications(connection);

                            if(id_movement_origin == null || id_notification_origin == null){
                                res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del origen" });
                            }
                            let message_origin = `Enviaste una transferencia al usuario con el numero de tarjeta: ${numero_card} por un monto de ${action}$.`;
                            await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement_origin, data_user_origin[0].id_user, data_user_origin[0].name_user ,movements_origin.length + 1, "Transfer", date_now_string_origin, action, "negativo", message_origin]);
                            await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification_origin, data_user_origin[0].id_user, data_user_origin[0].name_user ,notifications_destino.length + 1, "Transfer", date_now_string_destino, action, "negativo", message]);

                            res.status(200).json({ message: "Transfer Successful" });
                        }else{
                            res.status(400).send({ state: "Bad Request", message: "No se encontro el numero de tarjeta del destino en usuarios" });
                        }
                    }else{
                        res.status(400).send({ state: "Bad Request", message: "Saldo Insuficiente" });
                    }
                }else{
                    res.status(400).send({ state: "Bad Request", message: "No puedes usar tu propio ID" });
                }
            }else{
                res.status(400).send({ state: "Bad Request", message: "Numero de Identificacion Invalido." });
            }
        }else{
            res.status(400).send({ state: "Bad Request", message: "Email de origen desconocido" });
        }
    }else{
        res.status(400).send({ state: "Bad Request", message: "No se encontro ningun body" });
    }
});

app.post("/email/send_code", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let email = req.body.email;
        let emailExists = await connection.query("SELECT email FROM easycredit.registers WHERE email = ?", [email]);
        if(!emailExists.length > 0){
            res.status(400).send({ state: "Bad Request", message: "Email no registrado." });
            return;
        }

        let attemps_code_recover = 100;
        let randomCode;
        let isAvailable = false;
        let response_user_code;

        while(isAvailable == false){
            randomCode = Math.floor(100000 + Math.random() * 900000)
            response_user_code = await connection.query("SELECT * FROM easycredit.codes WHERE code = ?",[randomCode]);
            if(response_user_code.length > 0){
                attemps_code_recover --;
            }

            if(response_user_code.length == 0 || attemps_code_recover == 0){
                isAvailable = true;
            }
        }

        if(attemps_code_recover == 0 || response_user_code.length != 0){
            res.status(400).send({ state: "Bad Request", message: "No se pudo generar un código único" });
            return;
        }

        let isExist = await connection.query("SELECT * FROM codes WHERE email = ?", [email]);

        if(isExist.length > 0){
            await connection.query("UPDATE codes SET code = ? WHERE email = ?", [randomCode, email]);
        }else{
            await connection.query("INSERT INTO codes(email, code) VALUES (?, ?)", [email, randomCode]);
        }

        const htmlMessage = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Código de Recuperación</title>
            </head>
            <body style="background-color: #f2f2f2; padding: 20px;">
            
            <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="padding: 20px;">
                    <h1 style="color: #333; text-align: center;">Código de Recuperación</h1>
                    <table style="margin: auto;">
                        <tr>
                            <!-- Aquí generamos dinámicamente las celdas para cada dígito del código -->
                            ${randomCode
                                .toString()
                                .split('')
                                .map(digit => `
                                    <td style="border: 2px solid rgba(50, 205, 50, 0.5); border-radius: 4px; width: 40px; height: 40px; font-size: 24px; text-align: center; color: #666;">${digit}</td>
                                `)
                                .join('')
                            }
                        </tr>
                    </table>
                    <p style="color: #666; font-size: 16px; text-align: center; margin-top: 20px;">Utiliza este código para recuperar tu contraseña.</p>
                </div>
            </div>
            
            </body>
            </html>
            
        `;
    
        let subject = "Recuperar Contraseña";

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "easycredit4321@gmail.com",
                pass: "cvmovrshtbmlpusa"
            }
        });

        let mailOptions = {
            from: 'sebastiangarces152@gmail.com', 
            to: email, 
            subject: subject,
            html: htmlMessage
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(400).send({ state: "Bad Request", message: "No se pudo enviar el correo"});
                return;
            } else {
                res.status(200).send({ state: "Good Request", message: "Correo Enviado", code: randomCode, attemps: attemps_code_recover});
                return;
            }
        });
    }
});

app.post("/email/send_loan", async (req, res) => {
    if(req.body){
        const {htmlMessage, subject, email} = req.body;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "easycredit4321@gmail.com",
                pass: "cvmovrshtbmlpusa"
            }
        });

        let mailOptions = {
            from: 'sebastiangarces152@gmail.com', 
            to: email, 
            subject: subject,
            html: htmlMessage
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(400).send({ state: "Bad Request", message: "No se pudo enviar el correo"});
                return;
            } else {
                res.status(200).send({ state: "Good Request", message: "Correo Enviado"});
                return;
            }
        });
    }
});

app.post("/email/send_transfer", async (req, res) => {
    if(req.body){
        const {action, origin, message, numero_card, subject} = req.body;
        let numero_card_formatted = "";
        console.log(numero_card);

        for(let i = 0; i < numero_card.length; i++){
            if(i != numero_card.length - 1){
                numero_card_formatted += numero_card[i] + "-";
                continue;
            }
            numero_card_formatted += numero_card[i];
        }

        const connection = await database.getConnection();
        const data_user_origin = await connection.query("SELECT * FROM users WHERE id_user = ?", [origin]);

        const name_origin = data_user_origin[0].name_user;
        const email = data_user_origin[0].email_user;

        const htmlMessage = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Notificación de Transferencia</title>
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
                <h1>Notificación de Transferencia</h1>
                <p>Estimado <strong>${name_origin}</strong>,</p>
                <p>Se ha realizado una transferencia desde su cuenta hacia el número de tarjeta <span style="font-weight: bold;">${numero_card_formatted}</span>.</p>
            </div>
            
            <div class="details">
                <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Detalles de la Transferencia</h2>
                <table>
                    <tr>
                        <td><strong>Acción:</strong></td>
                        <td>${action}</td>
                    </tr>
                    <tr>
                        <td><strong>Origen:</strong></td>
                        <td>${name_origin}</td>
                    </tr>
                    <tr>
                        <td><strong>Mensaje:</strong></td>
                        <td>${message}</td>
                    </tr>
                    <tr>
                        <td><strong>Número de Tarjeta:</strong></td>
                        <td>${numero_card_formatted}</td>
                    </tr>
                </table>
            </div>
            
            <p class="thanks">¡Gracias por elegir EasyCredit!</p>
        </div>
        
        </body>
        </html>
        
        
        `;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "easycredit4321@gmail.com",
                pass: "cvmovrshtbmlpusa"
            }
        });

        let mailOptions = {
            from: 'sebastiangarces152@gmail.com', 
            to: email, 
            subject: subject,
            html: htmlMessage
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(400).send({ state: "Bad Request", message: "No se pudo enviar el correo"});
                return;
            } else {
                res.status(200).send({ state: "Good Request", message: "Correo Enviado"});
                return;
            }
        });
    }
});

app.post("/email/send_movement", async (req, res) => {
    if(req.body){
        const {htmlMessage, subject, email} = req.body;
        const connection = await database.getConnection();

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "easycredit4321@gmail.com",
                pass: "cvmovrshtbmlpusa"
            }
        });

        let mailOptions = {
            from: 'sebastiangarces152@gmail.com', 
            to: email, 
            subject: subject,
            html: htmlMessage
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                res.status(400).send({ state: "Bad Request", message: "No se pudo enviar el correo"});
                return;
            } else {
                res.status(200).send({ state: "Good Request", message: "Correo Enviado"});
                return;
            }
        });

        let date = new Date();
        date.setDate(date.getDate() + 3);
        date = date.toLocaleDateString().split("-");
        date[0] = date[0] % 100;
        date = date.reverse().join("/")

        await connection.query("UPDATE users SET fecha_update = ? WHERE email_user = ?", [date, email]);
    }
});

app.post("/email/verify", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let code = req.body.code;

        let response_user_code = await connection.query("SELECT * FROM easycredit.codes WHERE code = ?",[code]);

        if(response_user_code.length > 0){
            res.status(200).send({ state: "Good Request", message: "Código Correcto", email: response_user_code[0].email});
        }else{
            res.status(400).send({ state: "Bad Request", message: "Código Incorrecto" });
        }
    }
});

app.post("/EA/send_loan", async (req, res) => {
    if(req.body){

    }
});

app.post("/password/change", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let email = req.body.email;
        let password = req.body.password;

        const user = await connection.query("SELECT password FROM registers WHERE email = ?", [email]);
        const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);

        if (user.length === 0) {
            return res.status(400).send({ state: "Bad Request", message: "No se encontró ningún usuario con este correo electrónico" });
        }

        if (user[0].password === hashedPassword) {
            return res.status(400).send({ state: "Bad Request", message: "La nueva contraseña no puede ser igual a la anterior" });
        }

        await connection.query("UPDATE registers SET password = ? WHERE email = ?", [hashedPassword, email]);
        await connection.query("DELETE FROM codes WHERE email = ?", [email]);

        res.status(200).send({ state: "Good Request", message: "Contraseña Cambiada" });
    } else {
        res.status(400).send({ state: "Bad Request" });
    }
});

app.post("/create/information", async (req, res) => {
    try {
      if (req.body) {
        const connection = await database.getConnection();
        const id = req.body.id;
  
        function randomDate(start, end) {
          return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }
  
        async function generateQueries(numQueries) {
          const actionTypes = ['Bank Loan', 'Transfer'];
          const states = ['positivo', 'negativo'];
  
          const query = "INSERT INTO movements (id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  
          for (let i = 0; i < numQueries; i++) {
            const id_movement = await generateIdMovements(connection);
            if(id_movement == null){
                return res.status(404).send({message: "Invalid Id User"})
            }
            const id_user = id;
            const index_movement = i + 1;
            const tipo_movement = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            const fecha_movement = randomDate(new Date(2020, 0, 1), new Date());
            const action_movement = Math.floor(Math.random() * 10000000) + 0;
            const state_movement = states[Math.floor(Math.random() * states.length)];
  
            await connection.query(query, [id_movement, id_user, "Bank", index_movement, tipo_movement, fecha_movement.toISOString().slice(0, 10), action_movement, state_movement]);
          }
        }
  
        await generateQueries(20);
  
        res.status(200).json({ status: "Good Request",  message: "Consultas insertadas correctamente" });
      } else {
        res.status(400).json({ status: "Bad Request", error: "No se proporcionó ningún cuerpo en la solicitud" });
      }
    } catch (error) {
      res.status(500).json({ status: "Bad Request", error: "Ocurrió un error al procesar la solicitud" });
    }
});

app.post("/delete/information", async (req, res) => {
    try {
        if (req.body) {
        const connection = await database.getConnection();
        const id = req.body.id;

        const query = "DELETE FROM movements WHERE id_user = ?";

        await connection.query(query, [id]);

        res.status(200).json({ status: "Good Request", message: "Información eliminada correctamente" });
        } else {
        res.status(400).json({ status: "Bad Request", error: "No se proporcionó ningún cuerpo en la solicitud" });
        }
    } catch (error) {
        res.status(500).json({ status: "Bad Request", error: "Ocurrió un error al procesar la solicitud" });
    }
});

app.post("/delete/notification", async (req, res) => {
    if(req.body){
        const {id} = req.body;
        const connection = await database.getConnection();
        const response_delete_notification = await connection.query("DELETE FROM notifications WHERE id_notification = ?", [id]);

        if(response_delete_notification){
            res.status(200).send({ state: "Good Request", message: "Notificación Eliminada" });
        }else{
            res.status(400).send({ state: "Bad Request", message: "No se pudo eliminar la notificación" });
        
        }
    }
});

app.post("/delete/movement", async (req, res) => {
    if(req.body){
        const {id} = req.body;
        const connection = await database.getConnection();
        const response_delete_movement = await connection.query("DELETE FROM movements WHERE id_movement = ?", [id]);

        if(response_delete_movement){
            res.status(200).send({ state: "Good Request", message: "Movimiento Eliminado" });
        }else{
            res.status(400).send({ state: "Bad Request", message: "No se pudo eliminar el movimiento" });
        }
    }
});

app.post("/delete/allnotifications", async (req, res) => {
    if(req.body){
        const {id_notifications} = req.body;

        const connection = await database.getConnection();

        for(let i = 0; i < id_notifications.length; i++){
            const response_delete_notification = await connection.query("DELETE FROM notifications WHERE id_notification = ?", [id_notifications[i]]);

            if(!response_delete_notification){
                return res.status(400).send({ state: "Bad Request", message: "No se pudieron eliminar las notificaciones" });
            }
        }

        return res.status(200).send({ state: "Good Request", message: "Notificaciones Eliminados" });
    }
});

app.post("/delete/allmovements", async (req, res) => {
    if(req.body){
        const {id_movements} = req.body;

        const connection = await database.getConnection();

        for(let i = 0; i < id_movements.length; i++){
            const response_delete_movement = await connection.query("DELETE FROM movements WHERE id_movement = ?", [id_movements[i]]);

            if(!response_delete_movement){
                return res.status(400).send({ state: "Bad Request", message: "No se pudieron eliminar los movimientos" });
            }
        }

        return res.status(200).send({ state: "Good Request", message: "Movimientos Eliminados" });
    }
});
  
app.get("/user/exists", async (req, res) => {

    const id_user = req.query.id_user;

    if (!id_user) {
        return res.status(400).send({ message: "User Email is required" });
    }

    const connection = await database.getConnection();
    const user = await connection.query("SELECT * FROM easycredit.users WHERE id_user = ?", [id_user]);

    if(user.length > 0){
        res.status(200).send({ state: "Good Request", message: "Usuario Encontrado" });
    }else{
        res.status(400).send({ state: "Bad Request", message: "Usuario no encontrado" });
    }

});

app.get("/user/data", async (req, res) => {
    const id_user = req.query.id_user;

    if (!id_user) {
        return res.status(400).send({ message: "User Email is required" });
    }

    const connection = await database.getConnection();
    const data_user_info = await connection.query("SELECT * FROM easycredit.users WHERE id_user = ?", [id_user]);
    const data_user_register = await connection.query("SELECT * FROM easycredit.registers WHERE id = ?", [id_user]);
    const data_user_notifications = await connection.query("SELECT * FROM easycredit.notifications WHERE id_user = ?", [id_user]);
    let data_user_movements_incomplete;
    let data_user_movements;
    if(data_user_info[0] && data_user_info[0].id_user){
        data_user_movements_incomplete = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? LIMIT 4", [data_user_info[0].id_user]);
        data_user_movements = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ?", [data_user_info[0].id_user]);
    }
    const data = {
        user_info: data_user_info,
        user_register: data_user_register,
        user_notifications: data_user_notifications,
        user_movements_incomplete: data_user_movements_incomplete,
        user_movements_complete: data_user_movements,
    };

    if (data) {
        res.json(data);
    } else {
        res.status(404).send({ message: "User not found" });
    }
});

app.get("/movements/one_movement", async (req, res) => {
    const id_movement = req.query.id_movement;

    if(!id_movement){
        return res.status(404).send({message:"El ID de la actividad es requerido."})
    }

    const connection = await database.getConnection();
    const data_movement = await connection.query("SELECT * FROM movements WHERE id_movement = ?", [id_movement]);

    if(data_movement.length > 0){
        return res.status(200).send(data_movement);
    }else{
        return res.status(404).send({message:"La actividad no existe o aún no ha sido registrada por el usuario"});
    }

});

app.get("/words", async (req, res) => {
    const connection = await database.getConnection();
    const words = await connection.query("SELECT * FROM easycredit.words ORDER BY word ASC");
    if(words.length > 0){
        res.json(words);
    }else{
        res.status(400).send({ message: "Bad Request" });
    }
});

server.listen(app.get("port"));
console.log("Escuchando el puerto " + app.get("port"));

//Functions
function getDateNow(){
    return new Date().getFullYear() + "-" + (new Date().getUTCMonth() < 9 ? "0" + (new Date().getUTCMonth() + 1) : (new Date().getUTCMonth() + 1)) + "-" + (new Date().getUTCDate() - 1);
}

function convertCard(number_card_string, number_card_array){
    number_card_string = "";
    for(let i = 0; i < number_card_array.length; i++){
        number_card_string += i != 3 ? number_card_array[i] + " " : number_card_array[i];
    }
    return number_card_string
}

async function generateIdMovements(connection){
    let id_movement_destino = Math.floor(Math.random() * 900000000) + 100000000;
    let exist_id_movement_destino = await connection.query("SELECT * FROM easycredit.movements WHERE id_movement = ?", [id_movement_destino]);
    let max_attemps_id_destino = 100;
    while(exist_id_movement_destino.length > 0 && max_attemps_id_destino > 0){
        id_movement_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_id_movement_destino = await connection.query("SELECT * FROM easycredit.movements WHERE id_movement = ?", [id_movement_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return id_movement_destino;
    }
}

async function generateIdNotifications(connection){
    let id_notification_destino = Math.floor(Math.random() * 900000000) + 100000000;
    let exist_id_notification_destino = await connection.query("SELECT * FROM easycredit.notifications WHERE id_notification = ?", [id_notification_destino]);
    let max_attemps_id_destino = 100;
    while(exist_id_notification_destino.length > 0 && max_attemps_id_destino > 0){
        id_notification_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_id_notification_destino = await connection.query("SELECT * FROM easycredit.notifications WHERE id_notification = ?", [id_notification_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return id_notification_destino;
    }
}