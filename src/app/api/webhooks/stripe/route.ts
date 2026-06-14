import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { sendCreditPurchaseEmail, sendSubmissionConfirmationEmail } from "@/lib/emails";
import { revalidateSubmissionViews } from "@/lib/revalidate-dashboards";
import { devLog } from "@/lib/dev-log";
import { findLeastLoadedCuratorId } from "@/lib/curator-assignment";


const CREDIT_PACKS = {
  pack_5: { credits: 5 },
  pack_10: { credits: 10 },
  pack_20: { credits: 20 },
} as const;

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-04-10" as any,
  });

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown webhook error";
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const submissionId = session.metadata?.submissionId;
    const type = session.metadata?.type;
    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId as keyof typeof CREDIT_PACKS | undefined;
    const donationCents = parseInt(session.metadata?.donationCents || "0", 10);
    const retentionDiscountApplied = session.metadata?.retentionDiscountApplied === "true";

    devLog("[STRIPE WEBHOOK] Checkout completed:", {
      type,
      userId,
      submissionId,
      packId,
    });

    if (type === "credits" && userId && packId && CREDIT_PACKS[packId]) {
      const existing = await prisma.creditTransaction.findUnique({
        where: { stripeSessionId: session.id },
      });
      if (existing) {
        return NextResponse.json({ received: true, duplicate: true });
      }

      const creditsToAdd = CREDIT_PACKS[packId].credits;

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { credits: { increment: creditsToAdd } },
        }),
        prisma.creditTransaction.create({
          data: {
            userId,
            type: "PURCHASE",
            credits: creditsToAdd,
            amount: session.amount_total || 0,
            currency: "usd",
            stripeSessionId: session.id,
          },
        }),
      ]);

      revalidateSubmissionViews();

      const buyer = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });
      if (buyer?.email) {
        sendCreditPurchaseEmail(
          buyer.email,
          buyer.name ?? "User",
          creditsToAdd,
          session.amount_total || 0
        );
      }
    } else if (type === "submission" && submissionId) {
      // Fetch the submission to get genre info needed for curator assignment
      const existingSubmission = await prisma.submission.findUnique({
        where: { id: submissionId },
        select: { genres: true, status: true, userId: true, creditsUsed: true, trackTitle: true, artistName: true },
      });

      if (!existingSubmission) {
        devLog("[STRIPE WEBHOOK] Submission not found:", submissionId);
        return NextResponse.json({ received: true });
      }

      // Assign a curator now that payment is confirmed (only if not already assigned)
      const curatorId = existingSubmission.status === "AWAITING_PAYMENT"
        ? await findLeastLoadedCuratorId(prisma, existingSubmission.genres)
        : null;

      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          isFree: false,
          totalCostUsd: session.amount_total || 0,
          // Activate submission if it was waiting for payment
          ...(existingSubmission.status === "AWAITING_PAYMENT" && {
            status: curatorId ? "IN_REVIEW" : "PENDING",
            curatorId,
          }),
        },
        select: {
          userId: true,
          creditsUsed: true,
        },
      });

      devLog("[STRIPE WEBHOOK] Submission activated after payment:", submissionId, "→", curatorId ? "IN_REVIEW" : "PENDING");

      // Log the submission payment in the transaction history so it appears in the user's credit log
      const existingSubmissionTx = await prisma.creditTransaction.findFirst({
        where: {
          userId: existingSubmission.userId,
          type: "SUBMISSION_PAYMENT",
          stripeSessionId: session.id,
        },
      });
      if (!existingSubmissionTx) {
        await prisma.creditTransaction.create({
          data: {
            userId: existingSubmission.userId,
            type: "SUBMISSION_PAYMENT",
            credits: 0,
            amount: session.amount_total || 0,
            currency: "usd",
            stripeSessionId: session.id,
          },
        });
      }

      if (existingSubmission.status === "AWAITING_PAYMENT") {
        const user = await prisma.user.findUnique({
          where: { id: submission.userId },
          select: { email: true },
        });
        if (user?.email) {
          sendSubmissionConfirmationEmail(
            user.email,
            existingSubmission.trackTitle,
            existingSubmission.artistName
          );
        }
      }

      if (retentionDiscountApplied) {
        const existingOffer = await prisma.creditTransaction.findFirst({
          where: {
            userId: submission.userId,
            type: "RETENTION_OFFER",
            stripeSessionId: session.id,
          },
        });

        if (!existingOffer) {
          const discountAmount = Math.round(submission.creditsUsed * 100 * 0.5);
          await prisma.creditTransaction.create({
            data: {
              userId: submission.userId,
              type: "RETENTION_OFFER",
              credits: submission.creditsUsed,
              amount: -discountAmount,
              currency: "usd",
              stripeSessionId: session.id,
            },
          });
        }
      }

      if (donationCents > 0 && session.payment_intent) {
        try {
          await prisma.donation.create({
            data: {
              amount: donationCents,
              currency: "usd",
              stripePaymentIntentId: session.payment_intent as string,
              status: "succeeded",
              donorEmail: session.customer_email || undefined,
            },
          });
        } catch {
          // Idempotent: payment_intent is unique
        }
      }

      revalidateSubmissionViews();
    } else if (type === "premium-pr" && submissionId) {
      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          premiumPrStatus: "PAID",
          premiumServicesPaid: true,
        },
        select: {
          userId: true,
          premiumServices: true,
        },
      });

      const existingPremiumPrTx = await prisma.creditTransaction.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (!existingPremiumPrTx) {
        await prisma.creditTransaction.create({
          data: {
            userId: submission.userId,
            type: "PREMIUM_PR_PURCHASE",
            credits: 0,
            amount: session.amount_total || 0,
            currency: "usd",
            stripeSessionId: session.id,
          },
        });
      }

      revalidateSubmissionViews();
    } else if (type === "premium_service" && submissionId) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          premiumServicesPaid: true,
          premiumPrStatus: "PAID",
          premiumPaymentIntentId: session.payment_intent as string,
        },
      });
      revalidateSubmissionViews();
      devLog("[STRIPE WEBHOOK] Premium services paid for submission:", submissionId);
    }
  }

  return NextResponse.json({ received: true });
}
