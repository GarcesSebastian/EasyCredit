import mysql from "promise-mysql";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createConnection({
    host: "b4mposs5pj2vehftstq2-mysql.services.clever-cloud.com",
    database: "b4mposs5pj2vehftstq2",
    user: "uon0s5rawiyd4jdk",
    password: "duIG4vMkNGe2wnBI1JM5",
});

const getConnection = async () => await connection;

export { getConnection };
