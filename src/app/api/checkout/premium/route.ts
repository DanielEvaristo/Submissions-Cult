import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-04-10" as any,
  });

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await req.json();
    if (!submissionId) {
      return NextResponse.json({ error: "Missing submission ID" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        user: { select: { email: true } },
      },
    });

    if (!submission || submission.userId !== session.user.id) {
      return NextResponse.json({ error: "Submission not found or unauthorized" }, { status: 404 });
    }

    if (submission.status !== "ACCEPTED" && submission.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Submission is not accepted" }, { status: 400 });
    }

    if (!submission.assignedPremiumServices || submission.assignedPremiumServices.length === 0) {
      return NextResponse.json({ error: "No premium services assigned" }, { status: 400 });
    }

    if (submission.premiumServicesPaid) {
      return NextResponse.json({ error: "Premium services already paid" }, { status: 400 });
    }

    const lineItems = [];

    if (submission.assignedPremiumServices.includes("INTERVIEW")) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "EXCLUSIVE INTERVIEW",
          },
          unit_amount: 3000,
        },
        quantity: 1,
      });
    }

    if (submission.assignedPremiumServices.includes("ARTICLE")) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "DEDICATED ARTICLE",
          },
          unit_amount: 2500,
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No valid payable premium services" }, { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email || submission.user.email,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/submissions?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/submissions?canceled=true`,
      metadata: {
        type: "premium_service",
        submissionId: submission.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("[PREMIUM_CHECKOUT_ERROR]", error);
    const message = error instanceof Error ? error.message : "Stripe Session Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
