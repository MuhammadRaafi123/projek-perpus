import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.execute(
      `SELECT id, nama_lengkap, username, email, role, status_akun FROM users WHERE role = 'user' OR role = 'siswa'`
    );

    return NextResponse.json(
      {
        success: true,
        data: rows,
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  } finally {
    if (conn) conn.release();
  }
}
