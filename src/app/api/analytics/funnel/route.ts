import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/analytics/funnel
 * Records an anonymous funnel step event.
 * Body: { sessionId, step, completed?, opportunity?, locale? }
 *
 * Called from SubmitFlow whenever the user advances a step or completes the form.
 * sessionId is generated client-side and stored in localStorage so we can group
 * events per "session" without requiring authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, step, completed = false, opportunity = null, locale = null } = body;

    if (!sessionId || typeof step !== "number") {
      return NextResponse.json({ error: "sessionId and step are required" }, { status: 400 });
    }

    await prisma.funnelEvent.create({
      data: {
        sessionId,
        step,
        completed,
        opportunity: opportunity ?? null,
        locale: locale ?? null,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/analytics/funnel]", err);
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
