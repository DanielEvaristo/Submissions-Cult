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
    const body = await req.json();
    if (!body.submissionId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: body.submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (submission.premiumPrStatus !== "APPROVED") {
      return NextResponse.json({ error: "Premium PR is not approved for payment" }, { status: 400 });
    }

    const lineItems = [];

    if (submission.premiumServices.includes("INTERVIEW")) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "EXCLUSIVE INTERVIEW (Labor Cost)",
          },
          unit_amount: 3000,
        },
        quantity: 1,
      });
    }

    if (submission.premiumServices.includes("ARTICLE")) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "DEDICATED ARTICLE (Labor Cost)",
          },
          unit_amount: 2500,
        },
        quantity: 1,
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "No premium services to pay for" }, { status: 400 });
    }

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: session.user.email,
      line_items: lineItems,
      success_url: body.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/submissions?payment=success`,
      cancel_url: body.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/en/portal/submissions?payment=canceled`,
      metadata: {
        type: "premium-pr",
        submissionId: submission.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err: any) {
    console.error("[POST /api/checkout/premium-pr] ERROR:", err);
    return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
  }
}
