import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SubmitFlow from "@/components/submit/SubmitFlow";
import Link from "next/link";
import { Users } from "lucide-react";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

export default async function IndustrySubmitPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null; // Layout handles redirect
  }

  if (!session.user.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  // Fetch their managed artists to pass to the form
  const managedArtists = await prisma.managedArtist.findMany({
    where: { industryUserId: session.user.id },
    select: { id: true, artistName: true },
    orderBy: { artistName: "asc" },
  });

  if (managedArtists.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-bg-surface border border-border rounded-xl p-10 text-center shadow-sm">
          <Users size={48} className="mx-auto text-cm-text-muted mb-4" />
          <h2 className="font-sans text-2xl font-bold text-cm-text-primary mb-2">
            No Artists in Roster
          </h2>
          <p className="font-sans text-cm-text-secondary mb-8">
            You need to add at least one artist to your roster before you can submit a track on their behalf.
          </p>
          <Link href={`/${locale}/industry/artists/new`} className="btn-primary inline-flex">
            Add an Artist
          </Link>
        </div>
      </div>
    );
  }

  return <SubmitFlow basePath="/industry" managedArtists={managedArtists} />;
}
