import { StorageProvider } from "./storage";
import { LocalStorageProvider } from "./local-storage";
import { S3StorageProvider } from "./s3-storage";

let storage: StorageProvider;

// Selected via environment variable, e.g. "s3" or "local"
// Default to 'r2' if R2_ACCOUNT_ID is present to prevent crashes on Vercel (read-only FS)
const defaultProvider = process.env.R2_ACCOUNT_ID ? "r2" : "local";
const activeProvider = process.env.STORAGE_PROVIDER || defaultProvider;

if (activeProvider === "s3" || activeProvider === "r2") {
  try {
    storage = new S3StorageProvider();
  } catch (error) {
    console.warn("⚠️ Gagal inisialisasi S3/R2 storage, menggunakan Local Storage fallback.", error);
    storage = new LocalStorageProvider();
  }
} else {
  storage = new LocalStorageProvider();
}

export { storage };
export type { StorageProvider };
