import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // ONLY ALLOW IN DEVELOPMENT
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { credits, amount } = await req.json();

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: credits } }
      }),
      prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: "PURCHASE",
          credits: credits,
          amount: amount * 100, // cents
          currency: "usd",
          stripeSessionId: "debug_" + Date.now(),
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
