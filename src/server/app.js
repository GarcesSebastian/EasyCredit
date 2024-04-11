import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";
import bcrypt from 'bcrypt';
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
      const allowedOrigins = ['http://localhost:4321', 'http://localhost:4322', "https://1rhbb29z-4321.use2.devtunnels.ms", "https://c2hccs03-4321.use2.devtunnels.ms"];
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

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const hashedNumero_telefono = await bcrypt.hash(req.body.numero_telefono, 10);
        const hashedNumero_identidad = await bcrypt.hash(req.body.numero_identidad, 10);

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
        
        connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, hashedPassword, hashedNumero_identidad, hashedNumero_telefono, false, fecha_creacion]);
        connection.query("INSERT INTO users (id_user, name_user, email_user, number_card, saldo_disponible) VALUES (?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, number_card, "0"]);
        connection.query("INSERT INTO notifications (id_user, name_user, email_user, numero_notifications) VALUES (?, ?, ?, ?)", [user_id, req.body.username, req.body.email, 0]);
        connection.query("INSERT INTO movements (id_user, email_user, numero_movements) VALUES (?, ?, ?)", [user_id, req.body.email, 0]);

        res.status(200).json({ message: "Register Successful"});
        
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/login/auth", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email, password, id FROM registers WHERE email = ?", [req.body.email]);

        if (!emailExists.length > 0) {
            res.status(400).json({ message: "Correo electrónico incorrecto." });
        } else {
            const hashedPassword = emailExists[0].password;

            const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

            if (passwordMatch) {
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
                let is_id = await bcrypt.compare(id_loan,data_user_import[0].numero_identidad || 0);
                if(is_id){
                    let sumary_action = parseFloat(action_loan) + parseFloat(data_user_basic[0].saldo_disponible);
                    
                    await connection.query("INSERT INTO prestamos(id_user, name_loan, numero_telefono_loan, tasa_interes, cuotas, frencuencia_pago, action_prestamo, tasa_variable, tasa_fija) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [data_user_basic[0].id_user, name_loan, numero_telefono_loan, tasa_loan, cuotas, frecuencia, action_loan, tasa_variable, tasa_fija]);            
                    
                    let movements = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_basic[0].id_user]);
                    let date_now_string = getDateNow();
                    
                    await connection.query("INSERT INTO movements(id_user, index_movement, tipo_movement, fecha_movement, action_movement, state_movement) VALUES ( ?, ?, ?, ?, ?, ?)", [data_user_basic[0].id_user, movements.length + 1, "Bank Loan", date_now_string, action_loan, "positivo"]);
                    
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
        console.log(origin);
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
                            
                            await connection.query("INSERT INTO movements(id_user, index_movement, tipo_movement, fecha_movement, action_movement, state_movement) VALUES ( ?, ?, ?, ?, ?, ?)", [data_user_register_destino[0].id_user, movements_destino.length + 1, "Transfer", date_now_string_destino, action, "positivo"]);
            
                            //Movimiento para el origen
                            let date_now_string_origin = getDateNow();
                            let movements_origin = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_origin[0].id_user]);
                            
                            await connection.query("INSERT INTO movements(id_user, index_movement, tipo_movement, fecha_movement, action_movement, state_movement) VALUES ( ?, ?, ?, ?, ?, ?)", [data_user_origin[0].id_user, movements_origin.length + 1, "Transfer", date_now_string_origin, action, "negativo"]);

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

app.post("/email/send", async (req, res) => {
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
                user: "sebastiangarces152@gmail.com",
                pass: "ocxogzwntaaacecg"
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
                res.status(400).send({ state: "Bad Request", message: "No se pudo enviar el correo" });
                return;
            } else {
                res.status(200).send({ state: "Good Request", message: "Correo Enviado", code: randomCode, attemps: attemps_code_recover});
                return;
            }
        });
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

app.post("/password/change", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let email = req.body.email;
        let password = req.body.password;

        const user = await connection.query("SELECT password FROM registers WHERE email = ?", [email]);
        const isSamePassword = await bcrypt.compare(password, user[0].password);
        if (isSamePassword) {
            return res.status(400).send({ state: "Bad Request", message: "La nueva contraseña no puede ser igual a la anterior" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await connection.query("UPDATE registers SET password = ? WHERE email = ?", [hashedPassword, email]);
        await connection.query("DELETE FROM codes WHERE email = ?", [email]);

        res.status(200).send({ state: "Good Request", message: "Contraseña Cambiada" });
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
  
          const query = "INSERT INTO movements (id_user, index_movement, tipo_movement, fecha_movement, action_movement, state_movement) VALUES (?, ?, ?, ?, ?, ?)";
  
          for (let i = 0; i < numQueries; i++) {
            const id_user = id;
            const index_movement = i + 1;
            const tipo_movement = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            const fecha_movement = randomDate(new Date(2020, 0, 1), new Date());
            const action_movement = Math.floor(Math.random() * 10000000) + 0;
            const state_movement = states[Math.floor(Math.random() * states.length)];
  
            await connection.query(query, [id_user, index_movement, tipo_movement, fecha_movement.toISOString().slice(0, 10), action_movement, state_movement]);
          }
        }
  
        await generateQueries(20);
  
        res.status(200).json({ status: "Good Request",  message: "Consultas insertadas correctamente" });
      } else {
        res.status(400).json({ status: "Bad Request", error: "No se proporcionó ningún cuerpo en la solicitud" });
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
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
        console.error("Error al procesar la solicitud:", error);
        res.status(500).json({ status: "Bad Request", error: "Ocurrió un error al procesar la solicitud" });
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
    return new Date().getFullYear() + "-" + (new Date().getUTCMonth() < 9 ? "0" + (new Date().getUTCMonth() + 1) : (new Date().getUTCMonth() + 1)) + "-" + new Date().getUTCDate();
}

function convertCard(number_card_string, number_card_array){
    number_card_string = "";
    for(let i = 0; i < number_card_array.length; i++){
        number_card_string += i != 3 ? number_card_array[i] + " " : number_card_array[i];
    }
    return number_card_string
}