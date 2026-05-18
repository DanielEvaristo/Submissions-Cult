import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Send } from "lucide-react";

const ACTIVE_STATUSES = ["PENDING", "IN_REVIEW", "CURATOR_APPROVED", "MASTER_REVIEW"] as const;

export default async function PortalDashboard({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const [totalSubmissions, activeSubmissions, totalTracksSent] = await Promise.all([
    prisma.submission.count({
      where: { userId: session.user.id },
    }),
    prisma.submission.count({
      where: {
        userId: session.user.id,
        status: { in: [...ACTIVE_STATUSES] },
      },
    }),
    prisma.submission.findMany({
      where: { userId: session.user.id },
      select: { trackTitle: true },
      distinct: ["trackTitle"],
    }).then((rows) => rows.length),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-12 animate-reveal">
      <div className="border-b-4 border-white/10 pb-12 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">ARTIST_WORKSPACE / DASHBOARD</span>
          <h1 className="text-[clamp(40px,8vw,80px)] font-black uppercase leading-[0.85] tracking-tighter text-white">
            {session.user.name ? `WELCOME, ${session.user.name}` : "MY TRACKS"}★
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="border-4 border-white/10 p-6 sm:p-12 flex flex-col justify-between min-h-[350px] sm:min-h-[450px] bg-black hover:bg-[#F5E000] group transition-all shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)] sm:shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2">
          <div>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#F5E000] flex items-center justify-center text-black mb-6 sm:mb-8 group-hover:bg-black group-hover:text-white transition-colors">
              <Send size={24} className="sm:hidden" strokeWidth={3} />
              <Send size={32} className="hidden sm:block" strokeWidth={3} />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-4 sm:mb-6 text-white group-hover:text-black leading-none">
              SHARE<br/>YOUR SOUND.
            </h2>
            <p className="text-white/40 font-bold text-sm sm:text-lg leading-relaxed group-hover:text-black/60 uppercase tracking-tight">
              Submit your latest track to our curators and get featured in the next Cult Machine update.
            </p>
          </div>

          <Link
            href={`/${locale}/portal/submit`}
            className="w-full sm:w-fit flex items-center justify-center gap-4 px-12 py-6 bg-[#F5E000] text-black font-black uppercase text-xs tracking-[0.3em] border-2 border-black hover:bg-white transition-all mt-12 shadow-[4px_4px_0px_0px_rgba(245,224,0,0.2)] group-hover:bg-black group-hover:text-white group-hover:border-white/20"
          >
            SUBMIT NOW
          </Link>
        </div>

        <div className="border-4 border-[#F5E000]/20 p-6 sm:p-12 flex flex-col justify-between bg-black text-white shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)] sm:shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
          <div>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-8 sm:mb-12 leading-none">
              YOUR<br/>IMPACT.
            </h2>
            <div className="space-y-8 sm:space-y-10">
              <div className="flex justify-between items-end border-b-2 border-white/20 pb-4">
                <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-[#F5E000]">ACTIVE CREDITS</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">{session.user.credits || 0}</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-white/20 pb-4">
                <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-white/40">SUBMISSIONS SENT</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">{totalSubmissions}</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-white/20 pb-4">
                <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-white/40">ACTIVE SUBMISSIONS</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">{activeSubmissions}</span>
              </div>
              <div className="flex justify-between items-end border-b-2 border-white/20 pb-4">
                <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] text-white/40">TRACKS SENT</span>
                <span className="text-4xl sm:text-6xl font-black tracking-tighter leading-none">{totalTracksSent}</span>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-white/10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5E000] italic">
              "NO ALGORITHMS. JUST EARS."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
