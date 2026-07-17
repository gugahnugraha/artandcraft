import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Nama minimal 2 karakter"),
    email: z.string().email("Format email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Konfirmasi password minimal 6 karakter"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const sellerSetupSchema = z.object({
  storeName: z.string().min(3, "Nama toko minimal 3 karakter"),
  storeSlug: z
    .string()
    .min(3, "Slug toko minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"),
  storeDescription: z.string().min(10, "Deskripsi toko minimal 10 karakter"),
  storeLogo: z.string().url("Format URL logo tidak valid").or(z.literal("")).optional(),
  storeBanner: z.string().url("Format URL banner tidak valid").or(z.literal("")).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SellerSetupInput = z.infer<typeof sellerSetupSchema>;
