import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/premium-pr/[id]
// Approve or reject a Premium PR request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (!session.user.isAdmin && !session.user.isMasterCurator)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json(); // "APPROVED" or "REJECTED"

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Only allow updating if it's currently REQUESTED
    if (submission.premiumPrStatus !== "REQUESTED") {
      return NextResponse.json({ error: "No pending Premium PR request found for this submission." }, { status: 400 });
    }

    const updated = await prisma.submission.update({
      where: { id: params.id },
      data: {
        premiumPrStatus: status as any,
        ...(status === "APPROVED" && {
          assignedPremiumServices: submission.premiumServices,
        }),
      },
    });

    return NextResponse.json({ success: true, submission: updated });
  } catch (err: any) {
    console.error("[PATCH /api/admin/premium-pr] ERROR:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
