import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_token`);
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(`${appUrl}/login?error=invalid_token`);
    }

    if (new Date(verificationToken.expires) < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(`${appUrl}/login?error=expired_token`);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    });

    if (!user) {
      return NextResponse.redirect(`${appUrl}/login?error=user_not_found`);
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.redirect(`${appUrl}/login?verified=true`);
  } catch (error) {
    console.error("Email Verification Error:", error);
    return NextResponse.redirect(`${appUrl}/login?error=verification_error`);
  }
}
