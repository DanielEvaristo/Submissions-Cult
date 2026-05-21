import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";
import { assertVerifiedIndustry } from "@/lib/industry-access";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        legalName: true,
        roleType: true,
        websiteUrl: true,
        labelInstagram: true,
        country: true,
        city: true,
        bio: true,
        isVerifiedLabel: true,
        labelStatus: true,
      },
    });
    
    return NextResponse.json(user);
  } catch (err) {
    console.error("[GET /api/industry/profile]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.accountType !== "INDUSTRY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const industryBlock = assertVerifiedIndustry(session.user);
  if (industryBlock) {
    return NextResponse.json({ error: industryBlock }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Build sanitized update object
  const update: Record<string, unknown> = {};

  if (typeof body.legalName === "string") update.legalName = body.legalName.trim();
  if (typeof body.websiteUrl === "string") update.websiteUrl = body.websiteUrl.trim();
  if (typeof body.labelInstagram === "string") update.labelInstagram = body.labelInstagram.trim();
  if (typeof body.country === "string") update.country = body.country.trim();
  if (typeof body.city === "string") update.city = body.city.trim();
  if (typeof body.bio === "string") update.bio = body.bio.trim().slice(0, 500);

  // Validated enum fields
  const validRoles = Object.values(RoleType) as string[];
  if (typeof body.roleType === "string" && validRoles.includes(body.roleType)) {
    update.roleType = body.roleType as RoleType;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: update,
      select: { id: true },
    });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/industry/profile]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
