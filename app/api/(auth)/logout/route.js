import { NextResponse } from "next/server";
import { db } from "@/app/lib/db.js";

export async function POST(req) {
  let connection;
  
  try {
    // Get user dari cookie
    const userId = req.cookies.get('user_id')?.value;

    if (userId) {
      connection = await db.getConnection();
      
      // Log aktivitas logout
      await connection.execute(
        `INSERT INTO log_aktivitas (user_id, aksi, detail) 
        VALUES (?, ?, ?)`,
        [userId, 'LOGOUT', 'User melakukan logout']
      );
    }

    // Hapus semua cookies
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout berhasil!"
      },
      { status: 200 }
    );

    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_id');

    return response;

  } catch (error) {
    console.error("Error logout:", error);
    
    // Tetap hapus cookies meskipun error
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout berhasil!"
      },
      { status: 200 }
    );

    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_id');

    return response;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}