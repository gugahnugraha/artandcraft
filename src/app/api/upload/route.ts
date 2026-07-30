import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { storage } from "@/services/storage";

// ─── Magic bytes signatures for image types ───────────────────────────────────
// Verifies actual file content, not just the MIME type header (which can be spoofed)
const MAGIC_SIGNATURES: Record<string, number[][]> = {
  "image/jpeg": [[0xff, 0xd8, 0xff]],
  "image/png":  [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  "image/webp": [[0x52, 0x49, 0x46, 0x46]], // RIFF header (followed by WEBP)
  "image/gif":  [[0x47, 0x49, 0x46, 0x38, 0x39, 0x61], [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]], // GIF89a / GIF87a
};

/**
 * Verify that the file's actual binary content matches expected magic bytes.
 * Prevents file extension / MIME type spoofing attacks.
 */
function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_SIGNATURES[mimeType];
  if (!signatures) return false;

  return signatures.some((sig) =>
    sig.every((byte, index) => buffer[index] === byte)
  );
}

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

    // 3. Validate MIME type against allowlist
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipe file tidak didukung (hanya JPG, PNG, WEBP, GIF)" },
        { status: 400 }
      );
    }

    // 4. Convert file to Buffer for deep inspection
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Verify magic bytes — ensures file content actually matches claimed MIME type
    if (!verifyMagicBytes(buffer, file.type)) {
      console.warn(
        `[SECURITY] Upload blocked: magic bytes mismatch for file "${file.name}" ` +
        `claimed type "${file.type}" by user ${session.user?.id}`
      );
      return NextResponse.json(
        { error: "Konten file tidak valid atau tidak sesuai dengan tipe file yang diklaim." },
        { status: 400 }
      );
    }

    // Read optional folder prefix
    const searchParams = new URL(req.url).searchParams;
    const folder = searchParams.get("folder") || (formData.get("folder") as string) || undefined;

    // 6. Upload file using the active Storage provider
    const fileUrl = await storage.uploadFile(buffer, file.name, file.type, folder);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload route failure:", error);
    return NextResponse.json({ error: "Gagal mengunggah file ke server" }, { status: 500 });
  }
}
