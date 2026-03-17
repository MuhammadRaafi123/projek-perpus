import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nama, email, username, password } = body;

    // Koneksi ke database
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Raafi_123",
      database: "db_perpustakaan",
    });

    // Cek apakah email atau username sudah dipakai
    const [existing] = await db.execute(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username]
    );

    if (existing.length > 0) {
      await db.end();
      return NextResponse.json(
        { message: "Email atau Username sudah digunakan!" },
        { status: 400 }
      );
    }

    // Simpan user baru (role default user)
    await db.execute(
      "INSERT INTO users (nama_lengkap, email, username, password, role) VALUES (?, ?, ?, SHA2(?,256), 'user')",
      [nama, email, username, password]
    );

    await db.end();

    return NextResponse.json(
      { message: "Registrasi berhasil!" },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: "Server error", error: e.message },
      { status: 500 }
    );
  }
}
