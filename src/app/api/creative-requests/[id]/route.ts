import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── PATCH: Update status and/or adminNotes ────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin && !session?.user?.isMasterCurator) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { status, adminNotes } = body;

  const validStatuses = ["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"];
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.creativeRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.creativeRequest.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(adminNotes !== undefined && { adminNotes }),
      reviewedById: session.user.id,
    },
  });

  return NextResponse.json({ success: true, request: updated });
}
