import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Status, Opportunity } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const oppParam = searchParams.get("opportunity");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;

  const validStatuses = Object.values(Status) as string[];
  const validOpps = Object.values(Opportunity) as string[];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (statusParam && validStatuses.includes(statusParam)) where.status = statusParam as Status;
  if (oppParam && validOpps.includes(oppParam)) where.opportunity = oppParam as Opportunity;

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        trackTitle: true,
        artistName: true,
        opportunity: true,
        status: true,
        genres: true,
        autoFilledCover: true,
        streamingUrl: true,
        submittedAt: true,
        premiumPrStatus: true,
        premiumServices: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.submission.count({ where }),
  ]);

  return NextResponse.json({ submissions, total, page, pageSize });
}
