import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AccountType, RoleType, LabelStatus } from "@prisma/client";
import { sendVerificationEmail, sendIndustryWelcomeEmail } from "@/lib/emails";
import { generateOTP } from "@/lib/otp";
import { devLog } from "@/lib/dev-log";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountType, email, password, ...rest } = body;

    // ── Validation ──────────────────────────────────────────────
    if (!email || !password || !accountType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 }
      );
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 }
      );
    }

    // ── Duplicate check ─────────────────────────────────────────
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    devLog("[REGISTER API] found existing:", existing ? existing.accountStatus : "not found");
    if (existing) {
      // Si la cuenta fue importada desde legacy, mostrar mensaje especial
      if (existing.accountStatus === "PENDING_CLAIM") {
        devLog("[REGISTER API] returning PENDING_CLAIM");
        return NextResponse.json(
          { error: "PENDING_CLAIM", code: "PENDING_CLAIM" },
          { status: 409 }
        );
      }
      devLog("[REGISTER API] returning generic exists");
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Hash password ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user based on accountType ────────────────────────
    if (accountType === AccountType.ARTIST) {
      const { roleType, country, city } = rest;

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: email.split("@")[0], // Fallback name until they fill onboarding
          artistName: null, // Will be filled in onboarding
          accountType: AccountType.ARTIST,
          roleType: (roleType as RoleType) ?? RoleType.ARTIST,
          country: country ?? null,
          city: city ?? null,
          // Removed auto-verify — user must confirm via email
          emailVerified: null,
          labelStatus: LabelStatus.APPROVED,
        },
        select: { id: true, email: true, artistName: true, accountType: true },
      });

      const otp = generateOTP();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await prisma.verificationToken.create({
        data: { identifier: user.email, token: otp, expires },
      });

      // Send OTP email (non-blocking)
      sendVerificationEmail(user.email, otp);

      return NextResponse.json(
        { success: true, user, redirect: `/verify-email?email=${encodeURIComponent(user.email)}` },
        { status: 201 }
      );
    }

    if (accountType === AccountType.INDUSTRY) {
      const { legalName, roleType, websiteUrl, labelInstagram, country, city, description } = rest;

      if (!legalName?.trim()) {
        return NextResponse.json(
          { error: "Company name is required" },
          { status: 400 }
        );
      }
      if (!websiteUrl?.trim()) {
        return NextResponse.json(
          { error: "Official website is required" },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: legalName.trim(),
          legalName: legalName.trim(),
          accountType: AccountType.INDUSTRY,
          roleType: (roleType as RoleType) ?? RoleType.MANAGEMENT,
          websiteUrl: websiteUrl.trim(),
          labelInstagram: labelInstagram?.trim() ?? null,
          country: country ?? null,
          city: city ?? null,
          bio: description?.trim() ?? null,
          // Industry accounts are NOT auto-verified
          labelStatus: LabelStatus.PENDING_VERIFICATION,
        },
        select: { id: true, email: true, legalName: true, accountType: true },
      });

      // Send welcome email to industry account (non-blocking)
      // Send welcome email to industry account (non-blocking)
      sendIndustryWelcomeEmail(user.email, legalName.trim());

      return NextResponse.json(
        { success: true, user, redirect: "/login?industryCreated=1" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Invalid account type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[/api/register] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
