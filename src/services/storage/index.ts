import { StorageProvider } from "./storage";
import { LocalStorageProvider } from "./local-storage";
import { S3StorageProvider } from "./s3-storage";

let storage: StorageProvider;

// Selected via environment variable, e.g. "s3" or "local"
const activeProvider = process.env.STORAGE_PROVIDER || "local";

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
