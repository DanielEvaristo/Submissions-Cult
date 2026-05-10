"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { Globe, LogOut } from "lucide-react";
import { useState } from "react";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇲🇽" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

interface Props {
  locale: string;
}

export default function PortalNav({ locale }: Props) {
  const t = useTranslations("nav");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    const segments = window.location.pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  };

  const currentLang = LOCALES.find((l) => l.code === currentLocale) ?? LOCALES[0];

  const navLinks = [
    { href: `/${locale}/portal/submit`, label: t("submit") },
    { href: `/${locale}/portal/submissions`, label: t("mySubmissions") },
    { href: `/${locale}/portal/profile`, label: t("profile") },
  ];

  return (
    <header className="border-b border-border bg-bg/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={`/${locale}/portal/submit`} className="font-mono text-[10px] uppercase tracking-[0.3em] text-cm-text-secondary hover:text-cm-text-primary transition-colors shrink-0">
          Cult Machine
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href.replace(`/${locale}`, ""));
            return (
              <Link
                key={href}
                href={href}
                className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 transition-colors ${
                  active
                    ? "text-cm-text-primary border-b border-accent-red"
                    : "text-cm-text-muted hover:text-cm-text-secondary"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: locale + sign out */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Language switcher */}
          <div className="relative">
            <button
              id="portal-lang-btn"
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-cm-text-muted hover:text-cm-text-secondary hover:border-cm-border-hover transition-all font-mono text-[10px] uppercase tracking-widest"
              aria-label="Change language"
            >
              <Globe size={11} />
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-1 z-50 border border-border bg-cm-surface shadow-lg overflow-hidden min-w-[90px]">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      id={`portal-lang-${l.code}`}
                      onClick={() => switchLocale(l.code)}
                      className={`w-full flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors hover:bg-border/20 ${
                        currentLocale === l.code
                          ? "text-accent-red"
                          : "text-cm-text-secondary hover:text-cm-text-primary"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                      {currentLocale === l.code && (
                        <span className="ml-auto w-1 h-1 rounded-full bg-accent-red" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sign out */}
          <button
            id="portal-signout-btn"
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-border text-cm-text-muted hover:text-danger hover:border-danger/40 transition-all font-mono text-[10px] uppercase tracking-widest"
            title={t("signOut")}
          >
            <LogOut size={11} />
          </button>
        </div>
      </div>
    </header>
  );
}
