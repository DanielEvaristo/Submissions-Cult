import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AgeRange, DistributionMethod, FollowersRange, ListenersRange, RoleType } from "@prisma/client";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const update: Record<string, unknown> = {};

  if (typeof body.country === "string") update.country = body.country.trim();
  if (typeof body.city === "string") update.city = body.city.trim();
  if (typeof body.bio === "string") update.bio = body.bio.trim().slice(0, 500);
  if (typeof body.genre === "string") update.genre = body.genre.trim();

  // Handle artistName with uniqueness check
  if (typeof body.artistName === "string") {
    const newArtistName = body.artistName.trim();
    if (newArtistName) {
      const existingArtist = await prisma.user.findFirst({
        where: {
          artistName: {
            equals: newArtistName,
            mode: "insensitive",
          },
          accountType: "ARTIST",
          id: { not: session.user.id },
        },
      });

      if (existingArtist) {
        return NextResponse.json(
          { error: "This artist name is already registered by another account." },
          { status: 409 }
        );
      }
      update.artistName = newArtistName;
      update.name = newArtistName; // Also update the NextAuth name field
    }
  }
  if (typeof body.subgenre === "string") update.subgenre = body.subgenre.trim();
  if (typeof body.instagram === "string") update.instagram = body.instagram.trim();
  if (typeof body.tiktok === "string") update.tiktok = body.tiktok.trim();
  if (typeof body.youtube === "string") update.youtube = body.youtube.trim();
  if (typeof body.website === "string") update.website = body.website.trim();
  if (typeof body.spotifyUrl === "string") update.spotifyUrl = body.spotifyUrl.trim();
  if (typeof body.soundcloudUrl === "string") update.soundcloudUrl = body.soundcloudUrl.trim();
  if (typeof body.careerStartYear === "number") update.careerStartYear = body.careerStartYear;
  if (typeof body.hasManager === "boolean") update.hasManager = body.hasManager;
  if (typeof body.bandSize === "number") update.bandSize = body.bandSize;

  const validRoles = Object.values(RoleType) as string[];
  if (typeof body.roleType === "string" && validRoles.includes(body.roleType)) {
    update.roleType = body.roleType as RoleType;
  }

  const validAgeRanges = Object.values(AgeRange) as string[];
  if (typeof body.ageRange === "string" && validAgeRanges.includes(body.ageRange)) {
    update.ageRange = body.ageRange as AgeRange;
  }

  const validListeners = Object.values(ListenersRange) as string[];
  if (typeof body.monthlyListeners === "string" && validListeners.includes(body.monthlyListeners)) {
    update.monthlyListeners = body.monthlyListeners as ListenersRange;
  }

  const validFollowers = Object.values(FollowersRange) as string[];
  if (typeof body.instagramFollowers === "string" && validFollowers.includes(body.instagramFollowers)) {
    update.instagramFollowers = body.instagramFollowers as FollowersRange;
  }

  const validDist = Object.values(DistributionMethod) as string[];
  if (typeof body.distributionMethod === "string" && validDist.includes(body.distributionMethod)) {
    update.distributionMethod = body.distributionMethod as DistributionMethod;
  }

  if (Array.isArray(body.musicLanguages)) {
    update.musicLanguages = body.musicLanguages.filter((language): language is string => typeof language === "string");
  }
  if (Array.isArray(body.memberAgeRanges)) {
    update.memberAgeRanges = body.memberAgeRanges;
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: update,
      select: { id: true, genre: true },
    });
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error("[PATCH /api/artist/profile]", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
