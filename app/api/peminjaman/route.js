import db from "@/app/lib/db";
import { authenticateToken, isUser, isAdmin } from "@/middleware/auth";
import { NextResponse } from "next/server";

// =============================
// POST - USER MENGAJUKAN PINJAMAN
// =============================
// =============================
// POST - USER MENGAJUKAN PINJAMAN
// =============================
export async function POST(req) {
  try {
    const body = await req.json();
    const user = await authenticateToken(req);

    if (!isUser(user)) {
      return NextResponse.json(
        { success: false, message: "Hanya user yang bisa meminjam!" },
        { status: 403 }
      );
    }

    const { bookId, durasi } = body;

    if (!bookId) {
      return NextResponse.json(
        { success: false, message: "ID buku tidak ditemukan" },
        { status: 400 }
      );
    }

    // Ambil detail buku
    const [rows] = await db.query("SELECT * FROM buku WHERE id = ?", [bookId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    const buku = rows[0];

    // 🔥 CEK STOK TERLEBIH DAHULU
    if (buku.stok <= 0) {
      return NextResponse.json(
        { success: false, message: "Stok buku habis!" },
        { status: 400 }
      );
    }

    // 🔥 KURANGI STOK DI DATABASE
    await db.query(
      "UPDATE buku SET stok = stok - 1 WHERE id = ?",
      [bookId]
    );

    // Buat kode peminjaman unik
    const kodePeminjaman = `PJM${Date.now()}-${user.id}`;

    // Hitung durasi
    const tanggalPinjam = new Date();
    const tanggalJatuhTempo = new Date();
    if (durasi === "2 Minggu") tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 14);
    else if (durasi === "1 Bulan") tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + 1);
    else tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 7);

    // Insert peminjaman baru
    const [result] = await db.query(
      `INSERT INTO peminjaman 
        (kode_peminjaman, user_id, buku_id, tanggal_pinjam, tanggal_jatuh_tempo, status)
       VALUES (?, ?, ?, ?, ?, 'menunggu')`,
      [
        kodePeminjaman,
        user.id,
        bookId,
        tanggalPinjam,
        tanggalJatuhTempo,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan peminjaman berhasil dikirim!",
      data: {
        peminjaman_id: result.insertId,
        kode_peminjaman: kodePeminjaman,
        buku: buku.judul,
        tanggal_jatuh_tempo: tanggalJatuhTempo,
      },
    });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}


// =============================
// GET - ADMIN MELIHAT SEMUA PEMINJAMAN
// =============================
export async function GET(req) {
  try {
    const user = await authenticateToken(req);

    if (!isAdmin(user)) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang dapat melihat data!" },
        { status: 403 }
      );
    }

    const [rows] = await db.query(
      `SELECT p.*, 
              u.nama_lengkap, 
              b.judul 
       FROM peminjaman p
       JOIN users u ON p.user_id = u.id
       JOIN buku b ON p.buku_id = b.id
       ORDER BY p.created_at DESC`
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
