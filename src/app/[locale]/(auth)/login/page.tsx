"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const code = searchParams.get("error");
    if (code === "CredentialsSignin") {
      setError(t("auth.invalidCredentials"));
    }
  }, [searchParams, t]);

  const switchLocale = (newLocale: string) => {
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
      setError(t("auth.invalidCredentials"));
      return;
    }

    if (!result?.ok) {
      setError(t("auth.invalidCredentials"));
      return;
    }

    window.location.href = `/api/auth/after-login?locale=${encodeURIComponent(locale)}`;
  };

  const currentLang = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      
      {/* Left Column: Brand Identity */}
      <div className="w-full md:w-1/2 bg-black flex flex-col justify-between p-8 md:p-12 relative overflow-hidden min-h-[40vh] md:min-h-screen">
        <div className="relative z-10">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2 text-white hover:text-cult-yellow transition-colors">
            <span className="text-2xl md:text-3xl">★</span>
            <span className="font-black text-xl md:text-2xl tracking-tighter">CULT MACHINE</span>
          </Link>
        </div>

        <div className="relative z-10 mt-12 md:mt-auto">
          <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter mb-6">
            SUBMIT<br />
            YOUR<br />
            <span className="text-cult-yellow">SOUL.</span>
          </h1>
          <p className="text-[#999999] font-black uppercase text-[10px] md:text-xs tracking-[0.4em]">
            Artist & Industry Portal
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[300px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full md:w-1/2 bg-black flex flex-col justify-center px-6 py-16 md:px-24 relative animate-reveal">
        
        {/* Language switcher */}
        <div className="absolute top-6 md:top-12 right-6 md:right-12">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 border-4 border-white/10 bg-black hover:bg-[#F5E000] transition-all font-sans text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-white hover:text-black shadow-[4px_4px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none"
          >
            <Globe size={14} strokeWidth={3} />
            <span>{currentLang.label}</span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 border-4 border-white/10 bg-black min-w-[120px] md:min-w-[140px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => switchLocale(l.code)}
                  className={`w-full flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 font-sans text-[10px] uppercase font-black tracking-widest transition-colors hover:bg-[#F5E000] hover:text-black ${
                    locale === l.code ? "bg-[#F5E000] text-black" : "text-white/60"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="max-w-md w-full mx-auto mt-12 md:mt-0">
          {verified && (
            <div className="mb-8 md:mb-12 px-6 py-4 border-4 border-[#F5E000] bg-[#F5E000] font-sans text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-black text-center shadow-[4px_4px_0px_0px_rgba(245,224,0,0.2)]">
              {t("auth.accountCreated")}
            </div>
          )}

          <div className="mb-12 md:mb-16">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none text-white">{t("auth.signIn")}</h2>
            <p className="text-white/20 font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em] italic">"NO ALGORITHMS. JUST EARS."</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div>
              <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block text-white/40" htmlFor="email">{t("auth.email")}</label>
              <input
                id="email"
                type="email"
                className="w-full bg-black border-2 border-white/10 p-6 font-sans text-lg font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none"
                placeholder={t("auth.placeholders.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block text-white/40" htmlFor="password">{t("auth.password")}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-black border-2 border-white/10 p-6 font-sans text-lg font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none pr-16"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#F5E000] transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} strokeWidth={3} /> : <Eye size={20} strokeWidth={3} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-6 border-4 border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000] font-black uppercase text-[10px] tracking-[0.2em]">
                ERROR: {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-8 bg-[#F5E000] text-black border-4 border-[#F5E000] font-sans font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              disabled={loading}
            >
              {loading ? <Loader2 size={24} className="animate-spin mx-auto" strokeWidth={3} /> : t("auth.signIn")}
            </button>
          </form>

          <div className="mt-20 pt-12 border-t-2 border-white/5">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/20 text-center">
              {t("auth.noAccount")}{" "}
              <Link
                href={`/${locale}/register`}
                className="text-[#F5E000] underline underline-offset-[8px] decoration-4 hover:text-white transition-colors"
              >
                {t("auth.signUp")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
