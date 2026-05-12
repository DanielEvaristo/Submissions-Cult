import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ExternalLink, Music } from "lucide-react";
import { redirect } from "next/navigation";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

import IndustryArtistsClient from "@/components/industry/IndustryArtistsClient";

export default async function IndustryArtistsPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "INDUSTRY") {
    redirect(`/${locale}/login`);
  }

  if (!session.user.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  const artists = await prisma.managedArtist.findMany({
    where: { industryUserId: session.user.id },
    orderBy: { artistName: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-reveal h-full flex flex-col">
      <IndustryArtistsClient artists={artists} locale={locale} />
    </div>
  );
}

// Just an inline icon component for empty state
function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
