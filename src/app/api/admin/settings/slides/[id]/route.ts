import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{ id: string }>;
};

// PUT /api/admin/settings/slides/[id] - Update a hero slide
export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const existing = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        tagId: tagId !== undefined ? tagId : existing.tagId,
        tagEn: tagEn !== undefined ? tagEn : existing.tagEn,
        titleId: titleId !== undefined ? titleId : existing.titleId,
        titleEn: titleEn !== undefined ? titleEn : existing.titleEn,
        subtitleId: subtitleId !== undefined ? subtitleId : existing.subtitleId,
        subtitleEn: subtitleEn !== undefined ? subtitleEn : existing.subtitleEn,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
        btnTextId: btnTextId !== undefined ? btnTextId : existing.btnTextId,
        btnTextEn: btnTextEn !== undefined ? btnTextEn : existing.btnTextEn,
        btnLink: btnLink !== undefined ? btnLink : existing.btnLink,
        order: order !== undefined ? Number(order) : existing.order,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
    });

    return NextResponse.json({ success: true, slide });
  } catch (error: any) {
    console.error("Update slide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/admin/settings/slides/[id] - Delete a hero slide
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    await prisma.heroSlide.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Slide deleted successfully" });
  } catch (error: any) {
    console.error("Delete slide error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
