import { StorageProvider } from "./storage";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export class S3StorageProvider implements StorageProvider {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || "";
    this.publicUrl = process.env.R2_PUBLIC_URL || "";

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("Kredensial S3/R2 tidak ditemukan di konfigurasi environment.");
    }

    // Configure S3 client; uses custom endpoint if Cloudflare R2 Account ID is supplied
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFile(file: Buffer, fileName: string, mimeType: string, folder?: string): Promise<string> {
    const fileExtension = fileName.split(".").pop();
    const uniqueKey = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;
    const key = folder ? `${folder.replace(/\/$/, "")}/${uniqueKey}` : uniqueKey;

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimeType,
      })
    );

    // Standardize URL formatting
    const baseUrl = this.publicUrl.endsWith("/") ? this.publicUrl.slice(0, -1) : this.publicUrl;
    return `${baseUrl}/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const baseUrl = this.publicUrl.endsWith("/") ? this.publicUrl.slice(0, -1) : this.publicUrl;
    const key = fileUrl.replace(`${baseUrl}/`, "");

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      })
    );
  }
}
