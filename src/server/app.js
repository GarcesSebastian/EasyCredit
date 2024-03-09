import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import * as database from "./database.js";

const app = express();

// Middlewares
app.use(cors({
    origin: ["http://localhost:4321", "http://localhost:4322", "http://localhost:5500", "http://localhost:5501", "http://localhost:" + process.env.PORT]
}));

app.use(morgan("dev"));
app.use(express.json());

app.post("/register/auth_email", async (req, res) => {
    if (req.body && req.body.email) {
        const connection = await database.getConnection();
        const emailExists = await connection.query("SELECT email FROM easycredit.registers WHERE email = ?", [req.body.email]);

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

                const userIdExists = await connection.query("SELECT id FROM easycredit.registers WHERE id = ?", [user_id]);

                if (userIdExists.length === 0) {
                    isAvailable = true;
                }

                attempts++;
            }

            if (!isAvailable) {
                res.status(500).json({ message: "Unable to generate a unique ID" });
                return;
            }

            const result = await connection.query("INSERT INTO easycredit.registers (id, username, email, password) VALUES (?, ?, ?, ?)", [user_id, req.body.username, req.body.email, req.body.password]);
            res.status(200).json(result);
        }
    } else {
        res.status(400).json({ message: "Bad Request" });
    }
});

app.get("/test", (req,res) => {
    res.json({
        "Message": "Bienvenido sebxstt"
    });
});

export { app };