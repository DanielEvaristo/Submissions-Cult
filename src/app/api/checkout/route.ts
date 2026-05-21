import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReleaseType } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

const CREDIT_PACKS = {
  pack_5: { credits: 5, priceCents: 400, label: "Starter Pack" },
  pack_10: { credits: 10, priceCents: 700, label: "Popular Pack" },
  pack_20: { credits: 20, priceCents: 1200, label: "Pro Pack" },
} as const;

type CreditPackId = keyof typeof CREDIT_PACKS;

type CheckoutBody =
  | {
      type: "credits";
      packId: CreditPackId;
      successUrl?: string;
      cancelUrl?: string;
    }
  | {
      type: "submission";
      submissionId: string;
      email?: string;
      donation?: boolean;
      retentionDiscountApplied?: boolean;
      successUrl?: string;
      cancelUrl?: string;
    };

function getCreditCostForSubmission(
  releaseType: ReleaseType,
  channels: string[],
  fastTrack: boolean,
  reviewRequested: boolean
) {
  const baseCredits = releaseType === "ALBUM" ? 2 : releaseType === "EP" ? 1 : 0;
  const channelCredits = channels.length >= 4 ? 1 : 0;
  const fastTrackCredits = fastTrack ? 1 : 0;
  const reviewCredits = reviewRequested ? 1 : 0;
  return baseCredits + channelCredits + fastTrackCredits + reviewCredits;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function getCreditUsdValue(credits: number) {
  if (credits <= 0) return 0;
  if (credits === 1) return 100;
  if (credits >= 20) return 1200;
  if (credits >= 10) return 700;
  if (credits >= 5) return 400;
  return credits * 100;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;

    if (body.type === "credits") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const pack = CREDIT_PACKS[body.packId];
      if (!pack) {
        return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
      }

      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: session.user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${pack.credits} SUBMISSION CREDITS - ${pack.label}`,
              },
              unit_amount: pack.priceCents,
            },
            quantity: 1,
          },
        ],
        success_url:
          body.successUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/credits?success=true`,
        cancel_url:
          body.cancelUrl ||
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/credits?canceled=true`,
        metadata: {
          type: "credits",
          packId: body.packId,
          userId: session.user.id,
        },
      });

      return NextResponse.json({ url: stripeSession.url });
    }

    if (body.type !== "submission" || !body.submissionId) {
      return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: body.submissionId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const ANONYMOUS_CHECKOUT_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours after submit

    if (session?.user?.id) {
      if (submission.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else {
      const normalizedEmail = body.email?.toLowerCase().trim();
      const emailMatches =
        !!normalizedEmail &&
        submission.user.email.toLowerCase() === normalizedEmail;
      const isRecent =
        Date.now() - submission.submittedAt.getTime() <= ANONYMOUS_CHECKOUT_WINDOW_MS;

      if (!emailMatches || !isRecent) {
        return NextResponse.json(
          { error: "Please log in to complete payment for this submission." },
          { status: 401 }
        );
      }
    }

    const creditCost = submission.creditsUsed > 0
      ? 0
      : getCreditCostForSubmission(
          submission.releaseType,
          submission.channels,
          submission.fastTrack,
          submission.reviewRequested
        );

    const retentionThreshold = new Date(Date.now() - THIRTY_DAYS_MS);
    const retentionOfferCount = body.retentionDiscountApplied
      ? await prisma.creditTransaction.count({
          where: {
            userId: submission.userId,
            type: "RETENTION_OFFER",
            createdAt: { gte: retentionThreshold },
          },
        })
      : 0;

    if (body.retentionDiscountApplied && retentionOfferCount > 0) {
      return NextResponse.json({ error: "Retention offer already used this month" }, { status: 409 });
    }

    const lineItems = [];
    const creditCostCents = body.retentionDiscountApplied ? Math.round(getCreditUsdValue(creditCost) * 0.5) : getCreditUsdValue(creditCost);

    if (creditCostCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: body.retentionDiscountApplied ? `${creditCost} SUBMISSION CREDITS (50% OFF)` : `${creditCost} SUBMISSION CREDITS`,
          },
          unit_amount: creditCostCents,
        },
        quantity: 1,
      });
    }

    // Note: Premium Services (INTERVIEW, ARTICLE) are no longer charged upfront.
    // They are requested here, approved by an admin, and then paid via a separate link.
    if (body.donation) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "SUPPORT THE CULT (DONATION)",
          },
          unit_amount: 500,
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No payable items for this submission" }, { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email:
        session?.user?.email || body.email?.toLowerCase().trim() || submission.user.email,
      line_items: lineItems,
      success_url:
        body.successUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/submit-now?success=true`,
      cancel_url:
        body.cancelUrl ||
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/submit-now?canceled=true`,
      metadata: {
        type: "submission",
        submissionId: submission.id,
        donationCents: body.donation ? "500" : "0",
        retentionDiscountApplied: body.retentionDiscountApplied ? "true" : "false",
        userId: submission.userId,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    const message = error instanceof Error ? error.message : "Stripe Session Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
