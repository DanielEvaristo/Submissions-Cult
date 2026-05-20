import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── POST: Public — anyone can submit a creative request ─────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, creativeType, portfolioUrl, message } = body;

    if (!name?.trim() || !email?.trim() || !creativeType || !message?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const validTypes = ["PHOTOGRAPHER", "WRITER", "DESIGNER", "VIDEOGRAPHER", "FAN", "OTHER"];
    if (!validTypes.includes(creativeType)) {
      return NextResponse.json({ error: "Invalid creative type" }, { status: 400 });
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: "Message too long (max 1000 characters)" }, { status: 400 });
    }

    const request = await prisma.creativeRequest.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        creativeType,
        portfolioUrl: portfolioUrl?.trim() || null,
        message: message.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, id: request.id }, { status: 201 });
  } catch (err) {
    console.error("[creative-requests POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── GET: Protected — Admin (SUPER_ADMIN) or Master Curator only ──────────────
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin && !session?.user?.isMasterCurator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = status ? { status: status as any } : {};

  const [requests, total] = await Promise.all([
    prisma.creativeRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.creativeRequest.count({ where }),
  ]);

  const counts = await prisma.creativeRequest.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const statusCounts = counts.reduce((acc, c) => {
    acc[c.status] = c._count._all;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({ requests, total, page, limit, statusCounts });
}
