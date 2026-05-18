-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'PENDING_CLAIM', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "FollowersRange" AS ENUM ('UNDER_1K', 'FROM_1K_TO_10K', 'FROM_10K_TO_50K', 'FROM_50K_TO_100K', 'FROM_100K_TO_500K', 'OVER_500K');

-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'PUBLISHED';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "channels" TEXT[],
ADD COLUMN     "fastTrack" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fastTrackDeadline" TIMESTAMP(3),
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "premiumServices" TEXT[],
ADD COLUMN     "publicationUrl" TEXT,
ADD COLUMN     "publishedAt" TIMESTAMP(3),
ADD COLUMN     "reviewRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderName" TEXT,
ADD COLUMN     "spotifyUrl" TEXT,
ADD COLUMN     "totalCostUsd" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "opportunity" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "assignedGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "instagramFollowers" "FollowersRange";

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripeSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_stripeSessionId_key" ON "CreditTransaction"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_masterCuratorId_fkey" FOREIGN KEY ("masterCuratorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
