import { StorageProvider } from "./storage";
import fs from "fs/promises";
import path from "path";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  async uploadFile(file: Buffer, fileName: string, _mimeType: string, folder?: string): Promise<string> {
    const targetDir = folder ? path.join(this.uploadDir, folder) : this.uploadDir;
    // Ensure the target directory exists
    await fs.mkdir(targetDir, { recursive: true });

    // Clean name and prepend timestamp for uniqueness
    const fileExtension = path.extname(fileName);
    const baseName = path.basename(fileName, fileExtension).replace(/[^a-zA-Z0-9-]/g, "_");
    const uniqueFileName = `${baseName}-${Date.now()}${fileExtension.toLowerCase()}`;

    const filePath = path.join(targetDir, uniqueFileName);

    // Save the buffer to disk
    await fs.writeFile(filePath, file);

    // Return the relative URL served by Next.js static routing
    return folder ? `/uploads/${folder}/${uniqueFileName}` : `/uploads/${uniqueFileName}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Verify it is a local upload path
    if (!fileUrl.startsWith("/uploads/")) return;

    const relativePath = fileUrl.replace("/uploads/", "");
    const filePath = path.join(this.uploadDir, relativePath);

    try {
      await fs.unlink(filePath);
    } catch (err: any) {
      // If the file was already deleted (or doesn't exist), fail silently
      if (err.code !== "ENOENT") {
        console.error("Gagal menghapus file lokal:", err);
      }
    }
  }
}
