import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { artistName: { contains: q, mode: "insensitive" } },
        { legalName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      artistName: true,
      legalName: true,
      email: true,
      accountType: true,
      roleType: true,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
