import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateCuratorViews } from "@/lib/revalidate-dashboards";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || !session.user.isCurator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { action, notes, rating } = body;

    if (!["claim", "approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (action === "claim") {
      if (submission.status !== "PENDING") {
        return NextResponse.json({ error: "Submission is no longer pending" }, { status: 400 });
      }

      if (submission.curatorId && submission.curatorId !== session.user.id) {
        return NextResponse.json(
          { error: "Submission is assigned to another curator" },
          { status: 403 }
        );
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
          curatorId: session.user.id
        }
      });
      revalidateCuratorViews();
      return NextResponse.json(updated);
    }

    // For approve or reject, ensure the curator owns the review
    if (submission.status !== "IN_REVIEW" || submission.curatorId !== session.user.id) {
      return NextResponse.json({ error: "You cannot review this submission" }, { status: 403 });
    }

    if (action === "approve") {
      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "CURATOR_APPROVED",
          curatorNotes: notes,
          curatorRating: rating,
          curatorReviewedAt: new Date()
        }
      });
      
      // Auto-move to MASTER_REVIEW as defined in flow
      const moved = await prisma.submission.update({
        where: { id },
        data: { status: "MASTER_REVIEW" }
      });

      revalidateCuratorViews();
      return NextResponse.json(moved);
    }

    if (action === "reject") {
      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "CURATOR_REJECTED",
          curatorNotes: notes,
          curatorRating: rating,
          curatorReviewedAt: new Date()
        }
      });

      // Notify the artist
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "Submission Reviewed",
          message: `Your track "${updated.trackTitle}" was reviewed but not accepted.`,
          type: "INFO",
        }
      });

      revalidateCuratorViews();
      return NextResponse.json(updated);
    }

  } catch (error) {
    console.error("[PATCH /api/curator/submissions/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
