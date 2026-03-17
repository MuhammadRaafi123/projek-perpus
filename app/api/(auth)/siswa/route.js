import mysql from "mysql2/promise";

// DB Connection
export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Raafi_123",
  database: "db_perpustakaan",
});

// ================================
//  GET SEMUA SISWA
// ================================
export async function GET() {
  try {
    const [rows] = await db.execute("SELECT * FROM siswa ORDER BY id DESC");

    return Response.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Gagal mengambil data siswa" },
      { status: 500 }
    );
  }
}

// ================================
//  REGISTER SISWA (POST) — tanpa kelas
// ================================
export async function POST(req) {
  try {
    const { nama, email } = await req.json();

    if (!nama || !email) {
      return Response.json(
        { success: false, error: "Nama dan email wajib diisi" },
        { status: 400 }
      );
    }

    await db.execute(
      "INSERT INTO siswa (nama, email) VALUES (?, ?)",
      [nama, email]
    );

    return Response.json({
      success: true,
      message: "Siswa berhasil ditambahkan!",
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Gagal menambahkan siswa" },
      { status: 500 }
    );
  }
}
