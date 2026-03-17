
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const authToken = req.cookies.get('auth_token')?.value;
    const userRole = req.cookies.get('user_role')?.value;
    const userId = req.cookies.get('user_id')?.value;

    if (!authToken || !userRole || !userId) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Tidak ada session aktif"
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        data: {
          userId: parseInt(userId),
          role: userRole
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error check auth:", error);
    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Terjadi kesalahan"
      },
      { status: 500 }
    );
  }
}

