import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
};

export async function PUT(req, context) {
  let connection;
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    console.log("PUT id:", id); 

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    const body = await req.json();

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `UPDATE buku SET 
        judul         = ?,
        pengarang     = ?,
        penerbit      = ?,
        tahun_terbit  = ?,
        deskripsi     = ?,
        cover_image   = ?,
        stok_total    = ?,
        stok_tersedia = ?
      WHERE id = ?`,
      [
        body.judul         ?? null,
        body.pengarang     ?? null,
        body.penerbit      ?? null,
        body.tahun_terbit  ?? null,
        body.deskripsi     ?? null,
        body.gambar        ?? "default-book-cover.jpg",
        body.stok_total    ?? 1,
        body.stok_tersedia ?? 1,
        id,
      ]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Buku tidak ditemukan di database" }, { status: 404 });
    }

    return NextResponse.json({ message: "Buku berhasil diupdate" }, { status: 200 });

  } catch (error) {
    console.error("Error PUT /api/books/[id]:", error);
    if (connection) await connection.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  let connection;
  try {
    const params = await Promise.resolve(context.params);
    const id = params?.id;

    console.log("DELETE id:", id); 

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    const [bukuCheck] = await connection.execute(
      "SELECT id FROM buku WHERE id = ? LIMIT 1",
      [id]
    );

    if (bukuCheck.length === 0) {
      await connection.end();
      return NextResponse.json({ error: "Buku tidak ditemukan di database" }, { status: 404 });
    }

    const [activeLoan] = await connection.execute(
      `SELECT id FROM peminjaman 
       WHERE buku_id = ? AND status IN ('menunggu','disetujui','dipinjam')
       LIMIT 1`,
      [id]
    );

    if (activeLoan.length > 0) {
      await connection.end();
      return NextResponse.json(
        { error: "Buku tidak bisa dihapus karena sedang dipinjam." },
        { status: 409 }
      );
    }

    await connection.execute("DELETE FROM buku WHERE id = ?", [id]);
    await connection.end();

    return NextResponse.json({ message: "Buku berhasil dihapus" }, { status: 200 });

  } catch (error) {
    console.error("Error DELETE /api/books/[id]:", error);
    if (connection) await connection.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}