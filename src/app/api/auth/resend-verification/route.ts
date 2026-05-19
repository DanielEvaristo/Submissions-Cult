import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/emails";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/auth/resend-verification
 * Generates a fresh 6-digit OTP and sends a new verification email.
 * Works for:
 *  - Logged-in users whose code expired
 *  - Logged-in users who never entered the original code
 * Also accepts body: { email } for unauthenticated calls (right after register)
 */
export async function POST(req: NextRequest) {
  let targetEmail: string | null = null;

  // Try to get email from session first
  const session = await getServerSession(authOptions);
  if (session?.user?.email) {
    targetEmail = session.user.email;
  } else {
    // Unauthenticated — require email in body (used just after registration)
    try {
      const body = await req.json();
      targetEmail = body?.email?.trim()?.toLowerCase() ?? null;
    } catch {
      // ignore
    }
  }

  if (!targetEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: { email: true, emailVerified: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
  }

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: user.email },
  });

  // Create a fresh OTP (24h)
  const otp = generateOTP();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: user.email, token: otp, expires },
  });

  sendVerificationEmail(user.email, otp);

  return NextResponse.json({ success: true });
}
