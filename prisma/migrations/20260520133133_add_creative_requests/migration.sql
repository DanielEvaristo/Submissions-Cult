-- CreateEnum
CREATE TYPE "CreativeType" AS ENUM ('PHOTOGRAPHER', 'WRITER', 'DESIGNER', 'VIDEOGRAPHER', 'FAN', 'OTHER');

-- CreateEnum
CREATE TYPE "CreativeRequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "CreativeRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "creativeType" "CreativeType" NOT NULL,
    "portfolioUrl" TEXT,
    "message" TEXT NOT NULL,
    "status" "CreativeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreativeRequest_pkey" PRIMARY KEY ("id")
);
