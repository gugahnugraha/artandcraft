import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function generateVerificationToken(email: string) {
  const cleanEmail = email.toLowerCase().trim();

  // Cooldown check: Cek apakah ada token yang dibuat < 60 detik lalu
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: cleanEmail },
  });

  if (existingToken) {
    const tokenCreatedTime = existingToken.expires.getTime() - 3600 * 1000;
    const elapsedTimeMs = Date.now() - tokenCreatedTime;
    const cooldownMs = 60 * 1000; // 60 seconds

    if (elapsedTimeMs < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsedTimeMs) / 1000);
      throw new Error(`SILENT_COOLDOWN:${waitSeconds}`);
    }
  }

  // Generate a new random token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: cleanEmail },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: cleanEmail,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const cleanEmail = email.toLowerCase().trim();
  const identifier = `password-reset:${cleanEmail}`;

  // Cooldown check: Cek apakah ada reset token yang dibuat < 60 detik lalu
  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier },
  });

  if (existingToken) {
    const tokenCreatedTime = existingToken.expires.getTime() - 3600 * 1000;
    const elapsedTimeMs = Date.now() - tokenCreatedTime;
    const cooldownMs = 60 * 1000; // 60 seconds

    if (elapsedTimeMs < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsedTimeMs) / 1000);
      throw new Error(`SILENT_COOLDOWN:${waitSeconds}`);
    }
  }

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  const passwordResetToken = await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      expires,
    },
  });

  return passwordResetToken;
}
