import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ exists: false });
  }

  try {
    const existingArtist = await prisma.user.findFirst({
      where: {
        artistName: {
          equals: name,
          mode: "insensitive",
        },
        accountType: "ARTIST",
      },
    });

    return NextResponse.json({ exists: !!existingArtist });
  } catch (error) {
    console.error("[check-name] Error:", error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}
