import { z } from "zod";
import { ProductStatus } from "@prisma/client";

export const productSchema = z.object({
  title: z
    .string()
    .min(3, "Nama produk minimal 3 karakter")
    .max(100, "Nama produk maksimal 100 karakter"),
  description: z.string().min(10, "Deskripsi produk minimal 10 karakter"),
  price: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Harga harus berupa angka positif"),
  discount: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, "Diskon harus bernilai 0% hingga 100%")
    .optional()
    .default(0),
  stock: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val) && val >= 0, "Stok harus berupa bilangan bulat positif"),
  weight: z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, "Berat produk harus berupa angka positif (dalam gram)"),
  dimensions: z.string().optional().default(""),
  sku: z.string().optional().default(""),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  subcategoryId: z.string().optional().nullable(),
  photos: z.array(z.string().url("Format URL foto tidak valid")).min(1, "Minimal 1 foto produk harus diunggah"),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.DRAFT),
});

export type ProductInput = z.input<typeof productSchema>;
