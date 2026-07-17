import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { storage } from "@/services/storage";

export async function POST(req: NextRequest) {
  // 1. Verify user is logged in
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Akses tidak sah" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // 2. Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file terlalu besar (maksimal 5MB)" }, { status: 400 });
    }

    // 3. Validate image MIME type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung (hanya JPG, PNG, WEBP, GIF)" }, { status: 400 });
    }

    // Convert file to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload file using the active Storage provider
    const fileUrl = await storage.uploadFile(buffer, file.name, file.type);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload route failure:", error);
    return NextResponse.json({ error: "Gagal mengunggah file ke server" }, { status: 500 });
  }
}
