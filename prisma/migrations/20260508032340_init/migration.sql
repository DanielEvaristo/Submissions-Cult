-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ARTIST', 'INDUSTRY');

-- CreateEnum
CREATE TYPE "LabelStatus" AS ENUM ('PENDING_VERIFICATION', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ARTIST', 'BAND', 'MANAGEMENT', 'PR', 'AGENCY');

-- CreateEnum
CREATE TYPE "AgeRange" AS ENUM ('UNDER_18', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_PLUS');

-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('SINGLE', 'EP', 'ALBUM');

-- CreateEnum
CREATE TYPE "StreamingPlatform" AS ENUM ('SPOTIFY', 'SOUNDCLOUD', 'DEEZER', 'OTHER');

-- CreateEnum
CREATE TYPE "Opportunity" AS ENUM ('WEEKLY', 'SPOTIFY', 'WEBRADIO', 'ALBUM_STORY');

-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('DARK', 'LIGHT');

-- CreateEnum
CREATE TYPE "UILanguage" AS ENUM ('EN', 'ES', 'FR');

-- CreateEnum
CREATE TYPE "ListenersRange" AS ENUM ('UNDER_1K', 'FROM_1K_TO_10K', 'FROM_10K_TO_50K', 'FROM_50K_TO_100K', 'FROM_100K_TO_500K', 'OVER_500K');

-- CreateEnum
CREATE TYPE "DistributionMethod" AS ENUM ('DISTROKID', 'TUNECORE', 'CD_BABY', 'RECORD_LABEL', 'INDEPENDENT', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_REVIEW', 'CURATOR_APPROVED', 'CURATOR_REJECTED', 'MASTER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "password" TEXT,
    "accountType" "AccountType" NOT NULL DEFAULT 'ARTIST',
    "artistName" TEXT,
    "roleType" "RoleType" NOT NULL DEFAULT 'ARTIST',
    "country" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "genre" TEXT,
    "subgenre" TEXT,
    "ageRange" "AgeRange",
    "memberAgeRanges" JSONB,
    "bandSize" INTEGER,
    "spotifyUrl" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "soundcloudUrl" TEXT,
    "website" TEXT,
    "musicLanguages" TEXT[],
    "careerStartYear" INTEGER,
    "monthlyListeners" "ListenersRange",
    "distributionMethod" "DistributionMethod",
    "hasManager" BOOLEAN NOT NULL DEFAULT false,
    "legalName" TEXT,
    "websiteUrl" TEXT,
    "labelInstagram" TEXT,
    "isVerifiedLabel" BOOLEAN NOT NULL DEFAULT false,
    "labelStatus" "LabelStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "rejectionReason" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "isCurator" BOOLEAN NOT NULL DEFAULT false,
    "isMasterCurator" BOOLEAN NOT NULL DEFAULT false,
    "theme" "Theme" NOT NULL DEFAULT 'DARK',
    "language" "UILanguage" NOT NULL DEFAULT 'EN',
    "credits" INTEGER NOT NULL DEFAULT 0,
    "firstSubUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ManagedArtist" (
    "id" TEXT NOT NULL,
    "industryUserId" TEXT NOT NULL,
    "artistName" TEXT NOT NULL,
    "genre" TEXT,
    "subgenre" TEXT,
    "spotifyUrl" TEXT,
    "instagram" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagedArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "managedArtistId" TEXT,
    "artistName" TEXT NOT NULL,
    "trackTitle" TEXT NOT NULL,
    "releaseType" "ReleaseType" NOT NULL,
    "releaseDate" TEXT,
    "streamingUrl" TEXT NOT NULL,
    "streamingPlatform" "StreamingPlatform",
    "genres" TEXT[],
    "subgenres" TEXT[],
    "pitch" TEXT,
    "pressKitUrl" TEXT,
    "opportunity" "Opportunity" NOT NULL,
    "autoFilledTitle" TEXT,
    "autoFilledArtist" TEXT,
    "autoFilledCover" TEXT,
    "autoFillSource" TEXT,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "curatorId" TEXT,
    "curatorNotes" TEXT,
    "curatorRating" INTEGER,
    "curatorReviewedAt" TIMESTAMP(3),
    "masterCuratorId" TEXT,
    "masterNotes" TEXT,
    "masterRating" INTEGER,
    "placement" TEXT,
    "masterReviewedAt" TIMESTAMP(3),
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripePaymentIntentId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "donorName" TEXT,
    "donorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_stripePaymentIntentId_key" ON "Donation"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManagedArtist" ADD CONSTRAINT "ManagedArtist_industryUserId_fkey" FOREIGN KEY ("industryUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_managedArtistId_fkey" FOREIGN KEY ("managedArtistId") REFERENCES "ManagedArtist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
