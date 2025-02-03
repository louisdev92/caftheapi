/* npm install mysql2 */
const mysql = require("mysql2");
require("dotenv").config(); // Permet de charger Les Variables d'environement

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
});

db.connect((error)=>{
    if(error){
        console.error("Erreur de connexion MySQL :", error);
        process.exit(1)
    }

    console.log("Connecté à la bdd MySQL");
});

module.exports = db;
