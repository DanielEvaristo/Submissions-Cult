import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendSubmissionAcceptedEmail,
  sendSubmissionRejectedEmail,
  sendSubmissionPublishedEmail,
} from "@/lib/emails";

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
    const { action, notes, rating, placements, publicationUrl, assignedPremiumServices } = body;

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
          assignedPremiumServices: assignedPremiumServices || [],
          masterReviewedAt: new Date(),
        },
      });

      // Notify the artist (non-blocking)
      const subUser = await prisma.user.findUnique({ where: { id: updated.userId }, select: { email: true } });
      
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "Submission Accepted",
          message: `Your track "${updated.trackTitle}" was accepted for placement!`,
          type: "SUCCESS",
        }
      });

      if (subUser?.email) {
        sendSubmissionAcceptedEmail(subUser.email, updated.trackTitle, updated.placement);
      }

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

      // Notify the artist (non-blocking)
      const subUser = await prisma.user.findUnique({ where: { id: updated.userId }, select: { email: true } });
      
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: "Submission Reviewed",
          message: `Your track "${updated.trackTitle}" was reviewed but not selected for placement.`,
          type: "INFO",
        }
      });

      if (subUser?.email) {
        sendSubmissionRejectedEmail(subUser.email, updated.trackTitle, updated.masterNotes);
      }

      return NextResponse.json(updated);
    }

    // ── Publish ──────────────────────────────────────────────────────────────
    if (action === "publish") {
      if (submission.status !== "ACCEPTED" && submission.status !== "PUBLISHED") {
        return NextResponse.json({ error: "Submission must be ACCEPTED before publishing" }, { status: 400 });
      }
      if (!publicationUrl) {
        return NextResponse.json({ error: "Publication URL is required" }, { status: 400 });
      }

      const publishType = body.publishType || "regular"; // "regular", "interview", "article"
      
      const updateData: any = {
        status: "PUBLISHED",
      };

      if (publishType === "interview") {
        updateData.interviewUrl = publicationUrl;
      } else if (publishType === "article") {
        updateData.articleUrl = publicationUrl;
      } else {
        updateData.publicationUrl = publicationUrl;
        updateData.publishedAt = new Date();
      }

      const updated = await prisma.submission.update({
        where: { id },
        data: updateData,
      });

      // Notify the artist (non-blocking)
      const subUser = await prisma.user.findUnique({ where: { id: updated.userId }, select: { email: true } });
      
      const titleType = publishType === "interview" ? "Interview" : publishType === "article" ? "Article" : "Submission";
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: `${titleType} Published`,
          message: `Your track "${updated.trackTitle}" has a new ${titleType.toLowerCase()} published!`,
          type: "SUCCESS",
          link: publicationUrl
        }
      });

      if (subUser?.email) {
        sendSubmissionPublishedEmail(subUser.email, updated.trackTitle, publicationUrl);
      }

      return NextResponse.json(updated);
    }

  } catch (error) {
    console.error("[PATCH /api/master/submissions/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
