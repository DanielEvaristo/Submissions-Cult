import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.isMasterCurator) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { action, notes, rating, placements, publicationUrl } = body;

    if (!["accept", "reject", "publish"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({ where: { id } });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // ── Accept ──────────────────────────────────────────────────────────────
    if (action === "accept") {
      if (submission.status !== "MASTER_REVIEW") {
        return NextResponse.json({ error: "Submission is not ready for master review" }, { status: 400 });
      }
      if (!placements || placements.length === 0) {
        return NextResponse.json({ error: "Placements are required to accept a submission" }, { status: 400 });
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "ACCEPTED",
          masterCuratorId: session.user.id,
          masterNotes: notes,
          masterRating: rating,
          placement: placements.join(", "),
          masterReviewedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    // ── Reject ───────────────────────────────────────────────────────────────
    if (action === "reject") {
      if (submission.status !== "MASTER_REVIEW") {
        return NextResponse.json({ error: "Submission is not ready for master review" }, { status: 400 });
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "REJECTED",
          masterCuratorId: session.user.id,
          masterNotes: notes,
          masterRating: rating,
          masterReviewedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

    // ── Publish ──────────────────────────────────────────────────────────────
    if (action === "publish") {
      if (submission.status !== "ACCEPTED") {
        return NextResponse.json({ error: "Submission must be ACCEPTED before publishing" }, { status: 400 });
      }
      if (!publicationUrl) {
        return NextResponse.json({ error: "Publication URL is required" }, { status: 400 });
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          publicationUrl,
          publishedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    }

  } catch (error) {
    console.error("[PATCH /api/master/submissions/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
