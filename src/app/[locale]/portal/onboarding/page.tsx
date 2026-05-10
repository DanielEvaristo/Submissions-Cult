"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Music2,
  Globe2,
  Mic2,
  BarChart2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

const GENRES = [
  "Rock",
  "Electronic",
  "Hip-Hop",
  "R&B / Soul",
  "Pop",
  "Folk / Acoustic",
  "Latin",
  "Jazz",
  "Metal",
  "Ambient / Experimental",
  "Other",
];

const MUSIC_LANGUAGES = [
  { code: "en", labelKey: "en" },
  { code: "es", labelKey: "es" },
  { code: "fr", labelKey: "fr" },
  { code: "pt", labelKey: "pt" },
  { code: "de", labelKey: "de" },
  { code: "it", labelKey: "it" },
  { code: "ja", labelKey: "ja" },
  { code: "ko", labelKey: "ko" },
  { code: "zh", labelKey: "zh" },
  { code: "other", labelKey: "other" },
];

const AGE_RANGES = ["UNDER_18", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_PLUS"] as const;
const LISTENERS = ["UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K", "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K"] as const;
const DISTRIBUTION = ["DISTROKID", "TUNECORE", "CD_BABY", "RECORD_LABEL", "INDEPENDENT", "OTHER"] as const;

const COUNTRIES = [
  { code: "MX", name: "Mexico" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "BR", name: "Brazil" },
  { code: "AR", name: "Argentina" },
  { code: "CO", name: "Colombia" },
  { code: "CL", name: "Chile" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "PT", name: "Portugal" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "other", name: "Other" },
];

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  country: string;
  city: string;
  bio: string;
  // Step 2
  roleType: "ARTIST" | "BAND";
  ageRange: string;
  bandSize: number;
  memberAgeRanges: string[];
  // Step 3
  genre: string;
  subgenre: string;
  // Step 4
  musicLanguages: string[];
  // Step 5
  spotifyUrl: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  soundcloudUrl: string;
  website: string;
  // Step 6
  careerStartYear: string;
  monthlyListeners: string;
  distributionMethod: string;
  hasManager: boolean;
}

const INITIAL: FormData = {
  country: "",
  city: "",
  bio: "",
  roleType: "ARTIST",
  ageRange: "",
  bandSize: 2,
  memberAgeRanges: ["", ""],
  genre: "",
  subgenre: "",
  musicLanguages: [],
  spotifyUrl: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  soundcloudUrl: "",
  website: "",
  careerStartYear: "",
  monthlyListeners: "",
  distributionMethod: "",
  hasManager: false,
};

// ─── Step Labels ──────────────────────────────────────────────────────────────

const STEP_ICONS = [MapPin, Mic2, Music2, Globe2, Globe2, BarChart2, CheckCircle2];

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  const locale = useLocale();
  const router = useRouter();
  const { update } = useSession();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const toggleLanguage = (code: string) => {
    setForm((prev) => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l) => l !== code)
        : [...prev.musicLanguages, code],
    }));
  };

  const updateBandSize = (size: number) => {
    const clamped = Math.max(2, Math.min(20, size));
    setForm((prev) => ({
      ...prev,
      bandSize: clamped,
      memberAgeRanges: Array.from({ length: clamped }, (_, i) => prev.memberAgeRanges[i] ?? ""),
    }));
  };

  const canProceed = (): boolean => {
    if (step === 1) return !!form.country;
    if (step === 3) return !!form.genre;
    return true;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    setError("");
  };

  const handleFinish = async () => {
    if (!form.genre) {
      setError("Please select a genre before finishing.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      country: form.country,
      city: form.city,
      bio: form.bio,
      roleType: form.roleType,
      ageRange: form.ageRange || undefined,
      genre: form.genre,
      subgenre: form.subgenre || undefined,
      musicLanguages: form.musicLanguages,
      spotifyUrl: form.spotifyUrl || undefined,
      instagram: form.instagram || undefined,
      tiktok: form.tiktok || undefined,
      youtube: form.youtube || undefined,
      soundcloudUrl: form.soundcloudUrl || undefined,
      website: form.website || undefined,
      careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      monthlyListeners: form.monthlyListeners || undefined,
      distributionMethod: form.distributionMethod || undefined,
      hasManager: form.hasManager,
    };

    const res = await fetch("/api/artist/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Refresh the session so genre is updated and the redirect check works
    await update({ genre: form.genre });
    router.push(`/${locale}/portal`);
  };

  const stepKeys = ["basics", "project", "genres", "languages", "socials", "career", "review"] as const;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-bg-surface">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
          Cult Machine
        </p>
        <p className="font-sans text-xs font-semibold text-cm-text-muted">
          {t("progress", { current: step, total: TOTAL_STEPS })}
        </p>
      </header>

      {/* ── Progress bar ── */}
      <div className="w-full h-[2px] bg-border">
        <div
          className="h-full bg-accent-red transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        <div className="w-full max-w-xl">

          {/* ── Step indicators ── */}
          <div className="flex items-center flex-wrap gap-1.5 mb-10">
            {stepKeys.map((key, i) => {
              const Icon = STEP_ICONS[i];
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div
                  key={key}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full flex-1 min-w-0 transition-all duration-200 shadow-sm ${
                    active
                      ? "bg-accent-red border border-accent-red text-white"
                      : done
                      ? "bg-ok/10 border border-ok/40 text-ok"
                      : "bg-bg-surface border border-border text-cm-text-muted"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${active ? "text-white" : done ? "text-ok" : "text-cm-text-muted"}`}
                  />
                  <span
                    className={`font-sans text-xs font-bold uppercase tracking-wider truncate ${
                      active ? "text-white" : done ? "text-ok" : "text-cm-text-muted"
                    }`}
                  >
                    {t(`steps.${key}`)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("basics.title")} />
              <div>
                <label className="label" htmlFor="country">
                  {t("basics.country")} *
                </label>
                <select
                  id="country"
                  className="input"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                >
                  <option value="">{t("basics.countryPlaceholder")}</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="city">
                  {t("basics.city")}
                </label>
                <input
                  id="city"
                  type="text"
                  className="input"
                  placeholder={t("basics.cityPlaceholder")}
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="bio">
                  {t("basics.bio")}
                  <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">
                    {t("basics.bioHint", { count: form.bio.length })}
                  </span>
                </label>
                <textarea
                  id="bio"
                  className="input min-h-[100px] resize-none"
                  placeholder={t("basics.bioPlaceholder")}
                  maxLength={500}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Project ── */}
          {step === 2 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("project.title")} />

              {/* Role type toggle */}
              <div>
                <p className="label mb-3">{t("project.roleType")}</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["ARTIST", "BAND"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => set("roleType", r)}
                      className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-sm ${
                        form.roleType === r
                          ? "border-accent-red bg-accent-red/10 ring-1 ring-accent-red/20"
                          : "border-border bg-bg-surface hover:border-cm-text-muted hover:bg-bg-elevated"
                      }`}
                    >
                      <p className="font-sans text-sm font-bold text-cm-text-primary mb-1">
                        {r === "ARTIST" ? t("project.soloArtist") : t("project.band")}
                      </p>
                      <p className="font-sans text-xs text-cm-text-secondary">
                        {r === "ARTIST" ? "Solo performer" : "2+ members"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age range (for both ARTIST and BAND) */}
              <div>
                <label className="label" htmlFor="ageRange">
                  {t("project.ageRange")}
                </label>
                <select
                  id="ageRange"
                  className="input"
                  value={form.ageRange}
                  onChange={(e) => set("ageRange", e.target.value)}
                >
                  <option value="">— {tRegister("ageRange")} —</option>
                  {AGE_RANGES.map((a) => (
                    <option key={a} value={a}>
                      {tRegister(`ageRanges.${a}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* ── STEP 3: Genres ── */}
          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("genres.title")} />
              <div>
                <label className="label" htmlFor="genre">
                  {t("genres.genre")} *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => set("genre", g)}
                      className={`px-4 py-3 border rounded-lg text-left transition-all duration-200 font-sans text-sm font-medium shadow-sm ${
                        form.genre === g
                          ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20"
                          : "border-border bg-bg-surface text-cm-text-secondary hover:border-cm-text-muted hover:bg-bg-elevated"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="subgenre">
                  {t("genres.subgenre")}
                </label>
                <input
                  id="subgenre"
                  type="text"
                  className="input"
                  placeholder={t("genres.subgenrePlaceholder")}
                  value={form.subgenre}
                  onChange={(e) => set("subgenre", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Languages ── */}
          {step === 4 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("languages.title")} hint={t("languages.hint")} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MUSIC_LANGUAGES.map(({ code, labelKey }) => {
                  const selected = form.musicLanguages.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleLanguage(code)}
                      className={`px-4 py-3 border rounded-lg text-left transition-all duration-200 font-sans text-sm font-medium shadow-sm ${
                        selected
                          ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20"
                          : "border-border bg-bg-surface text-cm-text-secondary hover:border-cm-text-muted hover:bg-bg-elevated"
                      }`}
                    >
                      {t(`languages.${labelKey}`)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── STEP 5: Socials ── */}
          {step === 5 && (
            <div className="animate-fade-in space-y-5">
              <StepHeader title={t("socials.title")} hint={t("socials.hint")} />

              <div>
                <label className="label" htmlFor="spotifyUrl">{t("socials.spotify")}</label>
                <input id="spotifyUrl" type="text" className="input" placeholder={t("socials.spotifyPlaceholder")}
                  value={form.spotifyUrl} onChange={(e) => set("spotifyUrl", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="instagram">{t("socials.instagram")}</label>
                <input id="instagram" type="text" className="input" placeholder={t("socials.instagramPlaceholder")}
                  value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="tiktok">{t("socials.tiktok")}</label>
                <input id="tiktok" type="text" className="input" placeholder={t("socials.tiktokPlaceholder")}
                  value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="youtube">{t("socials.youtube")}</label>
                <input id="youtube" type="text" className="input" placeholder={t("socials.youtubePlaceholder")}
                  value={form.youtube} onChange={(e) => set("youtube", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="soundcloudUrl">{t("socials.soundcloud")}</label>
                <input id="soundcloudUrl" type="text" className="input" placeholder={t("socials.soundcloudPlaceholder")}
                  value={form.soundcloudUrl} onChange={(e) => set("soundcloudUrl", e.target.value)} />
              </div>
              <div>
                <label className="label" htmlFor="website">{t("socials.website")}</label>
                <input id="website" type="text" className="input" placeholder={t("socials.websitePlaceholder")}
                  value={form.website} onChange={(e) => set("website", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 6: Career ── */}
          {step === 6 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("career.title")} />
              <div>
                <label className="label" htmlFor="careerStartYear">
                  {t("career.startYear")}
                </label>
                <input
                  id="careerStartYear"
                  type="number"
                  className="input"
                  placeholder={t("career.startYearPlaceholder")}
                  min={1950}
                  max={new Date().getFullYear()}
                  value={form.careerStartYear}
                  onChange={(e) => set("careerStartYear", e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="monthlyListeners">
                  {t("career.listeners")}
                </label>
                <select
                  id="monthlyListeners"
                  className="input"
                  value={form.monthlyListeners}
                  onChange={(e) => set("monthlyListeners", e.target.value)}
                >
                  <option value="">— select —</option>
                  {LISTENERS.map((l) => (
                    <option key={l} value={l}>
                      {tRegister(`listeners.${l}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="distributionMethod">
                  {t("career.distribution")}
                </label>
                <select
                  id="distributionMethod"
                  className="input"
                  value={form.distributionMethod}
                  onChange={(e) => set("distributionMethod", e.target.value)}
                >
                  <option value="">— select —</option>
                  {DISTRIBUTION.map((d) => (
                    <option key={d} value={d}>
                      {tRegister(`distribution.${d}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="label mb-3">{t("career.manager")}</p>
                <div className="flex gap-3">
                  {[true, false].map((val) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => set("hasManager", val)}
                      className={`px-6 py-2 border rounded-md font-sans text-sm font-medium transition-all duration-200 shadow-sm ${
                        form.hasManager === val
                          ? "border-accent-red bg-accent-red text-white"
                          : "border-border bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:border-cm-text-muted"
                      }`}
                    >
                      {val ? t("career.yes") : t("career.no")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 7: Review ── */}
          {step === 7 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={t("review.title")} hint={t("review.subtitle")} />
              <div className="space-y-4">
                <ReviewRow label={t("review.location")} value={[form.country, form.city].filter(Boolean).join(", ")} fallback={t("review.notSet")} />
                <ReviewRow label={t("review.projectType")} value={form.roleType === "BAND" ? `Band (${form.bandSize} members)` : "Solo Artist"} />
                <ReviewRow label={t("review.genre")} value={[form.genre, form.subgenre].filter(Boolean).join(" / ")} fallback={t("review.notSet")} />
                <ReviewRow label={t("review.languages")} value={form.musicLanguages.length > 0 ? form.musicLanguages.join(", ") : ""} fallback={t("review.notSet")} />
                <ReviewRow
                  label={t("review.socials")}
                  value={[form.spotifyUrl, form.instagram, form.youtube, form.tiktok].filter(Boolean).join(", ")}
                  fallback={t("review.notSet")}
                />
                <ReviewRow
                  label={t("review.career")}
                  value={[
                    form.careerStartYear ? `Since ${form.careerStartYear}` : "",
                    form.monthlyListeners ? `${form.monthlyListeners} listeners` : "",
                  ].filter(Boolean).join(" · ")}
                  fallback={t("review.notSet")}
                />
              </div>

              <div className="pt-2 border-t border-border">
                <p className="font-mono text-[10px] text-cm-text-muted uppercase tracking-widest">
                  {/* hint */}
                  {t("progressHint")}
                </p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-md border border-danger/30 bg-danger/10 font-sans text-sm font-medium text-danger shadow-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn-ghost flex items-center gap-1 text-cm-text-secondary disabled:opacity-30"
            >
              <ChevronLeft size={14} />
              {/* Back */}
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
                id={`onboarding-next-step-${step}`}
              >
                {t("saveAndContinue")}
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
                id="onboarding-finish"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {t("finish")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">{title}</h1>
      {hint && <p className="font-sans text-base text-cm-text-secondary mt-2">{hint}</p>}
    </div>
  );
}

function ReviewRow({
  label,
  value,
  fallback = "—",
}: {
  label: string;
  value: string;
  fallback?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary shrink-0">
        {label}
      </p>
      <p className="font-sans text-sm font-medium text-cm-text-primary text-right">
        {value || fallback}
      </p>
    </div>
  );
}
