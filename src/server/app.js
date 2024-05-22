import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";
import CryptoJS from 'crypto-js';
import { createServer } from 'node:http';
// import { Server } from 'socket.io';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import puppeteer from 'puppeteer';
import { americaCountries } from '../Json/Countrys.js';

const app = express();
const server = createServer(app);

const port = process.env.PORT || 4000;
const minutesActivity = 10;
const minutesUpdate = 10;

// Configuración inicial
app.set("port", port);

// Middlewares
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
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

        let fecha_activity = new Date(new Date().getTime() + minutesActivity * 60000);
        let fecha_update = new Date(new Date().getTime() + minutesUpdate * 60000);
        let fecha_creacion = new Date();

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
        
        let ingreso_mensual = req.body.ingreso_mensual;
        let NI = ingreso_mensual - req.body.gasto_mensual; //Ingreso neto mensual
        let capacidad = 0.35;
        let CPM = NI * capacidad; //Capacidad pago mensual
        
        await connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, hashedPassword, req.body.numero_identidad, req.body.numero_telefono, false, fecha_creacion]);
        await connection.query("INSERT INTO users (id_user, name_user, email_user, number_card, saldo_disponible, fecha_update, fecha_activity, history_credit, limit_prestamo, limit_monto, discount_tasa, level_account, multiplier, ingreso_mensual, gasto_mensual, is2fa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, number_card, "0", fecha_update, fecha_activity, 0, 3, CPM.toString(), 0, 1, 1, req.body.ingreso_mensual, req.body.gasto_mensual, false]);

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

            let fecha_activity = new Date(new Date().getTime() + minutesActivity * 60000);
            let fecha_update = new Date(new Date().getTime() + minutesUpdate * 60000);
            let fecha_creacion = new Date();

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

            const data_register = await connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado, fecha_creacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, "google", "google", "google", true, fecha_creacion]);
            const data_user = await connection.query("INSERT INTO users (id_user, name_user, email_user, number_card, saldo_disponible, fecha_update, fecha_activity, history_credit, limit_prestamo, limit_monto, discount_tasa, level_account, multiplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, number_card, "0", fecha_update, fecha_activity, 0, 3, 0, 0, 1, 1]);
        
            if(!data_register || !data_user){
                return res.status(400).json({ status: "Bad Request", message: "Ocurrio un error al registrarse."});
            }

            return res.status(200).json({ status: "Good Request", message: "Register Successful", id: user_id});
        }
    } else {
        return res.status(400).json({ status: "Bad Request", message: "Bad Request" });
    }
})

app.post("/update/data", async (req, res) => {
    if(req.body){
        const {id_user, id, phone, username, email, income_monthly, bills_monthly} = req.body;

        let NI = income_monthly - bills_monthly; //Ingreso neto mensual
        let CPM = NI * 0.35; //Capacidad pago mensual

        const connection = await database.getConnection();
        const res_update_registers = await connection.query("UPDATE registers SET numero_telefono = ?, numero_identidad = ?, username = ?, email = ? WHERE id = ?", [phone, id, username, email, id_user]);
        const res_update_users = await connection.query("UPDATE users SET name_user = ?, email_user = ?, ingreso_mensual = ?, gasto_mensual = ?, limit_monto = ? WHERE id_user = ?", [username, email, income_monthly, bills_monthly, CPM, id_user]);

        if(res_update_registers && res_update_users){
            res.status(200).json({ message: "Update Successful"});
        }else{
            res.status(400).json({ message: "Bad Request" });
        }
    }
});

app.post("/update/date", async (req, res) => {
    if(req.body){
        const {fecha_activity, fecha_update, id_user} = req.body;

        const connection = await database.getConnection();
        let res_update_users;
        if(fecha_activity){
            res_update_users = await connection.query("UPDATE users SET fecha_activity = ? WHERE id_user = ?", [fecha_activity, id_user]);
        }

        if(fecha_update){
            res_update_users = await connection.query("UPDATE users SET fecha_update = ? WHERE id_user = ?", [fecha_update, id_user]);
        }

        if(res_update_users || res_update_users){
            res.status(200).json({ state: "Good Request", message: "Update Successful"});
        }else{
            res.status(400).json({ state: "Good Request", message: "Bad Update" });
        }
    }
});

app.post("/update/user_loan", async (req, res) => {
    if(req.body){
        const {simulate, saldo, id_loan, id_user} = req.body;

        let history_credit = 0;

        const connection = await database.getConnection();

        const data_user_history_credit = await connection.query("SELECT history_credit, state_prestamo, limit_monto FROM users WHERE id_user = ?",[id_user])

        if(!data_user_history_credit.length > 0){
            return res.status(400).send({state: "Bad Request", message: "No se pudo encontrar el usuario con el id " + id_user})
        }

        history_credit += data_user_history_credit[0].history_credit;
        let state_prestamo = data_user_history_credit[0].state_prestamo;
        let limit_monto = Number(data_user_history_credit[0].limit_monto)

        if(!simulate.length > 0){
            const res_loan = await connection.query("DELETE FROM prestamos WHERE id_loan = ?",[id_loan]);

            if(!res_loan){
                return res.status(400).send({state: "Bad Request", message: "No se pudo eliminar el prestamo con el id " + id_loan})
            }

            history_credit += 10;
            state_prestamo -= 1;
        }else{
            const fecha_next = simulate[0].fecha;

            const res_loan = await connection.query("UPDATE prestamos SET simulate = ?, cuotas = ?, fecha_next = ? WHERE id_loan = ?",[JSON.stringify(simulate), simulate.length, fecha_next, id_loan]);

            if(!res_loan){
                return res.status(400).send({state: "Bad Request", message: "No se pudo acatualizar el prestamo con el id " + id_loan})
            }

            history_credit += 1;
        }

        let tasa_interes;
        let limit_prestamo;
        let level_account = 1;
        let multiplier = 1;        

        if(history_credit >= 0 && history_credit < 50){
            tasa_interes = 0.0;
            limit_prestamo = 3;
        }else if(history_credit >= 50 && history_credit < 75){
            tasa_interes = 0.5;
            limit_prestamo = 5;
            multiplier = 5;
            level_account = 2;
        }else if(history_credit >= 75 && history_credit < 100){
            tasa_interes = 1;
            limit_prestamo = 7;
            multiplier = 7;
            level_account = 3;
        }else if(history_credit >= 100){
            tasa_interes = 1.5;
            limit_prestamo = 10;
            multiplier = 10;
            level_account = 4;
        }

        const res_user = await connection.query("UPDATE users SET saldo_disponible = ?, history_credit = ?, limit_prestamo = ?, discount_tasa = ?, state_prestamo = ?, level_account = ?, multiplier = ? WHERE id_user = ?",[Number(saldo).toFixed(2).toString(), history_credit, limit_prestamo.toString(), tasa_interes, state_prestamo, level_account, multiplier, id_user])

        if(!res_user){
            return res.status(400).send({state: "Bad Request", message: "No se pudieron actualizar los datos."})
        }

        return res.status(200).send({state: "Good Request", message: "Los datos se pudieron actualizar."})
    }
});

app.post("/login/auth", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email, password, id FROM registers WHERE email = ?", [req.body.email]);
        const data_user = await connection.query("SELECT devices, is2fa FROM users WHERE email_user = ?",[req.body.email]);


        if (!emailExists.length > 0 || !data_user.length > 0) {
            res.status(400).json({ message: "Correo electrónico incorrecto." });
        } else {
            const hashedPassword = CryptoJS.SHA256(req.body.password).toString(CryptoJS.enc.Hex);

            if (emailExists[0].password === hashedPassword) {
                connection.query("UPDATE registers SET estado = ? WHERE email = ?", [true, req.body.email]);                

                if(data_user[0].is2fa){
                    let devices = data_user[0].devices;
    
                    if(!devices){
                        return res.status(200).json({ message: "Login Successful but not find device", id: emailExists[0].id, isFind: false});
                    }
    
                    const deviceId = req.body.deviceId;
                    devices = JSON.parse(devices)
    
                    const existElement = devices.some((element) => {
                        return element.device_id === deviceId;
                    });
    
                    if(!existElement){
                        return res.status(200).json({ message: "Login Successful but not find device", id: emailExists[0].id, isFind: false});
                    }
                }

                res.status(200).json({ message: "Login Successful", id: emailExists[0].id, isFind: true});
            } else {
                res.status(400).json({ message: "Contraseña incorrecta." });
            }
        }
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/2fa/auth", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let {email, deviceId, type_device} = req.body;
        
        console.log(email, deviceId, type_device)

        const get_info_ip = await fetch("https://ipinfo.io/json");
        const info_ip = await get_info_ip.json();
        const countryCode = info_ip.country;
        console.log(info_ip)


        const countryName = americaCountries[countryCode];
        console.log(countryName)

        const date_now = new Date();

        const get_devices = await connection.query("SELECT devices, id_user FROM users WHERE email_user = ?",[email]);

        if(!get_devices.length > 0){
            return res.status(400).json({ message: "Correo electrónico incorrecto." });;
        }

        let devices = [];

        if(get_devices[0].devices){
            devices = [...JSON.parse(get_devices[0].devices)]
        }else{
        }

        if(!devices.length > 0){
            const data_device = {
                device_id: deviceId,
                device_type: type_device,
            }

            devices.push(data_device);
            const send_auth_2fa = await connection.query("UPDATE users SET devices = ? WHERE email_user = ?",[JSON.stringify(devices), email]);

            if(!send_auth_2fa){
                return res.status(400).json({ message: "No se pudo insertar el dispositivo" });;
            }

            const create_history_2fa = await connection.query("INSERT INTO history_2fa (id_user, device, country, date, type) VALUES (?, ?, ?, ?, ?)",[get_devices[0].id_user, deviceId, countryName, date_now, type_device]);

            if(!create_history_2fa){
                return res.status(400).json({ message: "No se pudo insertar el historial del dispositivo" });;
            }

            return res.status(200).json({message: "Dispositivo insertado con exito"});
        }

        const existElement = devices.some((element) => {
            return element.device_id === deviceId;
        });

        if(existElement){
            return res.status(200).json({ message: "El dispositivo ya existe"});
        }

        const data_device = {
            device_id: deviceId,
            device_type: type_device,
        }
        
        devices.push(data_device);
        const send_auth_2fa = await connection.query("UPDATE users SET devices = ? WHERE email_user = ?",[JSON.stringify(devices), email]);

        if(!send_auth_2fa){
            return res.status(400).json({ message: "No se pudo insertar el dispositivo" });;
        }

        const create_history_2fa = await connection.query("INSERT INTO history_2fa (id_user, device, country, date, type) VALUES (?, ?, ?, ?, ?)",[get_devices[0].id_user, deviceId, countryName, date_now, type_device]);

        if(!create_history_2fa){
            return res.status(400).json({ message: "No se pudo insertar el historial del dispositivo" });;
        }

        return res.status(200).json({message: "Dispositivo insertado con exito"});
    }
});

app.post("/2fa/change", async (req, res) => {
    if(req.body){
        const {value, id_user} = req.body
        const connection = await database.getConnection();
        const send_value_2fa = await connection.query("UPDATE users SET is2fa = ? WHERE id_user = ?",[value, id_user]);

        console.log(send_value_2fa)

        if(!send_value_2fa){
            return res.status(400).send({message: "No se pudo actualizar el 2fa"})
        }

        return res.status(200).send({message: "El 2fa se actulizo correctamente"})
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

        const table = req.body.table;
        let state_prestamo = req.body.state_prestamo;

        const is_active = req.body.is_active;

        const data_user_basic = await connection.query("SELECT * FROM users WHERE email_user = ?", [email_user]);
        const data_user_import = await connection.query("SELECT * FROM registers WHERE email = ?", [email_user]);

        if(data_user_basic.length > 0 && data_user_import.length > 0){
            if(data_user_basic[0].id_user == req.body.id_client){
                let is_id = id_loan == data_user_import[0].numero_identidad;
                if(is_id){
                    let sumary_action = (parseFloat(action_loan) + parseFloat(data_user_basic[0].saldo_disponible)).toFixed(2);

                    let id_loan = await generateIdPrestamos(connection);
                    let excedent_now = await generateIdExcentedNow(connection);

                    if(id_loan == null){
                        return res.status(400).send({state: "Bad Request", message: "No se pudo generar el id del prestamo"})
                    }

                    let date_now = new Date();
                    let date_next = table[0].fecha;

                    await connection.query("INSERT INTO prestamos(id_loan, id_user, name_loan, numero_telefono_loan, tasa_interes, cuotas, frecuencia_pago, action_prestamo, tasa_variable, tasa_fija, fecha, fecha_next, excedent_now, simulate) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_loan, data_user_basic[0].id_user, name_loan, numero_telefono_loan, tasa_loan, cuotas, frecuencia, action_loan, tasa_variable, tasa_fija, date_now, date_next, excedent_now, JSON.stringify(table)]);            
                    
                    let movements = await connection.query("SELECT * FROM movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_basic[0].id_user]);
                    let notifications = await connection.query("SELECT * FROM notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_basic[0].id_user]);
                    let date_now_string = getDateNow();
                    
                    let id_movement = await generateIdMovements(connection);
                    let id_notification = await generateIdNotifications(connection);

                    if(id_movement == null){
                        res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del origen" });
                    }

                    let message_origin = `Hizo un prestamo por un monto de $${formatNumber(action_loan)}.`;
                    await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement, data_user_basic[0].id_user, "Bank" ,movements.length + 1, "Bank Loan", date_now, action_loan, "positivo", message_origin]);
                    await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification, data_user_basic[0].id_user, "Bank" ,notifications.length + 1, "Bank Loan", date_now, action_loan, "positivo", message_origin, is_active]);

                    state_prestamo += 1;
                    await connection.query("UPDATE users SET saldo_disponible = ?, state_prestamo = ? WHERE id_user = ?", [sumary_action, state_prestamo, data_user_basic[0].id_user]);
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

app.post("/validate/data", async (req, res) => {
    if(req.body){
        let {email, numero_identidad, numero_telefono} = req.body;

        const connection = await database.getConnection();
        let validate_email = await connection.query("SELECT email FROM registers WHERE email = ?",[email]);

        if(validate_email.length > 0){
            return res.status(400).send({ state: "Bad Request", message: "Correo electrónico ya registrado."});
        }

        let validate_numero_identidad = await connection.query("SELECT numero_identidad FROM registers WHERE numero_identidad = ?",[numero_identidad]);

        if(validate_numero_identidad.length > 0){
            return res.status(400).send({ state: "Bad Request", message: "Numero de Identificacion ya registrado."});
        }

        return res.status(200).send({stage: "Good Request", message: "Los datos no estan siendo usados."});
    }
});

app.post("/validate/code", async (req, res) => {
    if(req.body){
        let { code } = req.body;

        const connection = await database.getConnection();

        let validate_code = await connection.query("SELECT * FROM codes WHERE code = ?",[Number(code)]);

        if(validate_code.length > 0){
            await connection.query("DELETE FROM codes WHERE code = ?",[Number(code)])
            res.status(200).send({state: "Good Request", message: "Codigo Correcto"});
        }else{
            res.status(400).send({state: "Bad Request", message: "El codigo no existe."});
        }
    }
});

app.post("/promo/validate", async (req, res) => {
    if(req.body){
        let { code, id } = req.body;

        code = code.toString().toUpperCase();

        const connection = await database.getConnection();

        let validate_code = await connection.query("SELECT * FROM codes WHERE code = ? AND type = ?",[code, "promotion"]);

        if(validate_code.length > 0){

            let codes_use = [];

            let date_now = new Date();

            if(date_now > new Date(validate_code[0].expired)){
                return res.status(400).send({state: "Bad Request", message: "El codigo ya expiro."});
            }

            if(validate_code[0].used){
                codes_use = [...JSON.parse(validate_code[0].used)];
            }

            let isUsed = codes_use.includes(id);

            if(isUsed){
                return res.status(400).send({state: "Bad Request", message: "El codigo ya fue usado."});
            }
            
            codes_use.push(id);
            await connection.query("UPDATE codes SET used = ? WHERE code = ?", [JSON.stringify(codes_use), code]);

            const data_user = await connection.query("SELECT * FROM users WHERE id_user = ?", [id]);
            await connection.query("UPDATE users SET saldo_disponible = ? WHERE id_user = ?", [parseFloat(data_user[0].saldo_disponible) + parseFloat(validate_code[0].action), id]);
            res.status(200).send({state: "Good Request", message: "Codigo Correcto"});
        }else{
            res.status(400).send({state: "Bad Request", message: "El codigo no existe."});
        }
    }
});

app.post("/user/transfer", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const origin = req.body.origin;
        const destino_id = req.body.numero_card;
        const action = req.body.action;
        const message = req.body.message;

        const is_active = req.body.is_active;

        let numero_card = convertCard("", destino_id);

        const data_user_register_origin = await connection.query("SELECT * FROM registers WHERE id = ?", [origin]);

        if(data_user_register_origin.length > 0){
            const data_user_origin = await connection.query("SELECT * FROM users WHERE id_user = ?", [data_user_register_origin[0].id]);

            if(data_user_origin.length > 0){

                if(data_user_origin[0].number_card != numero_card){

                    if(parseFloat(data_user_origin[0].saldo_disponible) >= parseFloat(action)){
                        const data_user_register_destino = await connection.query("SELECT * FROM users WHERE number_card = ?", [numero_card]);
    
                        if(data_user_register_destino.length > 0){
                            let saldo_disponible_destino = data_user_register_destino[0].saldo_disponible;
                            let saldo_enviado_destino = parseFloat(saldo_disponible_destino) + parseFloat(action);

                            let saldo_disponible_origen = data_user_origin[0].saldo_disponible;
                            let saldo_restado_origen = parseFloat(saldo_disponible_origen) - parseFloat(action);
                            
                            let date_mow = new Date();
                            
                            //Actulizamos los saldos de ambos
                            await connection.query("UPDATE users SET saldo_disponible=?  WHERE id_user = ?", [saldo_enviado_destino, data_user_register_destino[0].id_user]);
                            await connection.query("UPDATE users SET saldo_disponible=?  WHERE id_user = ?", [saldo_restado_origen, data_user_origin[0].id_user]);
                            
                            //Agregamos movimientos a ambos y notificaciones

                            //Movimiento para el destino
                            let movements_destino = await connection.query("SELECT * FROM movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_register_destino[0].id_user]);
                            let notifications_destino = await connection.query("SELECT * FROM notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_register_destino[0].id_user]);
                            
                            let id_movement_destino = await generateIdMovements(connection);
                            let id_notification_destino = await generateIdNotifications(connection);

                            if(id_movement_destino == null || id_notification_destino == null){
                                res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del destino" });
                            }

                            await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement_destino, data_user_register_destino[0].id_user, data_user_origin[0].name_user ,movements_destino.length + 1, "Transfer", date_mow, action, "positivo", message]);
                            await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification_destino, data_user_register_destino[0].id_user, data_user_origin[0].name_user ,notifications_destino.length + 1, "Transfer", date_mow, action, "positivo", message, true]);

                            //Movimiento para el origen
                            let movements_origin = await connection.query("SELECT * FROM movements WHERE id_user = ? ORDER BY id_user ASC", [data_user_origin[0].id_user]);
                            let notifications_origin = await connection.query("SELECT * FROM notifications WHERE id_user = ? ORDER BY id_user ASC", [data_user_origin[0].id_user]);
                                                        
                            let id_movement_origin = await generateIdMovements(connection);
                            let id_notification_origin = await generateIdNotifications(connection);

                            if(id_movement_origin == null || id_notification_origin == null){
                                res.status(400).send({ state: "Bad Request", message: "No se pudo generar un id unico del origen" });
                            }
                            let message_origin = `Enviaste una transferencia al usuario con el numero de tarjeta: ${numero_card} por un monto de $${formatNumber(action)}.`;
                            await connection.query("INSERT INTO movements(id_movement, id_user, origin, index_movement, tipo_movement, fecha_movement, action_movement, state_movement, message) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_movement_origin, data_user_origin[0].id_user, data_user_origin[0].name_user ,movements_origin.length + 1, "Transfer", date_mow, action, "negativo", message_origin]);
                            await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification_origin, data_user_origin[0].id_user, data_user_origin[0].name_user ,notifications_destino.length + 1, "Transfer", date_mow, action, "negativo", message, is_active]);

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
        let notIsEmail = req.body.isEmail;

        if(notIsEmail == false || notIsEmail == undefined){
            let emailExists = await connection.query("SELECT email FROM registers WHERE email = ?", [email]);
            if(!emailExists.length > 0){
                res.status(400).send({ state: "Bad Request", message: "Email no registrado." });
                return;
            }
        }


        let attemps_code_recover = 100;
        let randomCode;
        let isAvailable = false;
        let response_user_code;

        while(isAvailable == false){
            randomCode = Math.floor(100000 + Math.random() * 900000)
            response_user_code = await connection.query("SELECT * FROM codes WHERE code = ?",[randomCode]);
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
                res.status(200).send({ state: "Good Request", message: "Correo Enviado"});
                return;
            }
        });
    }
});

app.post("/email/validate/send_code", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let email = req.body.email;
        let emailExists = await connection.query("SELECT email FROM registers WHERE email = ?", [email]);
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
            response_user_code = await connection.query("SELECT * FROM codes WHERE code = ?",[randomCode]);
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
                <title>Código de Validacion</title>
            </head>
            <body style="background-color: #f2f2f2; padding: 20px;">
            
            <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <div style="padding: 20px;">
                    <h1 style="color: #333; text-align: center;">Código de Validacion</h1>
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
        const {action, origin, message, numero_card, subject, date} = req.body;
        let numero_card_formatted = "";

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
                <h1>Notificación de Transferencia</h1>
                <p>Estimado <strong>${name_origin}</strong>,</p>
                <p>Nos complace informarle que su solicitud de transferencia por <span style="font-weight: bold;">$${formatNumber(action)}</span> ha sido aprobada.</p>
            </div>
            
            <div class="details">
                <h2 style="color: #333; font-size: 18px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">Detalles del transferencia</h2>
                <table>
                    <tr>
                        <td><strong>Nombre:</strong></td>
                        <td>${name_origin}</td>
                    </tr>
                    <tr>
                        <td><strong>Numero destino:</strong></td>
                        <td>${numero_card_formatted}</td>
                    </tr>
                    <tr>
                        <td><strong>Monto:</strong></td>
                        <td>$${formatNumber(action)}</td>
                    </tr>
                    <tr>
                        <td><strong>Descripcion:</strong></td>
                        <td>${message}</td>
                    </tr>
                    <tr>
                        <td><strong>Fecha:</strong></td>
                        <td>${date.split("T")[0]}</td>
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

        await connection.query("UPDATE users SET fecha_update = ? WHERE email_user = ?", [date, email]);
    }
});

app.post("/email/send_simulated_activity", async (req, res) => {
    if(req.body){
        const {htmlMessage, subject, id_user} = req.body;
        const connection = await database.getConnection();

        const email_users = await connection.query("SELECT email_user FROM users WHERE id_user = ?", [id_user]);
        if(!email_users.length > 0){
            return res.status(400).send({ state: "Bad Request", message: "No se encontro el Correo Electronico"});
        }

        let email = email_users[0].email_user

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

app.post("/email/verify", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        let code = req.body.code;

        let response_user_code = await connection.query("SELECT * FROM codes WHERE code = ?",[code]);

        if(response_user_code.length > 0){
            res.status(200).send({ state: "Good Request", message: "Código Correcto", email: response_user_code[0].email});
        }else{
            res.status(400).send({ state: "Bad Request", message: "Código Incorrecto" });
        }
    }
});

app.post("/EA/movement", async (req, res) => {
    if(req.body){
        const {id_user, origin, tipo_notification} = req.body;
        
        const connection = await database.getConnection();
        const id_notification = await generateIdNotifications(connection);

        const notifications_user_complete = await connection.query("SELECT * FROM notifications WHERE id_user = ? AND tipo_notification = ?", [id_user, "Movement"]);
        const movements_complete_user = await connection.query("SELECT * FROM movements WHERE id_user = ?", [id_user]);
        let movements_positive = movements_complete_user.filter((item) => item.state_movement == "positivo");
        movements_positive = movements_complete_user.map((item) => Number(item.action_movement));
        movements_positive = movements_positive.reduce((a, b) => a + b, 0);
        const fecha_notification = new Date();

        if(id_notification == null){
            return res.status(404).send({message: "Invalid Id User"})
        }

        const set_notification = await connection.query("INSERT INTO notifications (id_notification, id_user, origin, index_notification, tipo_notification, fecha_notification, action_notification, state_notification, message, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [id_notification, id_user, origin, notifications_user_complete.length + 1, tipo_notification, fecha_notification, movements_positive, movements_complete_user.length + "", "none", true]);
        
        if(set_notification){
            res.status(200).json({ status: "Good Request", message: "Movimiento insertado correctamente" });
        }else{
            res.status(400).json({ status: "Bad Request", message: "No se pudo insertar el movimiento" });
        }
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

app.post("/save/image_profile", async (req, res) => {
    if(req.body){
        const {image, id} = req.body;

        const connection = await database.getConnection();

        const save_image = await connection.query("UPDATE users SET image_profile = ? WHERE id_user = ?", [image, id]);

        if(save_image){
            return res.status(200).send({state: "Good Request", message: "Imagen Guardada con exito"});
        }else{
            return res.status(400).send({state: "Bad Request", message: "Ha ocurrido un error al intentar guardar la imagen"});
        }
    }
});

app.post("/password/change/settings", async (req, res) => {
    if(req.body){
        const {current, password, id} = req.body;
        const connection = await database.getConnection();

        const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
        const hashedCurrent = CryptoJS.SHA256(current).toString(CryptoJS.enc.Hex);

        const data_user = await connection.query("SELECT * FROM registers WHERE id = ?", [id]);
        
        if(!data_user.length > 0){
            return res.status(400).send({state: "Bad Request", message: "El ID no existe."})
        }

        if(data_user[0].password != hashedCurrent){
            return res.status(400).send({ state: "Bad Request", message: "Contraseña incorrecta." });
        }

        if(data_user[0].password == hashedPassword){
            return res.status(400).send({ state: "Bad Request", message: "La nueva contraseña no puede ser igual a la anterior." });
        }
        
        await connection.query("UPDATE registers SET password = ? WHERE id = ?", [hashedPassword, id]);

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

app.get('/create/pdf_loan', async (req, res) => {
    try {
        const { id_loan } = req.query;

        const connection = await database.getConnection();

        // Obtener los datos del préstamo desde la base de datos
        const data_loan = await connection.query("SELECT * FROM prestamos WHERE id_loan = ?", [id_loan]);

        if (data_loan.length === 0) {
            return res.status(404).json({ error: "Prestamo no encontrado" });
        }

        const loan = data_loan[0];

        // Obtener la fecha formateada
        const fecha = new Date(loan.fecha);
        const fechaVencimiento = new Date(loan.fecha_next);
        const date_now = formatDate(fecha);
        const date_next = formatDate(fechaVencimiento);

        // Obtener el número de tarjeta del usuario
        const userData = await connection.query("SELECT number_card FROM users WHERE id_user = ?", [loan.id_user]);
        const userNumberCard = userData.length > 0 ? userData[0].number_card : '';

        //Obtener numero de cuotas a pagar
        const cuotas_pagar = 1;

        //Obtener datos de la simulacion
        const simulate = JSON.parse(loan.simulate);

        const cuota_month = formatNumber(simulate[0].pago_capital);
        const base_imponible = formatNumber(simulate[0].pago_capital);
        const intereses = formatNumber(simulate[0].pago_interes);
        const amount = formatNumber(simulate[0].monto);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        
        // Crear el contenido HTML con los datos del préstamo y el usuario
        const htmlContent = `
            <div class="pdf-convert" style="max-width: 800px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); font-family: Arial, sans-serif;">

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: start; align-items: center; gap: 1rem;">
                        <svg id="icon-header" class="icon icon-tabler icon-tabler-steam" width="64" height="64" viewBox="0 0 24 24" stroke-width="1.5" stroke="black" fill="white" stroke-linecap="round" stroke-linejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M12 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                            <path d="M4 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                            <path d="M20 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                            <path d="M12 20m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/>
                            <path d="M5.5 5.5l3 3"/>
                            <path d="M15.5 15.5l3 3"/>
                            <path d="M18.5 5.5l-3 3"/>
                            <path d="M8.5 15.5l-3 3"/>
                        </svg>
                        <span style="font-size: 34px; font-weight: bold; color: #333;">EasyCredit</span>
                    </div>
                    <div style="font-size: 18px; color: #555;">
                        <div>Factura #: ${loan.excedent_now}</div>
                        <div>Fecha: ${date_now}</div>
                        <div>Fecha de Vencimiento: ${date_next}</div>
                    </div>
                </div>

                <hr style="border-top: 1px solid #ddd; margin-bottom: 20px;">

                <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px;">Detalles del Cliente</div>

                <div style="margin-bottom: 10px;">Nombre del Cliente: ${loan.name_loan}</div>
                <div style="margin-bottom: 10px;">Número de Teléfono: ${loan.numero_telefono_loan}</div>
                <div style="margin-bottom: 10px;">Número de Tarjeta: ${userNumberCard}</div>

                <hr style="border-top: 1px solid #ddd; margin-bottom: 20px;">

                <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px;">Detalles del Préstamo</div>

                <div style="margin-bottom: 10px;">Nombre del Préstamo: Préstamo Bancario Personal</div>
                <div style="margin-bottom: 10px;">Monto del Préstamo: $${formatNumber(loan.action_prestamo)}</div>
                <div style="margin-bottom: 10px;">Tasa de Interés: ${loan.tasa_interes}%</div>
                <div style="margin-bottom: 10px;">Cuotas: ${loan.cuotas}</div>
                <div style="margin-bottom: 10px;">Frecuencia de Pago: ${loan.frecuencia_pago}</div>
                <div style="margin-bottom: 10px;">Acción del Préstamo: Aprobado</div>

                <hr style="border-top: 1px solid #ddd; margin-bottom: 20px;">

                <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px;">Información del Pago Actual</div>

                <div style="margin-bottom: 10px;">Número de Cuotas a Pagar: ${cuotas_pagar}</div>
                <div style="margin-bottom: 10px;">Monto a Pagar por Cuota: $${cuota_month}</div>

                <hr style="border-top: 1px solid #ddd; margin-bottom: 20px;">

                <div style="font-size: 20px; font-weight: bold; color: #333; margin-bottom: 20px;">Excedente de Pago</div>

                <div style="margin-bottom: 10px;">Base Imponible: $${base_imponible}</div>
                <div style="margin-bottom: 10px;">Intereses: $${intereses}</div>
                <div style="margin-bottom: 10px;">Total a Reembolsar: $${amount}</div>

                <hr style="border-top: 1px solid #ddd; margin-bottom: 20px;">

                <div style="text-align: center;">
                    <button style="padding: 10px 20px; font-size: 18px; font-weight: bold; color: #fff; background-color: #007bff; border: none; border-radius: 4px; cursor: pointer;">Gracias por usar EasyCredit</button>
                </div>

            </div>
        `;

        await page.setContent(htmlContent);

        const pdfBuffer = await page.pdf({ format: 'A4' });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=factura.pdf');

        res.status(200).send(pdfBuffer);
    } catch (error) {
        console.error('Error al generar el PDF:', error);
        res.status(500).send('Error al generar el PDF');
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
    const user = await connection.query("SELECT * FROM users WHERE id_user = ?", [id_user]);

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
    const data_user_info = await connection.query("SELECT * FROM users WHERE id_user = ?", [id_user]);
    const data_user_register = await connection.query("SELECT * FROM registers WHERE id = ?", [id_user]);
    const data_user_notifications = await connection.query("SELECT * FROM notifications WHERE id_user = ?", [id_user]);
    const data_user_loans = await connection.query("SELECT * FROM prestamos WHERE id_user = ?", [id_user]);
    const data_history_2fa = await connection.query("SELECT * FROM history_2fa WHERE id_user = ?",[id_user]);
    let data_user_movements_incomplete;
    let data_user_movements;
    if(data_user_info[0] && data_user_info[0].id_user){
        data_user_movements_incomplete = await connection.query("SELECT * FROM movements WHERE id_user = ? LIMIT 4", [data_user_info[0].id_user]);
        data_user_movements = await connection.query("SELECT * FROM movements WHERE id_user = ?", [data_user_info[0].id_user]);
    }
    const data = {
        user_info: data_user_info,
        user_register: data_user_register,
        user_notifications: data_user_notifications,
        user_movements_incomplete: data_user_movements_incomplete,
        user_movements_complete: data_user_movements,
        data_user_loans: data_user_loans,
        data_history_2fa: data_history_2fa,
    };

    if (data) {
        res.json(data);
    } else {
        res.status(404).send({ message: "User not found" });
    }
});

app.get("/user/loan", async (req, res) => {
    const id_loan = req.query.id_loan;

    if(!id_loan){
        return res.status(400).send({ message: "ID Loan is required" });
    }

    const connection = await database.getConnection();
    const data_loan = await connection.query("SELECT * FROM prestamos WHERE id_loan = ?",[id_loan]);
    
    if(data_loan.length > 0){
        res.json(data_loan);
    }
});

app.get("/codes/promotion", async (req, res) => {
    const connection = await database.getConnection();
    const codes = await connection.query("SELECT * FROM codes WHERE type = ?", ["promotion"]);
    if(codes.length > 0){
        return res.status(200).json(codes);
    }

    res.status(400).send({ message: "Bad Request" });
})

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
    const words = await connection.query("SELECT * FROM words ORDER BY word ASC");
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
    let exist_id_movement_destino = await connection.query("SELECT * FROM movements WHERE id_movement = ?", [id_movement_destino]);
    let max_attemps_id_destino = 100;
    while(exist_id_movement_destino.length > 0 && max_attemps_id_destino > 0){
        id_movement_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_id_movement_destino = await connection.query("SELECT * FROM movements WHERE id_movement = ?", [id_movement_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return id_movement_destino;
    }
}

async function generateIdPrestamos(connection){
    let id_loan_destino = Math.floor(Math.random() * 900000000) + 100000000;
    let exist_id_loan_destino = await connection.query("SELECT * FROM prestamos WHERE id_loan = ?", [id_loan_destino]);
    let max_attemps_id_destino = 100;
    while(exist_id_loan_destino.length > 0 && max_attemps_id_destino > 0){
        id_loan_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_id_loan_destino = await connection.query("SELECT * FROM prestamos WHERE id_loan = ?", [id_loan_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return id_loan_destino;
    }
}

async function generateIdExcentedNow(connection){
    let excedent_now_destino = Math.floor(Math.random() * 900000000) + 100000000;
    let exist_excedent_now_destino = await connection.query("SELECT * FROM prestamos WHERE excedent_now = ?", [excedent_now_destino]);
    let max_attemps_id_destino = 100;
    while(exist_excedent_now_destino.length > 0 && max_attemps_id_destino > 0){
        excedent_now_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_excedent_now_destino = await connection.query("SELECT * FROM prestamos WHERE excedent_now = ?", [excedent_now_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return excedent_now_destino;
    }
}

async function generateIdNotifications(connection){
    let id_notification_destino = Math.floor(Math.random() * 900000000) + 100000000;
    let exist_id_notification_destino = await connection.query("SELECT * FROM notifications WHERE id_notification = ?", [id_notification_destino]);
    let max_attemps_id_destino = 100;
    while(exist_id_notification_destino.length > 0 && max_attemps_id_destino > 0){
        id_notification_destino = Math.floor(Math.random() * 900000000) + 100000000;
        exist_id_notification_destino = await connection.query("SELECT * FROM notifications WHERE id_notification = ?", [id_notification_destino]);
        max_attemps_id_destino --;
    }

    if(max_attemps_id_destino == 0){
        return null;
    }else{
        return id_notification_destino;
    }
}

function formatDate(fecha) {
    const meses = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ];

    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    const fechaFormateada = `${dia} de ${mes} de ${anio}`;
    return fechaFormateada;
}


function formatNumber(number) {
    let [integerPart, decimalPart] = String(number).split('.');

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    if (decimalPart) {
        return `${integerPart},${decimalPart}`;
    } else {
        return integerPart;
    }
}