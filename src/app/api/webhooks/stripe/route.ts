import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { sendCreditPurchaseEmail } from "@/lib/emails";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

const CREDIT_PACKS = {
  pack_5: { credits: 5 },
  pack_10: { credits: 10 },
  pack_20: { credits: 20 },
} as const;

export async function POST(req: Request) {
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

    console.log("[STRIPE WEBHOOK] Checkout completed:", { type, userId, submissionId, packId, donationCents, retentionDiscountApplied });

    if (type === "credits" && userId && packId && CREDIT_PACKS[packId]) {
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

      // Send purchase receipt email (non-blocking)
      const buyer = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      if (buyer?.email) {
        sendCreditPurchaseEmail(buyer.email, buyer.name ?? "User", creditsToAdd, session.amount_total || 0);
      }
    } else if (type === "submission" && submissionId) {
      const submission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          isFree: false,
          totalCostUsd: session.amount_total || 0,
        },
        select: {
          userId: true,
          creditsUsed: true,
        },
      });

      if (retentionDiscountApplied) {
        const discountAmount = Math.round(submission.creditsUsed * 100 * 0.5);
        await prisma.creditTransaction.create({
          data: {
            userId: submission.userId,
            type: "RETENTION_OFFER",
            credits: submission.creditsUsed,
            amount: -discountAmount,
            currency: "usd",
          },
        });
      }

      if (donationCents > 0 && session.payment_intent) {
        await prisma.donation.create({
          data: {
            amount: donationCents,
            currency: "usd",
            stripePaymentIntentId: session.payment_intent as string,
            status: "succeeded",
            donorEmail: session.customer_email || undefined,
          },
        });
      }
    } else if (type === "premium-pr" && submissionId) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          premiumPrStatus: "PAID",
        },
      });
    } else if (type === "premium_service" && submissionId) {
      await prisma.submission.update({
        where: { id: submissionId },
        data: {
          premiumServicesPaid: true,
          premiumPaymentIntentId: session.payment_intent as string,
        },
      });
      console.log("[STRIPE WEBHOOK] Premium services paid for submission:", submissionId);
    }
  }

  return NextResponse.json({ received: true });
}
