import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/settings/config - Fetch all config settings
export async function GET() {
  try {
    const configs = await prisma.platformConfig.findMany();
    const configMap: Record<string, string> = {};
    configs.forEach((c) => {
      configMap[c.key] = c.value;
    });
    return NextResponse.json({ configs: configMap });
  } catch (error: any) {
    console.error("Get configs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/admin/settings/config - Upsert batch of config settings
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { settings } = body; // Object containing key-value pairs, e.g. { "site_name": "New Name", "primary_color": "#ff0000" }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Settings object required" }, { status: 400 });
    }

    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const config = await prisma.platformConfig.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      results.push(config);
    }

    return NextResponse.json({ success: true, configs: results });
  } catch (error: any) {
    console.error("Save configs error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
