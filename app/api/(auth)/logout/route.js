import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
};

export async function POST(req) {
  let connection;

  try {
    // Get user dari cookie
    const userId = req.cookies.get("user_id")?.value;

    if (userId) {
      try {
        connection = await mysql.createConnection(dbConfig);

        // Log aktivitas logout
        await connection.execute(
          `INSERT INTO log_aktivitas (user_id, aksi, detail) 
          VALUES (?, ?, ?)`,
          [userId, "LOGOUT", "User melakukan logout"]
        );
      } catch (dbErr) {
        // Jika tabel log_aktivitas tidak ada atau DB error,
        // tetap lanjutkan proses logout (jangan gagalkan)
        console.error("Gagal log aktivitas logout:", dbErr.message);
      }
    }

    // Hapus semua cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout berhasil!",
      },
      { status: 200 }
    );

    response.cookies.delete("auth_token");
    response.cookies.delete("user_role");
    response.cookies.delete("user_id");

    return response;
  } catch (error) {
    console.error("Error logout:", error);

    // Tetap hapus cookies meskipun error
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout berhasil!",
      },
      { status: 200 }
    );

    response.cookies.delete("auth_token");
    response.cookies.delete("user_role");
    response.cookies.delete("user_id");

    return response;
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch {
        // ignore
      }
    }
  }
}