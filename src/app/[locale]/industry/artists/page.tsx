import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { PlusCircle, ExternalLink, Music } from "lucide-react";
import { redirect } from "next/navigation";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary">
            My Artists Roster
          </h1>
          <p className="font-sans text-cm-text-secondary mt-2">
            Manage your clients and submit music on their behalf.
          </p>
        </div>
        <Link
          href={`/${locale}/industry/artists/new`}
          className="btn-primary flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Add Artist
        </Link>
      </div>

      {artists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-bg-surface border border-border rounded-xl shadow-sm text-center">
          <UsersIcon size={48} className="text-cm-text-muted mb-4" />
          <h2 className="font-sans text-lg font-bold text-cm-text-primary mb-2">No artists found</h2>
          <p className="font-sans text-sm text-cm-text-secondary mb-6 max-w-sm">
            You haven't added any artists to your roster yet. Add an artist to start submitting their music.
          </p>
          <Link href={`/${locale}/industry/artists/new`} className="btn-primary">
            Add Your First Artist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div key={artist.id} className="relative bg-bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-cm-text-muted transition-colors flex flex-col group">
              {/* Full card clickable link */}
              <Link href={`/${locale}/industry/artists/${artist.id}`} className="absolute inset-0 z-0" />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center border border-accent-red/20 text-accent-red shrink-0">
                  <Music size={20} />
                </div>
                {artist.spotifyUrl && (
                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-cm-text-muted hover:text-cm-text-primary hover:bg-bg-elevated rounded-md transition-all"
                    title="Open in Spotify"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              
              <h3 className="font-sans text-xl font-bold text-cm-text-primary mb-1 truncate relative z-10 group-hover:text-accent-red transition-colors">
                {artist.artistName}
              </h3>
              <p className="font-sans text-sm font-medium text-cm-text-secondary mb-4 truncate">
                {artist.genre || "No genre specified"} {artist.subgenre ? ` / ${artist.subgenre}` : ""}
              </p>

              <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                <p className="font-sans text-xs text-cm-text-muted">
                  Added {new Date(artist.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
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
