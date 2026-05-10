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
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { accountType: "ARTIST" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        artistName: true,
        email: true,
        country: true,
        genre: true,
        roleType: true,
        createdAt: true,
        _count: { select: { submissions: true } },
      },
    }),
    prisma.user.count({ where: { accountType: "ARTIST" } }),
  ]);

  return NextResponse.json({ users, total, page, pageSize });
}
