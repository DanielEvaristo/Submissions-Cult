"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Globe, LogOut } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇲🇽" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

interface Props {
  locale: string;
}

export default function PortalHeader({ locale }: Props) {
  const t = useTranslations("nav");
  const currentLocale = useLocale();
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const segments = window.location.pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  };

  const currentLang = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  return (
    <header className="hidden lg:flex h-20 border-b-2 border-white/10 bg-black items-center justify-end px-10 sticky top-0 z-40">
      <div className="flex items-center gap-6">
        
        {/* Language switcher */}
        <div className="relative">
          <button
            id="portal-lang-btn"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 hover:bg-[#F5E000] transition-all font-sans text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-black"
            aria-label="Change language"
          >
            <Globe size={12} />
            <span>{currentLang.label}</span>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-50 border-2 border-white/10 bg-black shadow-none min-w-[120px]">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => switchLocale(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-3 font-sans text-[10px] uppercase font-black tracking-widest transition-colors ${
                      currentLocale === l.code
                        ? "bg-[#F5E000] text-black"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Menu / Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center justify-center w-10 h-10 border-2 border-white/10 bg-black text-[#F5E000] hover:bg-[#F5E000] hover:text-black transition-colors"
          title={t("signOut")}
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
