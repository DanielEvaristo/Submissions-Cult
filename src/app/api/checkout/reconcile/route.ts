import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidateSubmissionViews } from "@/lib/revalidate-dashboards";

const CREDIT_PACKS = {
  pack_5: { credits: 5 },
  pack_10: { credits: 10 },
  pack_20: { credits: 20 },
} as const;

type CreditPackId = keyof typeof CREDIT_PACKS;

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = (await req.json()) as { sessionId?: string };

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid checkout session" }, { status: 400 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-04-10" as any,
    });

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    const type = stripeSession.metadata?.type;
    const userId = stripeSession.metadata?.userId;
    const packId = stripeSession.metadata?.packId as CreditPackId | undefined;

    if (type !== "credits" || userId !== session.user.id || !packId || !CREDIT_PACKS[packId]) {
      return NextResponse.json({ error: "Checkout session does not match this user" }, { status: 403 });
    }

    if (stripeSession.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment has not completed" }, { status: 409 });
    }

    const existing = await prisma.creditTransaction.findUnique({
      where: { stripeSessionId: stripeSession.id },
    });

    if (existing) {
      const balance = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true },
      });

      return NextResponse.json({
        success: true,
        duplicate: true,
        credits: balance?.credits ?? null,
      });
    }

    const creditsToAdd = CREDIT_PACKS[packId].credits;

    await prisma.$transaction([
      prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: "PURCHASE",
          credits: creditsToAdd,
          amount: stripeSession.amount_total || 0,
          currency: stripeSession.currency || "usd",
          stripeSessionId: stripeSession.id,
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: creditsToAdd } },
      }),
    ]);

    revalidateSubmissionViews();

    const balance = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    return NextResponse.json({
      success: true,
      creditsAdded: creditsToAdd,
      credits: balance?.credits ?? null,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: true, duplicate: true });
    }

    console.error("[POST /api/checkout/reconcile]", error);
    return NextResponse.json({ error: "Failed to reconcile checkout session" }, { status: 500 });
  }
}
