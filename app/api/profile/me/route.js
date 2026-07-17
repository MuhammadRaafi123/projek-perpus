import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
};

export async function GET(req) {
  let connection;
  try {
    const userId = req.cookies.get("user_id")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "Tidak ada session aktif" },
        { status: 401 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [users] = await connection.execute(
      `SELECT id, nama_lengkap, username, email, foto_profil, status_akun, role,
              DATE_FORMAT(created_at, '%d/%m/%Y') AS created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    await connection.end();

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: users[0] }, { status: 200 });
  } catch (error) {
    console.error("Error GET /api/profile/me:", error);
    if (connection) await connection.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
