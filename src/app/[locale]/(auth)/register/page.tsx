"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Eye, EyeOff, Mic2, Building2, Check } from "lucide-react";
import { AccountType } from "@prisma/client";

type Step = "type" | "form";

const ROLE_TYPES_ARTIST = ["ARTIST", "BAND", "MANAGEMENT", "PR", "AGENCY"] as const;
const ROLE_TYPES_INDUSTRY = ["MANAGEMENT", "PR", "AGENCY"] as const;

function RegisterPageContent() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const typeParam = searchParams.get("type");
  const initialType = typeParam === "INDUSTRY" ? AccountType.INDUSTRY : (typeParam === "ARTIST" ? AccountType.ARTIST : null);

  const [step, setStep] = useState<Step>(initialType ? "form" : "type");
  const [accountType, setAccountType] = useState<AccountType | null>(initialType);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Artist fields
  const [roleType, setRoleType] = useState("ARTIST");

  // Industry fields
  const [legalName, setLegalName] = useState("");
  const [industryRole, setIndustryRole] = useState("MANAGEMENT");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [labelInstagram, setLabelInstagram] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPendingClaim, setIsPendingClaim] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectType = (type: AccountType) => {
    setAccountType(type);
    setStep("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.errors.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);

    const payload =
      accountType === AccountType.ARTIST
        ? { accountType, email, password, roleType }
        : { accountType, email, password, legalName, roleType: industryRole, websiteUrl, labelInstagram, description };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      const data_err = data;
      if (data_err?.code === "PENDING_CLAIM" || data_err?.error === "PENDING_CLAIM") {
        setIsPendingClaim(true);
        setLoading(false);
        return;
      }
      setError(data.error ?? t("errors.generic"));
      return;
    }

    if (accountType === AccountType.ARTIST) {
      setLoading(true);
      const loginResult = await signIn("credentials", {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });
      setLoading(false);

      if (loginResult?.ok) {
        window.location.href = `/api/auth/after-login?locale=${encodeURIComponent(locale)}`;
        return;
      }

      setError("Account created, but automatic sign-in failed. Please log in manually.");
      router.push(`/${locale}/login`);
      return;
    }

    router.push(`/${locale}${data.redirect}`);
  };

  // ── Step 1: Account Type Selection ─────────────────────────
  if (step === "type") {
    return (
      <div className="min-h-screen bg-white flex flex-col md:flex-row">
        
        {/* Left: Brand */}
        <div className="w-full md:w-1/3 bg-black p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[30vh] md:min-h-screen">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2 text-white hover:text-cult-yellow transition-colors relative z-10">
            <span className="text-2xl md:text-3xl">★</span>
            <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">CULT MACHINE</span>
          </Link>
          <div className="mt-12 md:mt-20 relative z-10">
            <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter">
              CHOOSE<br />YOUR<br /><span className="text-cult-yellow underline underline-offset-[10px] decoration-4">PATH.</span>
            </h1>
          </div>
          <div className="mt-auto relative z-10">
            <p className="text-[#444444] text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] italic">
              {t('aestheticLabels.secRegStep01AuthInit')}
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
                onClick={() => selectType(AccountType.ARTIST)}
                className="group border-4 border-black p-8 md:p-12 text-left transition-all bg-white hover:bg-black hover:text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-black flex items-center justify-center text-[#F5E000] mb-8 md:mb-10 group-hover:bg-[#F5E000] group-hover:text-black transition-colors">
                  <Mic2 size={24} className="md:hidden" strokeWidth={3} />
                  <Mic2 size={32} className="hidden md:block" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">{t("accountType.artist")}</h3>
                <p className="text-sm md:text-base font-bold leading-tight mb-8 opacity-40 uppercase tracking-tight">
                  {t("accountType.artistDesc")}
                </p>
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[#F5E000]">
                  <Check size={16} strokeWidth={3} /> {t('aestheticLabels.immediateAccess')}
                </div>
              </button>

              {/* Industry Card */}
              <button
                onClick={() => selectType(AccountType.INDUSTRY)}
                className="group border-4 border-black p-8 md:p-12 text-left transition-all bg-white hover:bg-black hover:text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-black flex items-center justify-center text-[#F5E000] mb-8 md:mb-10 group-hover:bg-[#F5E000] group-hover:text-black transition-colors">
                  <Building2 size={24} className="md:hidden" strokeWidth={3} />
                  <Building2 size={32} className="hidden md:block" strokeWidth={3} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-4">{t("accountType.industry")}</h3>
                <p className="text-sm md:text-base font-bold leading-tight mb-8 opacity-40 uppercase tracking-tight">
                  {t("accountType.industryDesc")}
                </p>
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black group-hover:text-white/40">
                  <Check size={16} strokeWidth={3} /> {t('aestheticLabels.reviewQueueActive')}
                </div>
              </button>
            </div>

            <div className="mt-20 pt-12 border-t-2 border-black/5">
              <p className="text-center font-sans text-xs font-black uppercase tracking-widest text-black/40">
                {t("auth.hasAccount")}{" "}
                <Link href={`/${locale}/login`} className="text-black underline underline-offset-[6px] decoration-2 hover:text-[#F5E000]">
                  {t("auth.signIn")}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 2: Registration Form ───────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 bg-black p-8 md:p-12 flex flex-col relative overflow-hidden min-h-[30vh] md:min-h-screen">
        <Link href={`/${locale}/landing`} className="flex items-center gap-2 text-white relative z-10">
          <span className="text-2xl md:text-3xl">★</span>
          <span className="font-black text-xl md:text-2xl tracking-tighter uppercase">CULT MACHINE</span>
        </Link>
        <div className="mt-12 md:mt-24 relative z-10">
          <button onClick={() => setStep("type")} className="text-[#F5E000] font-black uppercase text-[10px] tracking-[0.4em] hover:text-white mb-8 md:mb-12 flex items-center gap-2">
            ← {t('aestheticLabels.returnToStep01')}
          </button>
          <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter">
            JOIN<br />THE<br /><span className="text-[#F5E000]">CULT.</span>
          </h1>
        </div>
        <div className="mt-auto relative z-10">
          <p className="text-white/20 font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em]">
            {accountType === AccountType.ARTIST ? t('aestheticLabels.artistRegistrationSystem') : t('aestheticLabels.industryApplicationPortal')}
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[400px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-white text-black p-6 md:p-24 overflow-y-auto animate-reveal">
        <div className="max-w-2xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* Account Info Section */}
            <section className="space-y-12">
              <div className="border-b-4 border-black pb-4">
                <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-black">{t('aestheticLabels.coreCredentials')}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-10">
                {accountType === AccountType.ARTIST ? (
                  null
                ) : (
                  <div className="space-y-10">
                    <div>
                      <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="legalName">{t("industry.legalName")} ★</label>
                      <input id="legalName" type="text" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black tracking-tight text-black placeholder:text-black/30 focus:bg-[#F5E000] transition-all outline-none" placeholder="E.G. UNDERGROUND_PR"
                        value={legalName} onChange={(e) => setLegalName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="websiteUrl">{t("industry.websiteUrl")} ★</label>
                      <input id="websiteUrl" type="url" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black tracking-tight text-black placeholder:text-black/30 focus:bg-[#F5E000] transition-all outline-none" placeholder="HTTPS://..."
                        value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="email">{t("auth.email")} ★</label>
                  <input id="email" type="email" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black tracking-tight text-black placeholder:text-black/30 focus:bg-[#F5E000] transition-all outline-none" placeholder="USER@CULT.MACHINE"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="password">{t("auth.password")} ★</label>
                    <input id="password" type="password" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black tracking-tight text-black placeholder:text-black/30 focus:bg-[#F5E000] transition-all outline-none" placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="confirmPassword">{t("auth.confirmPassword")} ★</label>
                    <input id="confirmPassword" type="password" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black tracking-tight text-black placeholder:text-black/30 focus:bg-[#F5E000] transition-all outline-none" placeholder="••••••••"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            </section>

            {isPendingClaim && (
              <div className="p-8 border-4 border-[#F5E000] bg-black space-y-4">
                <p className="font-black uppercase text-sm tracking-widest text-[#F5E000]">⚠ CUENTA EXISTENTE DETECTADA</p>
                <p className="font-bold text-sm text-white leading-relaxed">
                  Este correo ya tiene submissions previas en Cult Machine. Tu historial ha sido preservado.
                </p>
                <p className="font-bold text-sm text-white/60 leading-relaxed">
                  Para activar tu cuenta y acceder a tu historial, contacta a soporte:
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("support@cult-machine.com");
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="inline-block px-6 py-4 bg-[#F5E000] text-black font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white transition-all text-left"
                >
                  {copied ? "¡CORREO COPIADO!" : "COPIAR CORREO DE SOPORTE"}
                </button>
              </div>
            )}

            {error && (
              <div className="p-6 border-4 border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000] font-black uppercase text-[10px] tracking-[0.2em]">
                ERROR: {error}
              </div>
            )}

            <button type="submit" className="w-full py-8 bg-black text-[#F5E000] border-4 border-black font-sans font-black text-xs uppercase tracking-[0.4em] hover:bg-[#F5E000] hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none" disabled={loading}>
              {loading ? <Loader2 size={24} className="animate-spin mx-auto" strokeWidth={3} /> : t("register.submitAndVerify")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><Loader2 className="animate-spin text-black" size={48} /></div>}>
      <RegisterPageContent />
    </Suspense>
  );
}
