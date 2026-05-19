/**
 * Cult Machine — Comprehensive Seed Script
 * ==========================================
 * Creates all user types and all possible submission states for full testing.
 *
 * Usage: npx prisma db seed
 *
 * All passwords are: 123
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL as string });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

const NOW = new Date();
const HOURS = (h: number) => new Date(NOW.getTime() + h * 3_600_000);
const DAYS_AGO = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

async function main() {
  const HASH = await bcrypt.hash("123", 10);
  console.log("🌱 Seeding Cult Machine database...\n");

  // ─────────────────────────────────────────────────────────────
  // 1. STAFF — Admin, Master Curator, Curators
  // ─────────────────────────────────────────────────────────────

  const admin = await prisma.admin.upsert({
    where: { email: "admin@cultmachine.com" },
    update: {},
    create: {
      email: "admin@cultmachine.com",
      name: "Admin",
      password: HASH,
      role: "SUPER_ADMIN",
      assignedGenres: ["Electronic", "Hip-Hop", "Rock", "Pop", "Latin"],
    },
  });
  console.log("✅ Admin:", admin.email);

  const masterCurator = await prisma.admin.upsert({
    where: { email: "master@cultmachine.com" },
    update: {},
    create: {
      email: "master@cultmachine.com",
      name: "Master Curator",
      password: HASH,
      role: "MASTER_CURATOR",
      assignedGenres: ["Electronic", "Hip-Hop", "Rock", "Pop", "Latin"],
    },
  });
  console.log("✅ Master Curator:", masterCurator.email);

  const curator1 = await prisma.admin.upsert({
    where: { email: "curator1@cultmachine.com" },
    update: {},
    create: {
      email: "curator1@cultmachine.com",
      name: "Curator One",
      password: HASH,
      role: "CURATOR",
      assignedGenres: ["Electronic", "Pop", "Hip-Hop"],
    },
  });
  console.log("✅ Curator 1:", curator1.email);

  const curator2 = await prisma.admin.upsert({
    where: { email: "curator2@cultmachine.com" },
    update: {},
    create: {
      email: "curator2@cultmachine.com",
      name: "Curator Two",
      password: HASH,
      role: "CURATOR",
      assignedGenres: ["Rock", "Metal", "Folk / Acoustic"],
    },
  });
  console.log("✅ Curator 2:", curator2.email);

  // ─────────────────────────────────────────────────────────────
  // 2. ARTISTS — Fully onboarded
  // ─────────────────────────────────────────────────────────────

  const artist1 = await prisma.user.upsert({
    where: { email: "artist1@test.com" },
    update: {},
    create: {
      email: "artist1@test.com",
      name: "Midnight Echo",
      artistName: "Midnight Echo",
      password: HASH,
      accountType: "ARTIST",
      roleType: "ARTIST",
      emailVerified: NOW,
      labelStatus: "APPROVED",
      country: "US",
      city: "Los Angeles",
      bio: "Indie electronic artist blending synth-wave with organic textures.",
      genre: "Electronic",
      subgenre: "Synth-Pop",
      ageRange: "AGE_25_34",
      musicLanguages: ["en"],
      spotifyUrl: "https://open.spotify.com/artist/example1",
      instagram: "@midnightecho",
      monthlyListeners: "FROM_10K_TO_50K",
      instagramFollowers: "FROM_10K_TO_50K",
      hasManager: false,
      careerStartYear: 2019,
      credits: 5,
    },
  });
  console.log("✅ Artist 1:", artist1.email, "(Midnight Echo)");

  const artist2 = await prisma.user.upsert({
    where: { email: "artist2@test.com" },
    update: {},
    create: {
      email: "artist2@test.com",
      name: "Los Cultos",
      artistName: "Los Cultos",
      password: HASH,
      accountType: "ARTIST",
      roleType: "BAND",
      emailVerified: NOW,
      labelStatus: "APPROVED",
      country: "MX",
      city: "Mexico City",
      bio: "Banda de post-punk con influencias del rock latinoamericano.",
      genre: "Rock",
      subgenre: "Post-Punk",
      ageRange: "AGE_18_24",
      musicLanguages: ["es", "en"],
      instagram: "@loscultos",
      monthlyListeners: "FROM_1K_TO_10K",
      instagramFollowers: "FROM_1K_TO_10K",
      hasManager: true,
      careerStartYear: 2021,
      credits: 2,
    },
  });
  console.log("✅ Artist 2:", artist2.email, "(Los Cultos)");

  const artist3 = await prisma.user.upsert({
    where: { email: "artist3@test.com" },
    update: {},
    create: {
      email: "artist3@test.com",
      name: "Nana Pancha",
      artistName: "Nana Pancha",
      password: HASH,
      accountType: "ARTIST",
      roleType: "ARTIST",
      emailVerified: NOW,
      labelStatus: "APPROVED",
      country: "AR",
      city: "Buenos Aires",
      bio: "Latin pop artist with a soulful edge and powerful vocal presence.",
      genre: "Latin",
      subgenre: "Latin Pop",
      ageRange: "AGE_25_34",
      musicLanguages: ["es"],
      instagram: "@nanapancha",
      monthlyListeners: "FROM_50K_TO_100K",
      instagramFollowers: "FROM_50K_TO_100K",
      hasManager: false,
      careerStartYear: 2017,
      credits: 10,
    },
  });
  console.log("✅ Artist 3:", artist3.email, "(Nana Pancha)");

  // Artist with no onboarding (to test the onboarding redirect)
  const artistNew = await prisma.user.upsert({
    where: { email: "newartist@test.com" },
    update: {},
    create: {
      email: "newartist@test.com",
      name: "newartist",
      password: HASH,
      accountType: "ARTIST",
      emailVerified: NOW,
      labelStatus: "APPROVED",
      // no genre = will be redirected to onboarding
    },
  });
  console.log("✅ New Artist (no onboarding):", artistNew.email);

  // ─────────────────────────────────────────────────────────────
  // 3. INDUSTRY — Verified label
  // ─────────────────────────────────────────────────────────────

  const industry = await prisma.user.upsert({
    where: { email: "label@test.com" },
    update: {},
    create: {
      email: "label@test.com",
      name: "Underground Records",
      password: HASH,
      accountType: "INDUSTRY",
      roleType: "AGENCY",
      emailVerified: NOW,
      labelStatus: "APPROVED",
      isVerifiedLabel: true,
      legalName: "Underground Records LLC",
      websiteUrl: "https://undergroundrecords.test",
      labelInstagram: "@undergroundrecords",
    },
  });
  console.log("✅ Industry (label):", industry.email);

  const industryPending = await prisma.user.upsert({
    where: { email: "label-pending@test.com" },
    update: {},
    create: {
      email: "label-pending@test.com",
      name: "Pending Label",
      password: HASH,
      accountType: "INDUSTRY",
      roleType: "PR",
      emailVerified: NOW,
      labelStatus: "PENDING_VERIFICATION",
      legalName: "Pending PR Agency",
    },
  });
  console.log("✅ Industry (pending):", industryPending.email);

  // ─────────────────────────────────────────────────────────────
  // 4. SUBMISSIONS — All possible statuses + premium combos
  // ─────────────────────────────────────────────────────────────

  const submissions = [
    // ── PENDING (no curator assigned yet) ────────────────────
    {
      label: "PENDING — free, no curator yet",
      userId: artist1.id,
      artistName: "Midnight Echo",
      trackTitle: "Neon Drift",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example001",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Electronic"],
      subgenres: ["Synth-Pop"],
      pitch: "A cinematic ride through neon-lit streets. Built for late night drives.",
      channels: [],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
      isFree: true,
      status: "PENDING" as const,
      submittedAt: DAYS_AGO(1),
    },

    // ── IN_REVIEW — regular ────────────────────────────────────
    {
      label: "IN_REVIEW — regular, assigned to curator1",
      userId: artist1.id,
      curatorId: curator1.id,
      artistName: "Midnight Echo",
      trackTitle: "Glass City",
      releaseType: "EP" as const,
      streamingUrl: "https://open.spotify.com/track/example002",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Electronic"],
      subgenres: ["Ambient"],
      pitch: "Ambient textures that blur the line between city noise and music.",
      channels: ["RADAR"],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
      isFree: true,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(2),
    },

    // ── IN_REVIEW — FAST TRACK (deadline in 36h) ──────────────
    {
      label: "IN_REVIEW — FAST TRACK 48H (36h left)",
      userId: artist2.id,
      curatorId: curator1.id,
      artistName: "Los Cultos",
      trackTitle: "Cicatriz",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://soundcloud.com/loscultos/cicatriz",
      streamingPlatform: "SOUNDCLOUD" as const,
      genres: ["Rock"],
      subgenres: ["Post-Punk"],
      pitch: "Una herida que no cierra. Post-punk desde el DF con actitud.",
      channels: ["RADAR", "STORIES"],
      fastTrack: true,
      fastTrackDeadline: HOURS(36),
      reviewRequested: false,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(0.5),
    },

    // ── IN_REVIEW — FAST TRACK expiring soon (3h left) ────────
    {
      label: "IN_REVIEW — FAST TRACK URGENT (3h left)",
      userId: artist3.id,
      curatorId: curator1.id,
      artistName: "Nana Pancha",
      trackTitle: "Fuego Lento",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example004",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Latin"],
      subgenres: ["Latin Pop"],
      pitch: "Un bolero moderno con alma de cumbia. Para sentir sin pensar.",
      channels: ["RADAR"],
      fastTrack: true,
      fastTrackDeadline: HOURS(3),
      reviewRequested: false,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(1.9),
    },

    // ── IN_REVIEW — FAST TRACK EXPIRED ────────────────────────
    {
      label: "IN_REVIEW — FAST TRACK EXPIRED",
      userId: artist2.id,
      curatorId: curator2.id,
      artistName: "Los Cultos",
      trackTitle: "Muros",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://soundcloud.com/loscultos/muros",
      streamingPlatform: "SOUNDCLOUD" as const,
      genres: ["Rock"],
      subgenres: ["Post-Punk"],
      pitch: "Los muros que construimos para no sentir.",
      channels: ["RADAR"],
      fastTrack: true,
      fastTrackDeadline: HOURS(-2), // expired 2h ago
      reviewRequested: false,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(3),
    },

    // ── IN_REVIEW — DETAILED REVIEW only ──────────────────────
    {
      label: "IN_REVIEW — DETAILED REVIEW only",
      userId: artist3.id,
      curatorId: curator2.id,
      artistName: "Nana Pancha",
      trackTitle: "Tormenta de Sal",
      releaseType: "EP" as const,
      streamingUrl: "https://open.spotify.com/track/example006",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Latin"],
      subgenres: ["Latin Pop"],
      pitch: "Un EP sobre el duelo. Cinco canciones, cinco etapas.",
      channels: ["RADAR", "SPOTIFY_PLAYLIST"],
      fastTrack: false,
      reviewRequested: true,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(1),
    },

    // ── IN_REVIEW — FAST TRACK + DETAILED REVIEW combo ────────
    {
      label: "IN_REVIEW — FAST TRACK + DETAILED REVIEW combo",
      userId: artist1.id,
      curatorId: curator1.id,
      artistName: "Midnight Echo",
      trackTitle: "Overture",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example007",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Electronic"],
      subgenres: ["Synth-Pop"],
      pitch: "The opening statement. This is where it all begins.",
      channels: ["RADAR", "STORIES"],
      fastTrack: true,
      fastTrackDeadline: HOURS(20),
      reviewRequested: true,
      premiumServices: [],
      creditsUsed: 2,
      isFree: false,
      status: "IN_REVIEW" as const,
      submittedAt: DAYS_AGO(1.2),
    },

    // ── CURATOR_APPROVED ───────────────────────────────────────
    {
      label: "CURATOR_APPROVED → waiting for master",
      userId: artist1.id,
      curatorId: curator1.id,
      artistName: "Midnight Echo",
      trackTitle: "Static Blue",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example008",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Electronic"],
      subgenres: ["Ambient"],
      pitch: "A meditative piece about disconnection in a hyper-connected world.",
      channels: ["RADAR"],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
      isFree: true,
      status: "CURATOR_APPROVED" as const,
      curatorNotes: "Exceptional production quality. Very aligned with our aesthetic. Strong recommend.",
      curatorRating: 5,
      curatorReviewedAt: DAYS_AGO(1),
      submittedAt: DAYS_AGO(3),
    },

    // ── CURATOR_REJECTED ───────────────────────────────────────
    {
      label: "CURATOR_REJECTED",
      userId: artist2.id,
      curatorId: curator2.id,
      artistName: "Los Cultos",
      trackTitle: "Ruido Blanco",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://soundcloud.com/loscultos/ruido-blanco",
      streamingPlatform: "SOUNDCLOUD" as const,
      genres: ["Rock"],
      subgenres: ["Noise Rock"],
      pitch: "Experimental noise piece. Not for everyone.",
      channels: [],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
      isFree: true,
      status: "CURATOR_REJECTED" as const,
      curatorNotes: "Interesting experiment but doesn't fit our current editorial direction. The mix needs work.",
      curatorRating: 2,
      curatorReviewedAt: DAYS_AGO(2),
      submittedAt: DAYS_AGO(5),
    },

    // ── MASTER_REVIEW ─────────────────────────────────────────
    {
      label: "MASTER_REVIEW — being reviewed by master curator",
      userId: artist3.id,
      curatorId: curator1.id,
      masterCuratorId: masterCurator.id,
      artistName: "Nana Pancha",
      trackTitle: "Cielo Roto",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example010",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Latin"],
      subgenres: ["Latin Pop"],
      pitch: "A powerful ballad about loss and resilience. Production by Rodrigo Blanco.",
      channels: ["RADAR", "SPOTIFY_PLAYLIST"],
      fastTrack: false,
      reviewRequested: true,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "MASTER_REVIEW" as const,
      curatorNotes: "One of the strongest vocals we've heard this quarter. Highly recommended.",
      curatorRating: 5,
      curatorReviewedAt: DAYS_AGO(1),
      submittedAt: DAYS_AGO(4),
    },

    // ── ACCEPTED ──────────────────────────────────────────────
    {
      label: "ACCEPTED — master approved, placement assigned",
      userId: artist1.id,
      curatorId: curator1.id,
      masterCuratorId: masterCurator.id,
      artistName: "Midnight Echo",
      trackTitle: "Phantom Signal",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example011",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Electronic"],
      subgenres: ["Synth-Pop"],
      pitch: "A transmission from another dimension. Synth-wave for the future.",
      channels: ["RADAR", "STORIES"],
      fastTrack: true,
      fastTrackDeadline: DAYS_AGO(1), // already expired, was reviewed in time
      reviewRequested: false,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "ACCEPTED" as const,
      curatorNotes: "Exceptional. The synth arrangement is very original.",
      curatorRating: 5,
      curatorReviewedAt: DAYS_AGO(3),
      masterNotes: "This is our weekly pick. Will feature on Instagram and story rotation.",
      masterRating: 5,
      masterReviewedAt: DAYS_AGO(2),
      placement: "Weekly Feature + Instagram Story",
      submittedAt: DAYS_AGO(6),
    },

    // ── REJECTED (by master) ──────────────────────────────────
    {
      label: "REJECTED — master rejected after curator approved",
      userId: artist2.id,
      curatorId: curator2.id,
      masterCuratorId: masterCurator.id,
      artistName: "Los Cultos",
      trackTitle: "Caída Libre",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://soundcloud.com/loscultos/caida-libre",
      streamingPlatform: "SOUNDCLOUD" as const,
      genres: ["Rock"],
      subgenres: ["Post-Punk"],
      pitch: "Un grito al vacío. El caos organizado.",
      channels: ["RADAR"],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
      isFree: true,
      status: "REJECTED" as const,
      curatorNotes: "Raw energy. I think this could work.",
      curatorRating: 3,
      curatorReviewedAt: DAYS_AGO(5),
      masterNotes: "The recording quality doesn't meet our current standards. Would reconsider a re-recorded version.",
      masterRating: 2,
      masterReviewedAt: DAYS_AGO(4),
      submittedAt: DAYS_AGO(8),
    },

    // ── PUBLISHED ─────────────────────────────────────────────
    {
      label: "PUBLISHED — live with publication link",
      userId: artist3.id,
      curatorId: curator1.id,
      masterCuratorId: masterCurator.id,
      artistName: "Nana Pancha",
      trackTitle: "Mar Adentro",
      releaseType: "SINGLE" as const,
      streamingUrl: "https://open.spotify.com/track/example013",
      streamingPlatform: "SPOTIFY" as const,
      genres: ["Latin"],
      subgenres: ["Latin Pop"],
      pitch: "Un viaje al fondo del mar. Letra introspectiva, producción cinematográfica.",
      channels: ["RADAR", "SPOTIFY_PLAYLIST", "STORIES"],
      fastTrack: false,
      reviewRequested: true,
      premiumServices: [],
      creditsUsed: 1,
      isFree: false,
      status: "PUBLISHED" as const,
      curatorNotes: "One of the most polished productions we've received this year.",
      curatorRating: 5,
      curatorReviewedAt: DAYS_AGO(10),
      masterNotes: "Published on our weekly editorial and Spotify playlist. Phenomenal track.",
      masterRating: 5,
      masterReviewedAt: DAYS_AGO(9),
      placement: "Weekly Feature + Spotify Playlist + Story",
      publicationUrl: "https://www.instagram.com/p/cultmachine_example/",
      publishedAt: DAYS_AGO(7),
      submittedAt: DAYS_AGO(14),
    },
  ];

  let submissionCount = 0;
  for (const sub of submissions) {
    const { label, ...data } = sub;
    await prisma.submission.create({ data: data as any });
    submissionCount++;
    console.log(`  📁 ${label}`);
  }

  // ─────────────────────────────────────────────────────────────
  // 5. Credit Transactions for artist1
  // ─────────────────────────────────────────────────────────────
  await prisma.creditTransaction.create({
    data: {
      userId: artist1.id,
      amount: 500,
      type: "PURCHASE",
      credits: 5,
      currency: "usd",
      stripeSessionId: "cs_test_seed_001",
    },
  });

  // ─────────────────────────────────────────────────────────────
  // Summary
  // ─────────────────────────────────────────────────────────────
  console.log(`\n🎉 Seed complete!`);
  console.log(`   Users created: 8`);
  console.log(`   Submissions created: ${submissionCount}`);
  console.log(`\n📋 LOGIN CREDENTIALS (password: 123)`);
  console.log(`   admin@cultmachine.com       → Admin + Curator + Master`);
  console.log(`   master@cultmachine.com      → Master Curator`);
  console.log(`   curator1@cultmachine.com    → Curator (Electronic, Pop, Hip-Hop)`);
  console.log(`   curator2@cultmachine.com    → Curator (Rock, Metal)`);
  console.log(`   artist1@test.com            → Midnight Echo (5 credits)`);
  console.log(`   artist2@test.com            → Los Cultos (2 credits)`);
  console.log(`   artist3@test.com            → Nana Pancha (10 credits)`);
  console.log(`   newartist@test.com          → New artist (no onboarding)`);
  console.log(`   label@test.com              → Verified Industry label`);
  console.log(`   label-pending@test.com      → Pending Industry review`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
