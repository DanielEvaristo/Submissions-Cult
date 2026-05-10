import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { Users, PlusCircle, Music } from "lucide-react";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

export default async function IndustryDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Welcome Header */}
      <div className="bg-bg-surface border border-border rounded-2xl p-10 mb-8 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-sm">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent-red/5 via-bg to-bg opacity-50" />
        
        <h1 className="font-sans text-4xl md:text-5xl font-extrabold text-cm-text-primary tracking-tight mb-4 relative z-10">
          Welcome to Cult Machine, {session?.user?.name || "Agency"}!
        </h1>
        <p className="font-sans text-lg text-cm-text-secondary max-w-2xl relative z-10 mb-8">
          Manage your artists, submit tracks to top-tier curators, and oversee your entire roster from one centralized dashboard.
        </p>

        <div className="flex items-center justify-center gap-4 relative z-10 flex-wrap">
          <Link
            href={`/${locale}/industry/artists/new`}
            className="bg-accent-red text-white hover:bg-accent-red/90 px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-accent-red/20 flex items-center gap-2"
          >
            <PlusCircle size={18} />
            ADD NEW ARTIST
          </Link>
          <Link
            href={`/${locale}/industry/submit`}
            className="bg-bg-elevated text-cm-text-primary border border-border hover:border-cm-text-muted px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all shadow-sm flex items-center gap-2"
          >
            <Music size={18} />
            SUBMIT A SONG
          </Link>
          <Link
            href={`/${locale}/industry/artists`}
            className="bg-bg-surface text-cm-text-secondary hover:text-cm-text-primary px-8 py-4 rounded-full font-sans font-bold text-sm tracking-wide transition-all border border-transparent hover:border-border flex items-center gap-2"
          >
            <Users size={18} />
            VIEW ROSTER
          </Link>
        </div>
      </div>
    </div>
  );
}
