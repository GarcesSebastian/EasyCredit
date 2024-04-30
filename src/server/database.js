import mysql from "promise-mysql";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createConnection({
    host: "localhost",
    database: "easycredit",
    user: "root",
    password: "",
});

const getConnection = async () => await connection;

export { getConnection };
