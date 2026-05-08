"use client"; // force reload

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
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center animate-fade-in">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cm-text-secondary mb-2">
            Cult Machine
          </p>
          <h1 className="font-mono text-xl font-bold text-cm-text-primary">
            {t("accountType.title")}
          </h1>
          <p className="font-sans text-sm text-cm-text-secondary mt-2">
            {t("accountType.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl animate-slide-up">
          {/* Artist Card */}
          <button
            onClick={() => selectType(AccountType.ARTIST)}
            className="group text-left p-6 bg-bg-surface border border-border hover:border-accent-red transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-border group-hover:border-accent-red transition-colors">
                <Mic2 size={18} className="text-cm-text-secondary group-hover:text-accent-red transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm font-bold text-cm-text-primary mb-1">
                  {t("accountType.artist")}
                </p>
                <p className="font-sans text-xs text-cm-text-secondary leading-relaxed">
                  {t("accountType.artistDesc")}
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-ok">
                  <Check size={11} />
                  Immediate access
                </div>
              </div>
            </div>
          </button>

          {/* Industry Card */}
          <button
            onClick={() => selectType(AccountType.INDUSTRY)}
            className="group text-left p-6 bg-bg-surface border border-border hover:border-accent-red transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 flex items-center justify-center border border-border group-hover:border-accent-red transition-colors">
                <Building2 size={18} className="text-cm-text-secondary group-hover:text-accent-red transition-colors" />
              </div>
              <div className="flex-1">
                <p className="font-mono text-sm font-bold text-cm-text-primary mb-1">
                  {t("accountType.industry")}
                </p>
                <p className="font-sans text-xs text-cm-text-secondary leading-relaxed">
                  {t("accountType.industryDesc")}
                </p>
                <div className="mt-4 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-warn">
                  <Check size={11} />
                  1–3 day review
                </div>
              </div>
            </div>
          </button>
        </div>

        <p className="mt-8 font-sans text-sm text-cm-text-secondary">
          {t("auth.hasAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-cm-text-primary hover:text-accent-red underline underline-offset-2 transition-colors">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    );
  }

  // ── Step 2: Registration Form ───────────────────────────────
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => setStep("type")}
            className="btn-ghost mb-4 -ml-2 text-cm-text-secondary"
          >
            ← {t("common.back")}
          </button>
          <div className="flex items-center gap-3 mb-1">
            {accountType === AccountType.ARTIST ? (
              <Mic2 size={16} className="text-accent-red" />
            ) : (
              <Building2 size={16} className="text-accent-red" />
            )}
            <p className="section-label">
              {accountType === AccountType.ARTIST
                ? t("accountType.artist")
                : t("accountType.industry")}{" "}
              — {t("auth.signUp")}
            </p>
          </div>
          <h2 className="font-mono text-lg font-bold text-cm-text-primary">
            {t("register.createAccount")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Artist fields ── */}
          {accountType === AccountType.ARTIST && (
            <>
              <div>
                <label className="label" htmlFor="artistName">
                  {t("register.artistName")} *
                </label>
                <input
                  id="artistName"
                  type="text"
                  className="input"
                  placeholder={t("register.placeholders.artistName")}
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="roleType">
                  {t("register.roleType")}
                </label>
                <select
                  id="roleType"
                  className="input"
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                >
                  {ROLE_TYPES_ARTIST.map((r) => (
                    <option key={r} value={r}>
                      {t(`register.roles.${r}`)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* ── Industry fields ── */}
          {accountType === AccountType.INDUSTRY && (
            <>
              <div>
                <label className="label" htmlFor="legalName">
                  {t("industry.legalName")} *
                </label>
                <input
                  id="legalName"
                  type="text"
                  className="input"
                  placeholder={t("industry.placeholders.legalName")}
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="industryRole">
                  {t("industry.roleType")}
                </label>
                <select
                  id="industryRole"
                  className="input"
                  value={industryRole}
                  onChange={(e) => setIndustryRole(e.target.value)}
                >
                  {ROLE_TYPES_INDUSTRY.map((r) => (
                    <option key={r} value={r}>
                      {t(`register.roles.${r}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="websiteUrl">
                  {t("industry.websiteUrl")} *
                </label>
                <input
                  id="websiteUrl"
                  type="url"
                  className="input"
                  placeholder={t("industry.placeholders.website")}
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label" htmlFor="labelInstagram">
                  {t("industry.labelInstagram")}
                </label>
                <input
                  id="labelInstagram"
                  type="text"
                  className="input"
                  placeholder={t("industry.placeholders.instagram")}
                  value={labelInstagram}
                  onChange={(e) => setLabelInstagram(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="description">
                  {t("industry.description")}
                </label>
                <textarea
                  id="description"
                  className="input min-h-[80px] resize-none"
                  placeholder={t("industry.placeholders.description")}
                  maxLength={300}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="divider" />

          {/* Email */}
          <div>
            <label className="label" htmlFor="email">
              {t("auth.email")} *
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
              {t("auth.password")} *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder={t("auth.placeholders.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div>
            <label className="label" htmlFor="confirmPassword">
              {t("auth.confirmPassword")} *
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              className={`input ${confirmPassword && password !== confirmPassword ? "input-error" : ""}`}
              placeholder={t("auth.placeholders.confirmPassword")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="error-msg">{t("auth.errors.passwordsDoNotMatch")}</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 border border-danger/30 bg-danger/10 font-mono text-[11px] text-danger">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? t("common.loading") : t("register.submitAndVerify")}
          </button>
        </form>

        <p className="mt-6 font-sans text-sm text-cm-text-secondary text-center">
          {t("auth.hasAccount")}{" "}
          <Link href={`/${locale}/login`} className="text-cm-text-primary hover:text-accent-red underline underline-offset-2 transition-colors">
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
