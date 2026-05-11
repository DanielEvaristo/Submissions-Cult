import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AccountType, RoleType, LabelStatus } from "@prisma/client";

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
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // ── Hash password ───────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 12);

    // ── Create user based on accountType ────────────────────────
    if (accountType === AccountType.ARTIST) {
      const { artistName, roleType, country, city } = rest;

      if (!artistName?.trim()) {
        return NextResponse.json(
          { error: "Artist name is required" },
          { status: 400 }
        );
      }

      const existingArtist = await prisma.user.findFirst({
        where: {
          artistName: {
            equals: artistName.trim(),
            mode: "insensitive",
          },
          accountType: AccountType.ARTIST,
        },
      });

      if (existingArtist) {
        return NextResponse.json(
          { error: "An artist with this name is already registered" },
          { status: 409 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          name: artistName.trim(),
          artistName: artistName.trim(),
          accountType: AccountType.ARTIST,
          roleType: (roleType as RoleType) ?? RoleType.ARTIST,
          country: country ?? null,
          city: city ?? null,
          // Auto-verify in MVP — email sending comes in Phase 10
          emailVerified: new Date(),
          labelStatus: LabelStatus.APPROVED,
        },
        select: { id: true, email: true, artistName: true, accountType: true },
      });

      return NextResponse.json(
        { success: true, user, redirect: "/login?verified=1" },
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
