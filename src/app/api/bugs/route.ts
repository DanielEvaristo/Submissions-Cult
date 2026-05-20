import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, url } = await req.json();

    if (!description || typeof description !== "string") {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    const bugReport = await prisma.bugReport.create({
      data: {
        userId: session.user.id,
        description: description.trim(),
        url: url || null,
      },
    });

    return NextResponse.json({ success: true, bugReport }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/bugs] ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (!session.user.isAdmin && !session.user.isMasterCurator && !session.user.isCurator)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bugs = await prisma.bugReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, artistName: true, accountType: true } },
      },
    });

    return NextResponse.json({ bugs });
  } catch (err: any) {
    console.error("[GET /api/bugs] ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
