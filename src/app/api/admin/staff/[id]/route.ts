import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id || !session.user.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = params;
  
  if (!id) {
    return NextResponse.json({ error: "Missing staff ID" }, { status: 400 });
  }

  // Prevent an admin from deleting themselves
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isCurator && !user.isMasterCurator) {
      return NextResponse.json({ error: "User is not a staff member" }, { status: 400 });
    }

    // 1. Unassign any submissions they were reviewing (return them to the pool)
    await prisma.submission.updateMany({
      where: { curatorId: id },
      data: { curatorId: null, status: "PENDING" }
    });

    // 2. Unassign any master reviews
    await prisma.submission.updateMany({
      where: { masterCuratorId: id },
      data: { masterCuratorId: null, status: "CURATOR_APPROVED" }
    });

    // 3. Delete any test submissions they might have made themselves
    await prisma.submission.deleteMany({
      where: { userId: id }
    });

    // 4. Finally, delete the user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/staff/[id]]", error);
    return NextResponse.json({ error: "Failed to delete staff member" }, { status: 500 });
  }
}
