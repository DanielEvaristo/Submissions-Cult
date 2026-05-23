import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // 1. Fetch Submissions with premiumServices
    const submissions = await prisma.submission.findMany({
      where: {
        premiumServices: {
          isEmpty: false,
        },
      },
      include: {
        user: {
          select: {
            artistName: true,
            email: true,
            instagram: true,
            spotifyUrl: true,
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    // 2. Fetch CreativeRequests
    const creativeRequests = await prisma.creativeRequest.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 3. Format and merge them into a unified array
    const formattedSubmissions = submissions.map(sub => ({
      id: sub.id,
      type: "SUBMISSION",
      name: sub.artistName || sub.user?.artistName || "Unknown",
      email: sub.user?.email || "",
      instagram: sub.instagram || sub.user?.instagram,
      spotifyUrl: sub.spotifyUrl || sub.user?.spotifyUrl,
      requestedServices: sub.premiumServices,
      status: sub.premiumPrStatus, // REQUESTED, APPROVED, PAID, REJECTED
      date: sub.submittedAt,
      paymentLink: sub.premiumPaymentLink,
      cost: sub.totalCostUsd,
    }));

    const formattedCreative = creativeRequests.map(cr => ({
      id: cr.id,
      type: "CREATIVE",
      name: cr.name,
      email: cr.email,
      instagram: null,
      spotifyUrl: cr.portfolioUrl,
      requestedServices: [cr.creativeType],
      status: cr.status, // PENDING, APPROVED, REJECTED, COMPLETED
      date: cr.createdAt,
      paymentLink: null,
      cost: null,
    }));

    const allRequests = [...formattedSubmissions, ...formattedCreative].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json({ requests: allRequests });
  } catch (err: any) {
    console.error("[GET /api/admin/premium-pr] ERROR:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
