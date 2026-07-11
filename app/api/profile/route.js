
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId tidak ditemukan" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    // Ambil data user
    const [users] = await connection.execute(
      `SELECT id, nama_lengkap, username, email, foto_profil, status_akun, role,
              DATE_FORMAT(created_at, '%d/%m/%Y') AS created_at
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (users.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // Ambil riwayat peminjaman user
    const [borrowHistory] = await connection.execute(
      `SELECT 
        p.kode_peminjaman,
        b.judul AS judul_buku,
        DATE_FORMAT(p.tanggal_pinjam, '%d/%m/%Y') AS tanggal_pinjam,
        DATE_FORMAT(p.tanggal_jatuh_tempo, '%d/%m/%Y') AS tanggal_jatuh_tempo,
        DATE_FORMAT(p.tanggal_kembali, '%d/%m/%Y') AS tanggal_kembali,
        p.status
       FROM peminjaman p
       JOIN buku b ON p.buku_id = b.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    await connection.end();

    return NextResponse.json({
      profileData: users[0],
      borrowHistory,
    }, { status: 200 });

  } catch (error) {
    console.error("Error GET /api/profile:", error);
    if (connection) await connection.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  let connection;

  try {
    const body = await req.json();

    const {
      userId,
      nama_lengkap,
      username,
      email,
      password,
      foto_profil,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId tidak ditemukan" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // cek email
    const [emailCheck] = await connection.execute(
      "SELECT id FROM users WHERE email=? AND id!=?",
      [email, userId]
    );

    if (emailCheck.length > 0) {
      await connection.end();

      return NextResponse.json(
        { error: "Email sudah digunakan." },
        { status: 409 }
      );
    }

    // cek username
    const [usernameCheck] = await connection.execute(
      "SELECT id FROM users WHERE username=? AND id!=?",
      [username, userId]
    );

    if (usernameCheck.length > 0) {
      await connection.end();

      return NextResponse.json(
        { error: "Username sudah digunakan." },
        { status: 409 }
      );
    }

    // update tanpa password
    if (!password || password.trim() === "") {

      await connection.execute(
        `UPDATE users
        SET
          nama_lengkap=?,
          username=?,
          email=?,
          foto_profil=?
        WHERE id=?`,
        [
          nama_lengkap,
          username,
          email,
          foto_profil,
          userId,
        ]
      );

    } else {

await connection.execute(
  `UPDATE users
   SET
     nama_lengkap=?,
     username=?,
     email=?,
     password=SHA2(?,256),
     foto_profil=?
   WHERE id=?`,
  [
    nama_lengkap,
    username,
    email,
    password,
    foto_profil,
    userId,
  ]
);

    }

    await connection.end();

    return NextResponse.json({
      message: "Profil berhasil diperbarui",
    });

  } catch (error) {

    console.error(error);

    if (connection) {
      await connection.end();
    }

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );

  }
}