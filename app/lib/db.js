import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
});


export default db;
