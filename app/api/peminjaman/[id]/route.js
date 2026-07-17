import db from "@/app/lib/db";
import { authenticateToken, isAdmin } from "@/middleware/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    const { id } = params;
    const admin = await authenticateToken(req);

    if (!isAdmin(admin)) {
      return NextResponse.json(
        { success: false, message: "Hanya admin yang bisa mengubah status!" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { status } = body;

    const [rows] = await db.query(
      "SELECT * FROM peminjaman WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Peminjaman tidak ditemukan" },
        { status: 404 }
      );
    }

    const peminjaman = rows[0];

    if (status === "ditolak") {
      await db.query(
        "UPDATE buku SET stok = stok + 1 WHERE id = ?",
        [peminjaman.buku_id]
      );
    }

    await db.query(
      "UPDATE peminjaman SET status = ? WHERE id = ?",
      [status, id]
    );

    return NextResponse.json({
      success: true,
      message: "Status peminjaman diperbarui",
    });

  } catch (err) {
    console.error("PATCH Error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
