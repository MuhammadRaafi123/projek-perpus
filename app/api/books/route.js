// File: app/api/books/route.js

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";   // ← FIX PALING PENTING

// Konfigurasi database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
};

// ===============================
// GET — Ambil daftar buku dari DATABASE
// ===============================
export async function GET() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);

    const [books] = await connection.execute(
      `SELECT 
        b.id,
        b.kode_buku,
        b.judul,
        b.pengarang,
        b.penerbit,
        b.tahun_terbit,
        b.isbn,
        b.kategori_id,
        b.jumlah_halaman,
        b.bahasa,
        b.deskripsi,
        b.cover_image AS gambar,
        b.stok_total,
        b.stok_tersedia,
        b.kondisi,
        b.status,
        k.nama_kategori
      FROM buku b
      LEFT JOIN kategori k ON b.kategori_id = k.id
      ORDER BY b.created_at DESC`
    );

    await connection.end();

    const booksWithCovers = books.map((b) => ({
      ...b,
      gambar:
        b.gambar && b.gambar !== "default-book-cover.jpg"
          ? b.gambar
          : b.isbn
          ? `https://covers.openlibrary.org/b/isbn/${b.isbn}-L.jpg`
          : "default-book-cover.jpg",
    }));

    return NextResponse.json(booksWithCovers, { status: 200 });
  } catch (error) {
    console.error("Error GET books:", error);
    if (connection) await connection.end();

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ===============================
// POST — Tambah buku ke database
// ===============================
export async function POST(req) {
  let connection;

  try {
    const body = await req.json();

    const {
      judul,
      pengarang,
      penerbit,
      tahun_terbit,
      isbn,
      kategori_id,
      jumlah_halaman,
      bahasa,
      deskripsi,
      gambar,
      stok_total,
      stok_tersedia,
    } = body;

    if (!judul || !pengarang) {
      return NextResponse.json(
        { error: "Judul dan Pengarang wajib diisi!" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [lastBook] = await connection.execute(
      "SELECT kode_buku FROM buku WHERE kode_buku IS NOT NULL ORDER BY id DESC LIMIT 1"
    );

    let newKode = "BK001";
    if (lastBook.length > 0 && lastBook[0].kode_buku) {
      const match = lastBook[0].kode_buku.match(/\d+/);
      if (match) {
        const lastNumber = parseInt(match[0], 10);
        newKode = "BK" + String(lastNumber + 1).padStart(3, "0");
      }
    }

    const [result] = await connection.execute(
      `INSERT INTO buku 
        (kode_buku, judul, pengarang, penerbit, tahun_terbit, isbn, kategori_id,
         jumlah_halaman, bahasa, deskripsi, cover_image, stok_total, stok_tersedia)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newKode,
        judul,
        pengarang,
        penerbit || null,
        tahun_terbit || null,
        isbn || null,
        kategori_id || null,
        jumlah_halaman || null,
        bahasa || "Indonesia",
        deskripsi || null,
        gambar || "default-book-cover.jpg",
        stok_total || 1,
        stok_tersedia || stok_total || 1,
      ]
    );

    await connection.end();

    return NextResponse.json(
      { message: "Buku berhasil ditambahkan", kode_buku: newKode, id: result.insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error POST books:", error);
    if (connection) await connection.end();

    return NextResponse.json(
      { error: "Gagal menambahkan buku", details: error.message },
      { status: 500 }
    );
  }
}

// ===============================
// PUT — Update buku
// ===============================
export async function PUT(req) {
  let connection;

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID buku tidak ditemukan" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute(
      `UPDATE buku SET 
        judul = ?,
        pengarang = ?,
        penerbit = ?,
        tahun_terbit = ?,
        deskripsi = ?,
        cover_image = ?,
        stok_total = ?,
        stok_tersedia = ?
      WHERE id = ?`,
      [
        updateData.judul,
        updateData.pengarang,
        updateData.penerbit || null,
        updateData.tahun_terbit || null,
        updateData.deskripsi || null,
        updateData.gambar || "default-book-cover.jpg",
        updateData.stok_total || 1,
        updateData.stok_tersedia || 1,
        id,
      ]
    );

    await connection.end();

    return NextResponse.json(
      { message: "Buku berhasil diupdate" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error PUT books:", error);
    if (connection) await connection.end();

    return NextResponse.json(
      { error: "Gagal mengupdate buku", details: error.message },
      { status: 500 }
    );
  }
}

// ===============================
// DELETE — Hapus buku
// ===============================
export async function DELETE(req) {
  let connection;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID buku tidak ditemukan" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    await connection.execute("DELETE FROM buku WHERE id = ?", [id]);

    await connection.end();

    return NextResponse.json(
      { message: "Buku berhasil dihapus" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error DELETE books:", error);
    if (connection) await connection.end();

    return NextResponse.json(
      { error: "Gagal menghapus buku", details: error.message },
      { status: 500 }
    );
  }
}
