import db from "@/app/lib/db";
import { authenticateToken, isUser, isAdmin } from "@/middleware/auth";
import { NextResponse } from "next/server";

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

    const [rows] = await db.query("SELECT * FROM buku WHERE id = ?", [bookId]);

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan" },
        { status: 404 }
      );
    }

    const buku = rows[0];

    // Ganti 'stok' menjadi 'stok_tersedia' sesuai skema database Anda
    if (buku.stok_tersedia <= 0) {
      return NextResponse.json(
        { success: false, message: "Stok buku habis!" },
        { status: 400 }
      );
    }

    const kodePeminjaman = `PJM${Date.now()}-${user.id}`;

    // Format tanggal ke YYYY-MM-DD agar kompatibel dengan tipe data DATE di MySQL
    const formatDate = (date) => date.toISOString().split("T")[0];

    const tanggalPinjam = new Date();
    const tanggalJatuhTempo = new Date();
    if (durasi === "2 Minggu") tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 14);
    else if (durasi === "1 Bulan") tanggalJatuhTempo.setMonth(tanggalJatuhTempo.getMonth() + 1);
    else tanggalJatuhTempo.setDate(tanggalJatuhTempo.getDate() + 7);

    // Jika ingin trigger database otomatis memotong stok, status harus 'dipinjam'. 
    // Tapi karena alurnya 'menunggu' persetujuan admin, biarkan status 'menunggu' 
    // dan kurangi stok nanti saat admin menyetujuinya.
    const [result] = await db.query(
      `INSERT INTO peminjaman 
        (kode_peminjaman, user_id, buku_id, tanggal_pinjam, tanggal_jatuh_tempo, status)
       VALUES (?, ?, ?, ?, ?, 'menunggu')`,
      [
        kodePeminjaman,
        user.id,
        bookId,
        formatDate(tanggalPinjam),
        formatDate(tanggalJatuhTempo),
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Pengajuan peminjaman berhasil dikirim!",
      data: {
        peminjaman_id: result.insertId,
        kode_peminjaman: kodePeminjaman,
        buku: buku.judul,
        tanggal_jatuh_tempo: formatDate(tanggalJatuhTempo),
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