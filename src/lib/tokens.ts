import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function generateVerificationToken(email: string) {
  // Generate a random token
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  // Delete any existing tokens for this email to avoid clutter
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  // Delete existing reset tokens. We prefix the identifier with 'password-reset:'
  const identifier = `password-reset:${email}`;
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
