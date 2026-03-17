// app/api/login/route.js

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Raafi_123",
      database: "db_perpustakaan",
    });

    const [rows] = await db.execute(
      `SELECT id, nama_lengkap, username, email, role 
       FROM users 
       WHERE (email = ? OR username = ?) AND password = SHA2(?, 256)`,
      [email, email, password]
    );

    await db.end();

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Email/Username atau Password salah!" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Buat response
    const response = NextResponse.json(
      {
        message: "Login berhasil",
        role: user.role,
        user: {
          id:           user.id,
          nama_lengkap: user.nama_lengkap,
          username:     user.username,
          email:        user.email,
          role:         user.role,
        },
      },
      { status: 200 }
    );

    // ── Set cookie role ──
    // HttpOnly: false agar bisa dibaca JS di client (untuk sessionStorage sync)
    // Untuk keamanan lebih, bisa set httpOnly: true tapi middleware saja yang baca
    response.cookies.set("user_role", user.role, {
      httpOnly: false,      // middleware baca dari cookie
      secure: false,        // ganti true kalau sudah pakai HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 8,  // 8 jam
      path: "/",
    });

    // Set cookie user_id untuk keperluan lain (opsional)
    response.cookies.set("user_id", String(user.id), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/",
    });

    return response;

  } catch (e) {
    return NextResponse.json(
      { message: "Server error", error: e.message },
      { status: 500 }
    );
  }
}