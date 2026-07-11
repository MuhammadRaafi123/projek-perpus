import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req) {
  try {
    const data = await req.formData();

    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName =
      Date.now() +
      "-" +
      file.name.replace(/\s+/g, "_");

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "profile"
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(uploadDir, fileName),
      buffer
    );

    return NextResponse.json({
      success: true,
      path: `/uploads/profile/${fileName}`,
    });
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { error: "Upload gagal" },
      { status: 500 }
    );
  }
}