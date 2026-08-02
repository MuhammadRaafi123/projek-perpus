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
    const { id, kode_buku, action } = await req.json();

    if (!id && !kode_buku) {
      return NextResponse.json({ error: "ID atau Kode Buku tidak ditemukan" }, { status: 400 });
    }

    if (action !== "decrement" && action !== "increment") {
      return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
    }

    connection = await mysql.createConnection(dbConfig);

    let whereClause = "id = ?";
    let identifier = id;
    if (kode_buku) {
      whereClause = "kode_buku = ?";
      identifier = kode_buku;
    }

    let updateQuery = "";
    if (action === "decrement") {
      updateQuery = `UPDATE buku SET stok_tersedia = GREATEST(0, stok_tersedia - 1) WHERE ${whereClause}`;
    } else {
      // For increment, we shouldn't exceed stok_total ideally, but simple +1 is fine.
      updateQuery = `UPDATE buku SET stok_tersedia = LEAST(stok_total, stok_tersedia + 1) WHERE ${whereClause}`;
    }

    const [result] = await connection.execute(updateQuery, [identifier]);
    await connection.end();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Stok berhasil diupdate" }, { status: 200 });
  } catch (error) {
    console.error("Error updating stock:", error);
    if (connection) await connection.end();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
