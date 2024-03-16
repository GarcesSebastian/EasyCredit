import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js';

const app = express();

//Variables globals
let flag = "";
let initiated = "";
let email = "";

const port = process.env.PORT || 4000;

// Configuración inicial
app.set("port", port);
app.listen(app.get("port"));
console.log("Escuchando el puerto " + app.get("port"));

// Middlewares
app.use(cors({
    origin: ["http://localhost:4321", "http://localhost:4322", "http://localhost:5500", "http://localhost:5501", "http://localhost:" + process.env.PORT],
    credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());

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

            connection.query("INSERT INTO registers (id, username, email, password, numero_identidad, numero_telefono, estado) VALUES (?, ?, ?, ?, ?, ?, ?)", [user_id, req.body.username, req.body.email, hashedPassword, hashedNumero_identidad, hashedNumero_telefono, false]);
            connection.query("INSERT INTO users (id_user, name_user, email_user, saldo_disponible) VALUES (?, ?, ?, ?)", [user_id, req.body.username, req.body.email, 0]);
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
        const emailExists = await connection.query("SELECT email, password FROM registers WHERE email = ?", [req.body.email]);

        if (!emailExists.length > 0) {
            res.status(400).json({ message: "Incorrect Email" });
        } else {
            const hashedPassword = emailExists[0].password;

            const passwordMatch = await bcrypt.compare(req.body.password, hashedPassword);

            if (passwordMatch) {
                connection.query("UPDATE registers SET estado = ? WHERE email = ?", [true, req.body.email]);
                res.status(200).json({ message: "Login Successful" });
            } else {
                res.status(400).json({ message: "Incorrect Password" });
            }
        }
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.post("/variables", (req, res) => {
    if(req.body){
        if(req.body.flag && req.body.initiated && req.body.email){
            flag = req.body.flag;
            initiated = req.body.initiated;
            email = req.body.email;
            if(email == 'false'){
                var encryptedValue = CryptoJS.AES.encrypt("false", 'clave_secreta').toString();
                initiated = encryptedValue
                console.log("Llego")
            }
            res.status(200).json({ message: "True Request" });
        }else{
            flag = "es";
            initiated = "false";
            email = "false";
            res.status(400).send({ message: "Bad Request" });
        }
    }
});

app.get("/variables/res", (req,res) => {
    var decryptedEmail = CryptoJS.AES.decrypt(email, 'clave_secreta').toString(CryptoJS.enc.Utf8);
    var decryptedInitiated = CryptoJS.AES.decrypt(initiated, 'clave_secreta').toString(CryptoJS.enc.Utf8);
    res.json({
        flag: flag,
        initiated: decryptedInitiated,
        email: decryptedEmail,
    });
});

app.get("/user/data", async (req, res) => {
    const email_user = req.query.email_user;

    if (!email_user) {
        return res.status(400).send({ message: "User Email is required" });
    }

    const connection = await database.getConnection();
    const data_user_info = await connection.query("SELECT * FROM easycredit.users WHERE email_user = ?", [email_user]);
    const data_user_notifications = await connection.query("SELECT * FROM easycredit.notifications WHERE email_user = ?", [email_user]);
    let data_user_movements_incomplete;
    let data_user_movements;
    if(data_user_info[0] && data_user_info[0].id_user){
        data_user_movements_incomplete = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ? LIMIT 4", [data_user_info[0].id_user]);
        data_user_movements = await connection.query("SELECT * FROM easycredit.movements WHERE id_user = ?", [data_user_info[0].id_user]);
    }
    const data = {
        user_info: data_user_info,
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

