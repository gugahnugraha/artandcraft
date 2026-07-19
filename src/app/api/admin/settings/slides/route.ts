import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings/slides - Fetch all hero slides
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ slides });
  } catch (error: any) {
    console.error("Get slides error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/settings/slides - Create a new hero slide
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      tagId,
      tagEn,
      titleId,
      titleEn,
      subtitleId,
      subtitleEn,
      imageUrl,
      btnTextId,
      btnTextEn,
      btnLink,
      order,
      isActive,
    } = body;

    if (!tagId || !tagEn || !titleId || !titleEn || !imageUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slide = await prisma.heroSlide.create({
      data: {
        tagId,
        tagEn,
        titleId,
        titleEn,
        subtitleId: subtitleId || "",
        subtitleEn: subtitleEn || "",
        imageUrl,
        btnTextId: btnTextId || "",
        btnTextEn: btnTextEn || "",
        btnLink: btnLink || "",
        order: Number(order) || 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, slide });
  } catch (error: any) {
    console.error("Create slide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
