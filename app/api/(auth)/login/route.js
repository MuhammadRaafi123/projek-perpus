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

export async function POST(req) {
  let conn;

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email dan Password wajib diisi." },
        { status: 400 }
      );
    }

    conn = await pool.getConnection();

    const [rows] = await conn.execute(
      `SELECT
          id,
          nama_lengkap,
          username,
          email,
          role,
          foto_profil,
          status_akun
      FROM users
      WHERE (email=? OR username=?)
      AND password=SHA2(?,256)
      LIMIT 1`,
      [email, email, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          message: "Email atau Password salah.",
        },
        {
          status: 401,
        }
      );
    }

    const user = rows[0];

    const response = NextResponse.json(
      {
        success: true,
        message: "Login berhasil",
        role: user.role,
        user,
      },
      {
        status: 200,
      }
    );

    response.cookies.set("user_id", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set("user_role", user.role, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        message: "Server Error",
      },
      {
        status: 500,
      }
    );

  } finally {

    if (conn) conn.release();

  }
}