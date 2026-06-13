"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Mic2, Building2, Palette, Check, ArrowUpRight } from "lucide-react";

const CREATIVE_COPY =
  "We back independent creators with ideas worth building. Experimental proposals, collaborations, and community-first concepts belong here.";

export default function RoleSelectionPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const handleSelectArtist = () => {
    router.push(`/${locale}/submit-now`);
  };

  const handleSelectIndustry = () => {
    router.push(`/${locale}/register?type=INDUSTRY`);
  };

  const handleSelectCreative = () => {
    router.push(`/${locale}/creative`);
  };

  const cards = [
    {
      title: t("accountType.artist"),
      description: t("accountType.artistDesc"),
      kicker: "MAIN ENTRY",
      footer: t("aestheticLabels.directSubmissionFlow"),
      accent: "FASTEST WAY TO START",
      icon: Mic2,
      onClick: handleSelectArtist,
      className:
        "bg-black text-white border-black shadow-[10px_10px_0px_0px_rgba(245,224,0,1)] hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-[6px_6px_0px_0px_rgba(245,224,0,1)]",
      iconWrap: "bg-[#F5E000] text-black",
      descriptionClass: "text-white/72",
      kickerClass: "text-[#F5E000]",
      footerClass: "text-[#F5E000]",
      accentClass: "border-white/16 text-white/48",
    },
    {
      title: t("accountType.industry"),
      description: t("accountType.industryDesc"),
      kicker: "FOR TEAMS",
      footer: t("aestheticLabels.createAgencyAccount"),
      accent: "MANUAL REVIEW REQUIRED",
      icon: Building2,
      onClick: handleSelectIndustry,
      className:
        "bg-white text-black border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F5E000] hover:text-black hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-none",
      iconWrap: "bg-black text-[#F5E000] group-hover:bg-black group-hover:text-[#F5E000]",
      descriptionClass: "text-black/50 group-hover:text-black/70",
      kickerClass: "text-black/40 group-hover:text-black/60",
      footerClass: "text-black group-hover:text-black",
      accentClass: "border-black/10 text-black/40 group-hover:border-black/20 group-hover:text-black/60",
    },
    {
      title: "CREATIVE",
      description: CREATIVE_COPY,
      kicker: "OPEN PROPOSALS",
      footer: "JOIN THE CULT",
      accent: "COMMUNITY-LED ACCESS",
      icon: Palette,
      onClick: handleSelectCreative,
      className:
        "bg-[#F7F7F2] text-black border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:bg-[#F5E000] hover:translate-x-1.5 hover:translate-y-1.5 hover:shadow-none",
      iconWrap: "bg-black text-[#F5E000]",
      descriptionClass: "text-black/55",
      kickerClass: "text-black/40",
      footerClass: "text-black",
      accentClass: "border-black/10 text-black/40",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-white lg:h-screen lg:overflow-hidden lg:flex lg:flex-row">
      <div className="w-full bg-black p-6 md:p-8 lg:w-[27%] lg:px-8 lg:py-10 xl:px-10 xl:py-12 flex flex-col justify-between relative overflow-hidden min-h-[26vh] lg:min-h-0">
        <Link
          href={`/${locale}/landing`}
          className="flex items-center gap-2 text-white hover:text-[#F5E000] transition-colors relative z-10"
        >
          <span className="text-2xl">★</span>
          <span className="font-black text-lg md:text-xl tracking-tighter uppercase">
            CULT MACHINE
          </span>
        </Link>

        <div className="mt-8 md:mt-10 lg:mt-0 relative z-10">
          <h1 className="text-white text-[clamp(36px,6vw,84px)] font-black uppercase leading-[0.84] tracking-tighter">
            CHOOSE
            <br />
            YOUR
            <br />
            <span className="text-[#F5E000]">PATH.</span>
          </h1>
        </div>

        <div className="absolute -right-10 -bottom-12 text-white/5 font-black text-[120px] md:text-[160px] lg:text-[220px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      <div className="w-full bg-[#F3F1EA] px-5 py-6 md:px-8 md:py-8 lg:w-[73%] lg:px-10 lg:py-8 xl:px-12 xl:py-10 text-black">
        <div className="mx-auto flex h-full max-w-5xl flex-col">
          <div className="border-b-4 border-black pb-4 lg:pb-5">
            <h2 className="text-3xl md:text-5xl lg:text-[52px] font-black uppercase tracking-tighter leading-none">
              {t("accountType.title")}
            </h2>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 lg:mt-6 lg:flex-1 lg:gap-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={card.onClick}
                  className={`group relative flex flex-col overflow-hidden border-4 p-4 text-left transition-all duration-200 md:p-5 lg:min-h-0 lg:flex-1 lg:flex-row lg:items-center lg:gap-5 lg:p-4 xl:px-5 xl:py-4 ${card.className}`}
                >
                  <div className="flex items-start justify-between gap-3 lg:w-[220px] lg:min-w-[220px] lg:flex-col lg:justify-center">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center transition-colors ${card.iconWrap}`}>
                      <Icon size={22} strokeWidth={2.8} />
                    </div>
                    <div className={`max-w-[160px] border px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.24em] lg:max-w-full ${card.accentClass}`}>
                      {card.accent}
                    </div>
                  </div>

                  <div className="mt-4 flex-1 space-y-2.5 lg:mt-0">
                    <p className={`text-[9px] font-black uppercase tracking-[0.3em] ${card.kickerClass}`}>
                      {card.kicker}
                    </p>
                    <h3 className="text-[clamp(28px,2.6vw,40px)] font-black uppercase leading-[0.9] tracking-[-0.04em]">
                      {card.title}
                    </h3>
                    <p className={`max-w-2xl text-[12px] md:text-[13px] font-bold uppercase leading-[1.45] tracking-tight ${card.descriptionClass}`}>
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-current/12 pt-4 lg:mt-0 lg:min-w-[210px] lg:self-stretch lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <div className={`flex items-center gap-2.5 text-[9px] font-black uppercase tracking-[0.24em] ${card.footerClass}`}>
                      <Check size={14} strokeWidth={3} />
                      <span>{card.footer}</span>
                    </div>
                    <ArrowUpRight size={18} strokeWidth={2.8} className="shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
