import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/auth/verify-otp
 * Body: { email: string, code: string }
 * Validates a 6-digit OTP code and marks the user as verified.
 * Does NOT require a session — used immediately after registration.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    const ip = getClientIp(req);
    const limited = rateLimit(`verify-otp:${cleanEmail}:${ip}`, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
      );
    }

    // Find the verification token
    const record = await prisma.verificationToken.findFirst({
      where: { identifier: cleanEmail },
    });

    if (!record) {
      return NextResponse.json({ error: "No verification code found for this email. Request a new one." }, { status: 404 });
    }

    // Check expiration
    if (record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { identifier: cleanEmail } });
      return NextResponse.json({ error: "CODE_EXPIRED" }, { status: 400 });
    }

    // Validate code
    if (record.token !== cleanCode) {
      return NextResponse.json({ error: "Invalid code. Please check your email and try again." }, { status: 400 });
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: cleanEmail },
      data: { emailVerified: new Date() },
    });

    // Clean up used token
    await prisma.verificationToken.deleteMany({ where: { identifier: cleanEmail } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/verify-otp]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
