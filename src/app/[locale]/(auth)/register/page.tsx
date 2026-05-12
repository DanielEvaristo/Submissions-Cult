"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, Eye, EyeOff, Mic2, Building2, Check } from "lucide-react";
import { AccountType } from "@prisma/client";

type Step = "type" | "form";

const ROLE_TYPES_ARTIST = ["ARTIST", "BAND", "MANAGEMENT", "PR", "AGENCY"] as const;
const ROLE_TYPES_INDUSTRY = ["MANAGEMENT", "PR", "AGENCY"] as const;

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState<Step>("type");
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Artist fields
  const [artistName, setArtistName] = useState("");
  const [roleType, setRoleType] = useState("ARTIST");

  // Industry fields
  const [legalName, setLegalName] = useState("");
  const [industryRole, setIndustryRole] = useState("MANAGEMENT");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [labelInstagram, setLabelInstagram] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        ? { accountType, email, password, artistName, roleType }
        : { accountType, email, password, legalName, roleType: industryRole, websiteUrl, labelInstagram, description };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? t("errors.generic"));
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
              SEC_REG_STEP_01 / AUTH_INIT
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[400px] leading-none select-none pointer-events-none">
            ★
          </div>
        </div>

        {/* Right: Selection */}
        <div className="w-full md:w-2/3 bg-white p-6 md:p-24 flex flex-col justify-center animate-reveal">
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
                  <Check size={16} strokeWidth={3} /> IMMEDIATE_ACCESS
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
                  <Check size={16} strokeWidth={3} /> REVIEW_QUEUE_ACTIVE
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
            ← RETURN_TO_STEP_01
          </button>
          <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter">
            JOIN<br />THE<br /><span className="text-[#F5E000]">CULT.</span>
          </h1>
        </div>
        <div className="mt-auto relative z-10">
          <p className="text-white/20 font-black uppercase text-[9px] md:text-[10px] tracking-[0.4em]">
            {accountType === AccountType.ARTIST ? "ARTIST_REGISTRATION_SYSTEM" : "INDUSTRY_APPLICATION_PORTAL"}
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[400px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-white p-6 md:p-24 overflow-y-auto animate-reveal">
        <div className="max-w-2xl w-full mx-auto">
          <form onSubmit={handleSubmit} className="space-y-16">
            
            {/* Account Info Section */}
            <section className="space-y-12">
              <div className="border-b-4 border-black pb-4">
                <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-black">CORE_CREDENTIALS</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-10">
                {accountType === AccountType.ARTIST ? (
                  <div>
                    <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="artistName">{t("register.artistName")} ★</label>
                    <input id="artistName" type="text" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="E.G. THE_MIDNIGHT_ECHO"
                      value={artistName} onChange={(e) => setArtistName(e.target.value)} required />
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div>
                      <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="legalName">{t("industry.legalName")} ★</label>
                      <input id="legalName" type="text" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="E.G. UNDERGROUND_PR"
                        value={legalName} onChange={(e) => setLegalName(e.target.value)} required />
                    </div>
                    <div>
                      <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="websiteUrl">{t("industry.websiteUrl")} ★</label>
                      <input id="websiteUrl" type="url" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="HTTPS://..."
                        value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} required />
                    </div>
                  </div>
                )}

                <div>
                  <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="email">{t("auth.email")} ★</label>
                  <input id="email" type="email" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="USER@CULT.MACHINE"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div>
                    <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="password">{t("auth.password")} ★</label>
                    <input id="password" type="password" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="••••••••"
                      value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="font-sans text-[10px] font-black uppercase tracking-[0.2em] mb-4 block" htmlFor="confirmPassword">{t("auth.confirmPassword")} ★</label>
                    <input id="confirmPassword" type="password" className="w-full bg-[#F5F5F5] border-2 border-black p-6 font-sans text-lg font-black uppercase tracking-tight focus:bg-[#F5E000] transition-all outline-none" placeholder="••••••••"
                      value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>
                </div>
              </div>
            </section>

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
