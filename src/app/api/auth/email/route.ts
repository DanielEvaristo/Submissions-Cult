import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sanitizeInput } from "@/lib/security";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { newEmail, password } = body as { newEmail?: string; password?: string };

  if (!newEmail || !password) {
    return NextResponse.json({ error: "New email and current password are required." }, { status: 400 });
  }

  const cleanEmail = sanitizeInput(newEmail.trim().toLowerCase());

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
  }

  // Fetch user with hashed password
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true, email: true },
  });

  if (!user || !user.password) {
    return NextResponse.json({ error: "Cannot change email for OAuth accounts." }, { status: 400 });
  }

  if (user.email === cleanEmail) {
    return NextResponse.json({ error: "New email must be different from your current email." }, { status: 400 });
  }

  // Verify current password
  const isValid = await bcrypt.compare(password as string, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 403 });
  }

  // Check if new email is already taken
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) {
    return NextResponse.json({ error: "This email is already associated with another account." }, { status: 409 });
  }

  // Update email and reset email verification
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        email: cleanEmail,
        emailVerified: null, // Reset verification on email change
      },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/auth/email]", err);
    return NextResponse.json({ error: "Database error. Please try again." }, { status: 500 });
  }
}
