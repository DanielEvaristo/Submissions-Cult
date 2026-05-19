/*
  Warnings:

  - You are about to drop the column `assignedGenres` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `distributionMethod` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isAdmin` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isCurator` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isMasterCurator` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'CURATOR', 'MASTER_CURATOR');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_curatorId_fkey";

-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_masterCuratorId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "assignedGenres",
DROP COLUMN "distributionMethod",
DROP COLUMN "isAdmin",
DROP COLUMN "isCurator",
DROP COLUMN "isMasterCurator",
ADD COLUMN     "state" TEXT;

-- DropEnum
DROP TYPE "DistributionMethod";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'CURATOR',
    "assignedGenres" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "theme" "Theme" NOT NULL DEFAULT 'DARK',
    "language" "UILanguage" NOT NULL DEFAULT 'EN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_masterCuratorId_fkey" FOREIGN KEY ("masterCuratorId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
