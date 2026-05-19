import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/en/login?error=invalid-token", req.url));
  }

  try {
    // Find the verification token
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      return NextResponse.redirect(new URL("/en/login?error=invalid-token", req.url));
    }

    // Check expiration
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(new URL("/en/login?error=token-expired", req.url));
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.redirect(new URL("/en/login?verified=1", req.url));
  } catch (err) {
    console.error("[GET /api/auth/verify-email]", err);
    return NextResponse.redirect(new URL("/en/login?error=server-error", req.url));
  }
}
