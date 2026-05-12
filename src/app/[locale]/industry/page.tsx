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
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Welcome Header */}
      <div className="bg-black border-4 border-white/10 p-12 mb-12 relative overflow-hidden flex flex-col items-start text-left">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5E000] rotate-45 translate-x-32 -translate-y-32 opacity-20 pointer-events-none" />
        
        <div className="relative z-10">
          <span className="inline-block px-4 py-1 bg-[#F5E000] text-black font-sans text-[10px] font-black uppercase tracking-[0.4em] mb-6">
            AGENCY OVERVIEW
          </span>
          <h1 className="font-sans text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
            WELCOME,<br/>{session?.user?.name?.split(' ')[0] || "USER"}.
          </h1>
          <p className="font-sans text-xl text-[#999999] max-w-2xl mb-12 font-light leading-relaxed uppercase">
            MANAGE YOUR ROSTER. SUBMIT TRACKS. SCALE YOUR REACH.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10 flex-wrap w-full">
          <Link
            href={`/${locale}/industry/artists/new`}
            className="flex-1 min-w-[200px] bg-[#F5E000] text-black px-8 py-6 font-sans font-black text-xs tracking-[0.2em] uppercase transition-all hover:bg-white flex items-center justify-between group"
          >
            <span>Add New Artist</span>
            <PlusCircle size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </Link>
          <Link
            href={`/${locale}/industry/submit`}
            className="flex-1 min-w-[200px] bg-black text-white px-8 py-6 font-sans font-black text-xs tracking-[0.2em] uppercase transition-all hover:bg-[#F5E000] hover:text-black flex items-center justify-between group border-2 border-white/10"
          >
            <span>Submit a Song</span>
            <Music size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </Link>
          <Link
            href={`/${locale}/industry/artists`}
            className="flex-1 min-w-[200px] border-2 border-white/20 text-white px-8 py-6 font-sans font-black text-xs tracking-[0.2em] uppercase transition-all hover:border-[#F5E000] hover:text-[#F5E000] flex items-center justify-between group"
          >
            <span>View Roster</span>
            <Users size={20} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </Link>
        </div>
      </div>

      {/* Grid for stats or recent activity could go here */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Artists", value: "12", sub: "Managing roster" },
          { label: "Pending Reviews", value: "4", sub: "In editorial queue" },
          { label: "Total Reach", value: "82K", sub: "Last 30 days" },
        ].map((stat, i) => (
          <div key={i} className="border-4 border-white/10 p-8 bg-black hover:bg-[#F5E000] transition-all group">
            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-white/20 group-hover:text-black/40 mb-4">{stat.label}</span>
            <span className="block text-6xl font-black tracking-tighter text-white group-hover:text-black">{stat.value}</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-white/10 group-hover:text-black/30 mt-2">{stat.sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
