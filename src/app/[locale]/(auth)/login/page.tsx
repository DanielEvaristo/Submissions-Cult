"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Eye, EyeOff, Globe } from "lucide-react";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇲🇽" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    // Full reload so next-intl middleware reads locale directly from URL
    const segments = window.location.pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    // After login, redirect to portal keeping locale
    window.location.href = `/${locale}/portal/onboarding`;
  };

  const currentLang = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 relative">

      {/* ── Language switcher ── */}
      <div className="fixed top-4 right-4 z-50">
        <button
          id="lang-switcher-btn"
          onClick={() => setLangOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-cm-border bg-cm-surface text-cm-text-secondary hover:text-cm-text-primary hover:border-cm-border-hover transition-all font-mono text-[11px] uppercase tracking-widest shadow-sm"
          aria-label="Change language"
        >
          <Globe size={12} />
          <span>{currentLang.flag}</span>
          <span>{currentLang.label}</span>
        </button>

        {langOpen && (
          <>
            {/* backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setLangOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-50 border border-cm-border bg-cm-surface shadow-lg rounded overflow-hidden min-w-[100px]">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  id={`lang-${l.code}`}
                  onClick={() => switchLocale(l.code)}
                  className={`w-full flex items-center gap-2 px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest transition-colors hover:bg-cm-border/20 ${
                    locale === l.code
                      ? "text-accent-red"
                      : "text-cm-text-secondary hover:text-cm-text-primary"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                  {locale === l.code && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-accent-red" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Logo */}
      <div className="mb-10 text-center animate-fade-in">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cm-text-secondary mb-2">
          Cult Machine
        </p>
        <h1 className="font-mono text-xl font-bold text-cm-text-primary tracking-tight">
          Submissions Portal
        </h1>
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Success banner */}
        {verified && (
          <div className="mb-6 px-4 py-3 border border-ok/30 bg-ok/10 font-mono text-[11px] text-ok">
            {t("auth.accountCreated")}
          </div>
        )}

        <div className="card">
          <p className="section-label mb-6">{t("auth.signIn")}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label" htmlFor="email">
                {t("auth.email")}
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder={t("auth.placeholders.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="label" htmlFor="password">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cm-text-muted hover:text-cm-text-secondary transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && <p className="error-msg">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              {loading ? t("common.loading") : t("auth.signIn")}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6" />

          <p className="font-sans text-sm text-cm-text-secondary text-center">
            {t("auth.noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-cm-text-primary hover:text-accent-red underline underline-offset-2 transition-colors"
            >
              {t("auth.signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
