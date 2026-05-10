import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ChevronLeft, Music, ExternalLink, Calendar, PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

export default async function IndustryArtistDetailsPage({
  params: { locale, id },
}: {
  params: { locale: string; id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "INDUSTRY") {
    redirect(`/${locale}/login`);
  }

  if (!session.user.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  // Fetch artist and ensure it belongs to this industry user
  const artist = await prisma.managedArtist.findUnique({
    where: { id },
    include: {
      submissions: {
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!artist || artist.industryUserId !== session.user.id) {
    redirect(`/${locale}/industry/artists`);
  }

  const statusLabel = (s: string): string => {
    if (s === "PENDING" || s === "IN_REVIEW" || s === "CURATOR_APPROVED" || s === "MASTER_REVIEW") {
      return "UNDER REVIEW";
    }
    if (s === "ACCEPTED") return "SELECTED";
    return "NOT SELECTED";
  };

  const getStatusColor = (s: string) => {
    if (s === "PENDING" || s === "IN_REVIEW" || s === "CURATOR_APPROVED" || s === "MASTER_REVIEW") return "badge-review";
    if (s === "ACCEPTED") return "badge-selected";
    return "badge-rejected";
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href={`/${locale}/industry/artists`}
        className="btn-ghost mb-6 -ml-4 inline-flex items-center gap-1"
      >
        <ChevronLeft size={16} />
        Back to Roster
      </Link>

      {/* Artist Profile Header */}
      <div className="bg-bg-surface border border-border rounded-2xl p-8 mb-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-accent-red/10 flex items-center justify-center border border-accent-red/20 text-accent-red shrink-0">
            <Music size={32} />
          </div>
          <div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary mb-1">
              {artist.artistName}
            </h1>
            <p className="font-sans text-cm-text-secondary font-medium">
              {artist.genre || "No genre specified"} {artist.subgenre ? ` / ${artist.subgenre}` : ""}
            </p>
            {artist.spotifyUrl && (
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-red hover:text-accent-red/80 transition-colors mt-3"
              >
                <ExternalLink size={14} />
                Open in Spotify
              </a>
            )}
          </div>
        </div>
        
        <Link
          href={`/${locale}/industry/submit`}
          className="btn-primary flex items-center gap-2 shrink-0"
        >
          <PlusCircle size={16} />
          Submit Track
        </Link>
      </div>

      {/* Submissions Section */}
      <div className="mb-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary">Submissions History</h2>
        <p className="font-sans text-sm text-cm-text-secondary mt-1">Tracks submitted on behalf of {artist.artistName}.</p>
      </div>

      {artist.submissions.length === 0 ? (
        <div className="bg-bg-surface border border-border rounded-xl p-12 text-center shadow-sm">
          <Music size={40} className="mx-auto text-cm-text-muted mb-4" />
          <h3 className="font-sans text-lg font-bold text-cm-text-primary mb-2">No submissions yet</h3>
          <p className="font-sans text-sm text-cm-text-secondary mb-6 max-w-sm mx-auto">
            You haven't submitted any tracks for this artist. Send a song to start seeing their progress here.
          </p>
          <Link href={`/${locale}/industry/submit`} className="btn-primary inline-flex">
            Submit a Track
          </Link>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
          {artist.submissions.map((sub) => (
            <div key={sub.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-elevated transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-md bg-bg-elevated border border-border overflow-hidden flex items-center justify-center shrink-0">
                  {sub.autoFilledCover ? (
                    <img src={sub.autoFilledCover} alt={sub.trackTitle} className="w-full h-full object-cover" />
                  ) : (
                    <Music size={20} className="text-cm-text-muted" />
                  )}
                </div>
                <div>
                  <p className="font-sans text-lg font-bold text-cm-text-primary leading-tight">
                    {sub.trackTitle}
                  </p>
                  <p className="font-sans text-sm text-cm-text-secondary mt-1">
                    {sub.opportunity} · {sub.genres[0]}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 justify-between sm:justify-end border-t sm:border-0 border-border pt-4 sm:pt-0 mt-2 sm:mt-0">
                <div className="flex flex-col sm:items-end">
                  <div className={`shrink-0 ${getStatusColor(sub.status)} inline-flex mb-1.5`}>
                    <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-2 py-0.5">
                      {statusLabel(sub.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-cm-text-muted">
                    <Calendar size={12} />
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
