"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Globe, LogOut, User } from "lucide-react";

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
    <header className="h-16 border-b border-border bg-bg-surface flex items-center justify-end px-6 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Language switcher */}
        <div className="relative">
          <button
            id="portal-lang-btn"
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-elevated transition-all font-sans text-sm font-medium text-cm-text-secondary hover:text-cm-text-primary"
            aria-label="Change language"
          >
            <Globe size={16} />
            <span className="hidden sm:inline">{currentLang.flag}</span>
          </button>

          {langOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 border border-border bg-bg-surface shadow-xl rounded-md overflow-hidden min-w-[120px]">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => switchLocale(l.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 font-sans text-xs uppercase font-bold tracking-wider transition-colors hover:bg-bg-elevated ${
                      currentLocale === l.code
                        ? "text-accent-red"
                        : "text-cm-text-secondary hover:text-cm-text-primary"
                    }`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {currentLocale === l.code && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-red" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* User Menu / Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-elevated text-cm-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
          title={t("signOut")}
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
