import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Music, Send, ArrowRight, Zap, BarChart3 } from "lucide-react";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

export default async function IndustryDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  // ── Real stats from DB ────────────────────────────────────────────
  const [
    totalArtists,
    totalSubmissions,
    activeSubmissions,
    acceptedSubmissions,
    creditsData,
  ] = await Promise.all([
    prisma.managedArtist.count({
      where: { industryUserId: session.user.id },
    }),
    prisma.submission.count({
      where: { managedArtist: { industryUserId: session.user.id } },
    }),
    prisma.submission.count({
      where: {
        managedArtist: { industryUserId: session.user.id },
        status: { in: ["PENDING", "IN_REVIEW", "CURATOR_APPROVED", "MASTER_REVIEW"] },
      },
    }),
    prisma.submission.count({
      where: {
        managedArtist: { industryUserId: session.user.id },
        status: { in: ["ACCEPTED", "PUBLISHED"] },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
  ]);

  const credits = creditsData?.credits ?? 0;
  const successRate = totalSubmissions > 0
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
    : 0;

  const stats = [
    { label: "Artists on Roster", value: totalArtists.toString(), sub: "Managed artists", accent: false },
    { label: "Active Submissions", value: activeSubmissions.toString(), sub: "Under review", accent: false },
    { label: "Selected Tracks", value: acceptedSubmissions.toString(), sub: "Accepted or published", accent: true },
    { label: "Success Rate", value: `${successRate}%`, sub: `${totalSubmissions} total sent`, accent: false },
  ];

  return (
    <div className="max-w-6xl mx-auto py-6 md:py-12 px-4 md:px-6 space-y-6 md:space-y-10 animate-reveal">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="border-b-4 border-white/10 pb-6 md:pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 md:gap-4">
        <div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2 md:mb-3 block">
            AGENCY_WORKSPACE / DASHBOARD
          </span>
          <h1 className="text-[clamp(32px,8vw,72px)] font-black uppercase leading-[0.85] tracking-tighter text-white">
            WELCOME,{" "}
            {session.user.name ? session.user.name.split(" ")[0] : "AGENCY"}.★
          </h1>
        </div>
        {/* Credits pill — hidden on mobile (shown in top bar nav) */}
        <Link
          href={`/${locale}/industry/credits`}
          className="hidden md:flex items-center gap-3 px-6 py-4 bg-[#F5E000] text-black hover:bg-white transition-all group shrink-0"
        >
          <Zap size={16} strokeWidth={3} />
          <span className="font-black text-xs uppercase tracking-widest">{credits} Credits</span>
          <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`border-4 p-4 md:p-8 flex flex-col justify-between min-h-[110px] md:min-h-[140px] transition-all group ${
              stat.accent
                ? "border-[#F5E000] bg-[#F5E000]"
                : "border-white/10 bg-black hover:border-[#F5E000]/40"
            }`}
          >
            <span className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] leading-tight ${stat.accent ? "text-black/50" : "text-white/20"}`}>
              {stat.label}
            </span>
            <div>
              <span className={`block text-4xl md:text-6xl font-black tracking-tighter leading-none ${stat.accent ? "text-black" : "text-white"}`}>
                {stat.value}
              </span>
              <span className={`block text-[8px] font-bold uppercase tracking-widest mt-1 ${stat.accent ? "text-black/40" : "text-white/10"}`}>
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      {/* Mobile: stacked full-width cards | Desktop: 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">

        {/* Submit Track — primary, full width on mobile */}
        <Link
          href={`/${locale}/industry/submit`}
          className="md:col-span-2 border-4 border-white/10 p-6 md:p-12 flex flex-row md:flex-col justify-between items-center md:items-start gap-4 md:gap-0 min-h-[100px] md:min-h-[280px] bg-black hover:bg-[#F5E000] group transition-all shadow-[4px_4px_0px_0px_rgba(245,224,0,0.08)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
        >
          <div className="flex items-center md:block gap-4 flex-1">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F5E000] group-hover:bg-black flex items-center justify-center shrink-0 md:mb-6 transition-colors">
              <Send size={18} strokeWidth={3} className="text-black group-hover:text-[#F5E000]" />
            </div>
            <div>
              <h2 className="text-xl md:text-4xl font-black uppercase tracking-tighter text-white group-hover:text-black leading-none mb-1 md:mb-3">
                SUBMIT A TRACK.
              </h2>
              <p className="text-white/40 group-hover:text-black/50 font-bold text-xs md:text-sm uppercase tracking-tight hidden md:block">
                Send one of your roster artists to the Cult Machine editorial team.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[#F5E000] group-hover:text-black font-black text-[10px] md:text-xs uppercase tracking-[0.3em] shrink-0">
            <span className="hidden md:inline">Submit Now</span>
            <ArrowRight size={14} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Secondary actions — horizontal on mobile, vertical on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 md:gap-4">
          <Link
            href={`/${locale}/industry/artists/new`}
            className="border-4 border-white/10 p-5 md:p-8 bg-black hover:border-[#F5E000] hover:bg-[#F5E000]/5 group transition-all flex flex-col gap-3 md:justify-between"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 border-2 border-white/10 group-hover:border-[#F5E000] group-hover:bg-[#F5E000] flex items-center justify-center transition-all">
              <Users size={15} strokeWidth={3} className="text-white/40 group-hover:text-black" />
            </div>
            <div>
              <h3 className="font-black text-xs md:text-sm uppercase tracking-[0.15em] text-white group-hover:text-[#F5E000] mb-0.5 leading-tight">Add Artist</h3>
              <p className="text-white/20 font-bold text-[9px] md:text-xs uppercase tracking-tight hidden md:block">Register a new act to your roster</p>
            </div>
          </Link>

          <Link
            href={`/${locale}/industry/submissions`}
            className="border-4 border-white/10 p-5 md:p-8 bg-black hover:border-[#F5E000] hover:bg-[#F5E000]/5 group transition-all flex flex-col gap-3 md:justify-between"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 border-2 border-white/10 group-hover:border-[#F5E000] group-hover:bg-[#F5E000] flex items-center justify-center transition-all">
              <BarChart3 size={15} strokeWidth={3} className="text-white/40 group-hover:text-black" />
            </div>
            <div>
              <h3 className="font-black text-xs md:text-sm uppercase tracking-[0.15em] text-white group-hover:text-[#F5E000] mb-0.5 leading-tight">Activity</h3>
              <p className="text-white/20 font-bold text-[9px] md:text-xs uppercase tracking-tight hidden md:block">Track all your submission statuses</p>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Footer Quote ──────────────────────────────────────────── */}
      <div className="pt-4 md:pt-6 border-t-2 border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5E000] italic">
          "NO ALGORITHMS. JUST EARS."
        </p>
      </div>
    </div>
  );
}
