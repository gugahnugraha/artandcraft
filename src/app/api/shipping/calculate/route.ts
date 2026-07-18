import { calculateShippingRates } from "@/services/shipping/shipping";
import { NextResponse } from "next/server";
import { z } from "zod";

const calculateSchema = z.object({
  city: z.string().min(1, "Kota tujuan harus diisi"),
  province: z.string().min(1, "Provinsi tujuan harus diisi"),
  weight: z.number().min(1, "Berat barang minimal 1 gram"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = calculateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { city, province, weight } = parsed.data;

    const rates = await calculateShippingRates(city, province, weight);

    return NextResponse.json({ success: true, rates });
  } catch (error: any) {
    console.error("Shipping Rate Calculation Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menghitung ongkos kirim" },
      { status: 500 }
    );
  }
}
