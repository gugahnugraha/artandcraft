export interface StorageProvider {
  /**
   * Uploads a file to the configured storage destination.
   * @param file The file contents as a Buffer.
   * @param fileName The target filename.
   * @param mimeType The file MIME type (e.g. image/jpeg, image/png).
   * @returns A promise that resolves to the public URL of the uploaded file.
   */
  uploadFile(file: Buffer, fileName: string, mimeType: string): Promise<string>;

  /**
   * Deletes a file from the storage destination.
   * @param fileUrl The full public URL of the file to delete.
   */
  deleteFile(fileUrl: string): Promise<void>;
}
