import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalArtists, totalIndustry, pendingVerification, totalSubmissions] =
    await Promise.all([
      prisma.user.count({ where: { accountType: "ARTIST" } }),
      prisma.user.count({ where: { accountType: "INDUSTRY" } }),
      prisma.user.count({
        where: { accountType: "INDUSTRY", labelStatus: "PENDING_VERIFICATION" },
      }),
      prisma.submission.count(),
    ]);

  return NextResponse.json({
    totalArtists,
    totalIndustry,
    pendingVerification,
    totalSubmissions,
  });
}
