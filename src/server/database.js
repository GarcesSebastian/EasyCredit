import mysql from "promise-mysql";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createConnection({
    host: process.env.HOST,
    database: process.env.DATABASE,
    user: process.env.USER,
    password: process.env.PASSWORD,
});

const getConnection = async () => await connection;

export { getConnection };
