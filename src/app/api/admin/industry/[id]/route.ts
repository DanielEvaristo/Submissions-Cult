import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;

  let body: { action: string; reason?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.action || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.accountType !== "INDUSTRY") {
    return NextResponse.json({ error: "Industry user not found" }, { status: 404 });
  }

  if (body.action === "approve") {
    await prisma.user.update({
      where: { id },
      data: { labelStatus: "APPROVED", isVerifiedLabel: true, rejectionReason: null },
    });
  } else {
    await prisma.user.update({
      where: { id },
      data: {
        labelStatus: "REJECTED",
        isVerifiedLabel: false,
        rejectionReason: body.reason?.trim() ?? null,
      },
    });
  }

  return NextResponse.json({ success: true });
}
