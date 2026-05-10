import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LabelStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const validStatuses = Object.values(LabelStatus) as string[];

  const where =
    statusParam && validStatuses.includes(statusParam)
      ? { accountType: "INDUSTRY" as const, labelStatus: statusParam as LabelStatus }
      : { accountType: "INDUSTRY" as const };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      legalName: true,
      websiteUrl: true,
      labelInstagram: true,
      labelStatus: true,
      isVerifiedLabel: true,
      rejectionReason: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}
