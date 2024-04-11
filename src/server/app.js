import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

const app = express();
const server = createServer(app);

//Variables globals
let flag = {};
let initiated = {};
let email = [];
let id = {};


const port = process.env.PORT || 4000;

// Configuración inicial
app.set("port", port);

// Middlewares
app.use(cookieParser());
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

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
        const allowedOrigins = ['http://localhost:4321', "https://1rhbb29z-4321.use2.devtunnels.ms", "https://c2hccs03-4321.use2.devtunnels.ms"];
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    }
});

io.on('connection', (socket) => {
});
    
app.post("/register/auth", async (req, res) => {
    if (req.body && req.body.email) {
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email FROM registers WHERE email = ?", [req.body.email]);

        if (emailExists.length > 0) {
            res.status(400).json({ message: "Email already registered" });
        } else {
            let user_id;
            let isAvailable = false;
            let attempts = 0;
            let min = 9999;
            let max = 999999;
            const maxAttempts = 1000; 

            while (!isAvailable && attempts < maxAttempts) {
                user_id = Math.floor(Math.random() * max) + min;

                const userIdExists = await connection.query("SELECT id FROM registers WHERE id = ?", [user_id]);

                if (userIdExists.length === 0) {
                    isAvailable = true;
                }

                attempts++;
            }

            if (!isAvailable) {
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
        } 
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/login/auth", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email, password, id FROM registers WHERE email = ?", [req.body.email]);

        if (!emailExists.length > 0) {
            res.status(400).json({ message: "Incorrect Email" });
        } else {
            const hashedPassword = emailExists[0].password;

            const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

            if (passwordMatch) {
                connection.query("UPDATE registers SET estado = ? WHERE email = ?", [true, req.body.email]);
                res.status(200).json({ message: "Login Successful", id: emailExists[0].id});
            } else {
                res.status(400).json({ message: "Incorrect Password" });
            }
        }
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/variables", async (req, res) => {
    if(req.body){
        if(req.body.flag && req.body.initiated && req.body.id_user){
            flag = req.body.flag;
            initiated = req.body.initiated;
            id = req.body.id_user;

            if(!email.find(item => item === req.body.id_user) && CryptoJS.AES.decrypt(req.body.initiated, 'clave_secreta').toString(CryptoJS.enc.Utf8) == "true"){
                email.push(req.body.id_user);
            }

            if(id == 'false'){
                var encryptedValue = CryptoJS.AES.encrypt("false", 'clave_secreta').toString();
                initiated = encryptedValue
            }
            res.status(200).json({ message: "True Request"});
        }else{
            flag = "es";
            initiated = "false";
            email = "false";
            res.status(400).send({ message: "Bad Request" });
        }
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
        res.status(400).send({ state: "Bad Request" });
    }
});

app.post("/user/transfer", async (req, res) => {
    if(req.body){
        const connection = await database.getConnection();
        const origin = CryptoJS.AES.decrypt(req.body.origin, 'clave_secreta').toString(CryptoJS.enc.Utf8);
        const destino_id = req.body.numero_card;
        const action = req.body.action;
        const message = req.body.message;

        let numero_card = convertCard("", destino_id);

        const data_user_register_origin = await connection.query("SELECT * FROM easycredit.registers WHERE email = ?", [origin]);

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
  
app.get('/cookie',function(req, res){
    res.cookie("secret" , 'cookie_value').send('Cookie is set');
});

app.get("/", async (req, res) => {
    res.send(req.cookies);
    // const idUser = req.query.idUser;

    // if(idUser){
    //     const connection = await database.getConnection();
    //     const data_from_id = await connection.query("SELECT * FROM users WHERE id_user = ?",[idUser]);

    //     if(data_from_id.length > 0){
    //         console.log(data_from_id);
    //         req.session.id = []
    //         req.session.views = (req.session.views || 0) + 1;
    //         req.session.id.push(idUser);
    //         res.send(req.session);
    //     }else{
    //         res.send({response: "Bad Request"});
    //     }
    // }else{
    //     res.send({response: "Bad Request"});
    // }

    console.log(req.cookies);
});

app.get("/variables/res", (req,res) => {
    var decryptedInitiated = CryptoJS.AES.decrypt(initiated, 'clave_secreta').toString(CryptoJS.enc.Utf8);
    res.json({
        flag: flag,
        initiated: decryptedInitiated,
        id: id,
    });
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