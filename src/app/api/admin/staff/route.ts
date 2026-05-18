import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rebalanceActiveCuratorAssignments } from "@/lib/curator-assignment";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET /api/admin/staff - list all staff members
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const staff = await prisma.user.findMany({
      where: {
        OR: [
          { isCurator: true },
          { isMasterCurator: true }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        isCurator: true,
        isMasterCurator: true,
        assignedGenres: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(staff);
  } catch (err) {
    console.error("[GET /api/admin/staff]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/staff - create a new staff member
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, email, password, role, assignedGenres } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isCurator = role === "CURATOR" || role === "MASTER_CURATOR";
    const isMasterCurator = role === "MASTER_CURATOR";

    const newUser = await prisma.user.create({
      data: {
        name: name || "Staff Member",
        email,
        password: hashedPassword,
        // Since we bypass registration, we'll assign ARTIST generically, but they won't use it
        accountType: "ARTIST",
        isCurator,
        isMasterCurator,
        assignedGenres: assignedGenres || [],
      }
    });

    const rebalance = isCurator && !isMasterCurator
      ? await rebalanceActiveCuratorAssignments(prisma)
      : null;

    return NextResponse.json({
      success: true,
      id: newUser.id,
      rebalance,
    }, { status: 201 });

  } catch (err) {
    console.error("[POST /api/admin/staff]", err);
    return NextResponse.json({ error: "Failed to create staff member" }, { status: 500 });
  }
}
