import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Raafi_123",
  database: process.env.DB_NAME || "db_perpustakaan",
});

export default db;