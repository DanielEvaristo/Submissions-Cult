"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mic2, Building2, Check } from "lucide-react";

export default function RoleSelectionPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const handleSelectArtist = () => {
    // Si es artista, sigue el flujo actual (ir a submit-now)
    router.push(`/${locale}/submit-now`);
  };

  const handleSelectIndustry = () => {
    // Si es industry, ir a registrarse con type=INDUSTRY
    router.push(`/${locale}/register?type=INDUSTRY`);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      
      {/* Left: Brand */}
      <div className="w-full md:w-1/3 bg-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[30vh] md:min-h-screen">
        <Link href={`/${locale}/landing`} className="flex items-center gap-2 text-white hover:text-[#F5E000] transition-colors relative z-10">
          <span className="text-2xl md:text-3xl">★</span>
          <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">CULT MACHINE</span>
        </Link>
        <div className="mt-12 md:mt-20 relative z-10">
          <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter">
            CHOOSE<br />YOUR<br /><span className="text-[#F5E000] underline underline-offset-[10px] decoration-4">PATH.</span>
          </h1>
        </div>
        <div className="mt-auto relative z-10">
          <p className="text-[#444444] text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] italic">
            {t('aestheticLabels.secRoleSelectInit')}
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[400px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      {/* Right: Selection */}
      <div className="w-full md:w-2/3 bg-white p-6 md:p-24 flex flex-col justify-center animate-reveal text-black">
        <div className="max-w-3xl w-full mx-auto">
          <div className="border-b-4 border-black pb-8 mb-12 md:mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{t("accountType.title")}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
            {/* Artist Card */}
            <button
              onClick={handleSelectArtist}
              className="group border-4 border-black p-8 md:p-12 text-left transition-all bg-white hover:bg-black hover:text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
            >
              <div className="w-12 h-12 md:w-16 h-16 bg-black flex items-center justify-center text-[#F5E000] mb-8 md:mb-10 group-hover:bg-[#F5E000] group-hover:text-black transition-colors">
                <Mic2 size={24} className="md:hidden" strokeWidth={3} />
                <Mic2 size={32} className="hidden md:block" strokeWidth={3} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">{t("accountType.artist")}</h3>
              <p className="text-sm md:text-base font-bold leading-tight mb-8 opacity-40 uppercase tracking-tight">
                {t("accountType.artistDesc")}
              </p>
              <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#F5E000]">
                <Check size={16} strokeWidth={3} /> {t('aestheticLabels.directSubmissionFlow')}
              </div>
            </button>

            {/* Industry Card */}
            <button
              onClick={handleSelectIndustry}
              className="group border-4 border-black p-8 md:p-12 text-left transition-all bg-white hover:bg-black hover:text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
            >
              <div className="w-12 h-12 md:w-16 h-16 bg-black flex items-center justify-center text-[#F5E000] mb-8 md:mb-10 group-hover:bg-[#F5E000] group-hover:text-black transition-colors">
                <Building2 size={24} className="md:hidden" strokeWidth={3} />
                <Building2 size={32} className="hidden md:block" strokeWidth={3} />
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">{t("accountType.industry")}</h3>
              <p className="text-sm md:text-base font-bold leading-tight mb-8 opacity-40 uppercase tracking-tight">
                {t("accountType.industryDesc")}
              </p>
              <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black group-hover:text-white/40">
                <Check size={16} strokeWidth={3} /> {t('aestheticLabels.createAgencyAccount')}
              </div>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}
