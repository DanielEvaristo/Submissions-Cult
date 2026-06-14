import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendPasswordChangedEmail } from "@/lib/emails";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 5 password change attempts per 15 minutes
  const ip = getClientIp(req);
  const limited = rateLimit(`password:${session.user.id}:${ip}`, 5, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait before trying again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } }
    );
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    }

    let userRecord;
    let isAdmin = session.user.userType === "ADMIN";

    if (isAdmin) {
      userRecord = await prisma.admin.findUnique({
        where: { id: session.user.id }
      });
    } else {
      userRecord = await prisma.user.findUnique({
        where: { id: session.user.id }
      });
    }

    if (!userRecord || !userRecord.password) {
      return NextResponse.json({ error: "User not found or no password set" }, { status: 400 });
    }

    const isValid = await bcrypt.compare(currentPassword, userRecord.password);

    if (!isValid) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    if (isAdmin) {
      await prisma.admin.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
      });
    } else {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashedPassword }
      });
    }

    // Send security alert email (non-blocking)
    if (userRecord.email) {
      sendPasswordChangedEmail(userRecord.email, userRecord.name ?? "User");
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("[PATCH /api/auth/password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
