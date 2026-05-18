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
  Info,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;

import { GENRES, GENRE_MAP } from "@/lib/genres";

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
const FOLLOWERS = ["UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K", "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K"] as const;
const DISTRIBUTION = ["DISTROKID", "TUNECORE", "CD_BABY", "RECORD_LABEL", "INDEPENDENT", "OTHER"] as const;

import { Country, State } from "country-state-city";

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormData {
  // Step 1
  country: string;
  city: string;
  artistName: string;
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
  instagramFollowers: string;
  distributionMethod: string;
  hasManager: boolean;
}

const INITIAL: FormData = {
  country: "",
  city: "",
  artistName: "",
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
  instagramFollowers: "",
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [isCustomSubgenre, setIsCustomSubgenre] = useState(false);

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
    if (step === 1) return !!form.artistName && !nameError && !!form.country;
    if (step === 2) return !!form.ageRange;
    if (step === 3) return !!form.genre && !!form.subgenre;
    if (step === 4) return form.musicLanguages.length > 0;
    if (step === 6) return !!form.monthlyListeners && !!form.instagramFollowers;
    return true;
  };

  const checkArtistName = async (name: string) => {
    if (!name) {
      setNameError("");
      return true;
    }
    setCheckingName(true);
    setNameError("");
    try {
      const res = await fetch(`/api/artist/check-name?name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setNameError("This artist name is already registered. If you think this is a mistake, contact support.");
          return false;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingName(false);
    }
    return true;
  };

  const copySupportEmail = () => {
    navigator.clipboard.writeText("support@cultmachine.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const autofillNameFromUrl = async (url: string) => {
    if (!url || form.artistName) return; // Don't overwrite if they already typed something
    try {
      const res = await fetch(`/api/track-info?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.artist && data.artist !== "Unknown Artist") {
          set("artistName", data.artist);
          checkArtistName(data.artist);
        }
      }
    } catch (e) {
      console.error(e);
    }
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
    if (!form.monthlyListeners || !form.instagramFollowers) {
      setError("Please provide your Monthly Listeners and Instagram Followers to proceed.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      artistName: form.artistName,
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
      instagramFollowers: form.instagramFollowers || undefined,
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

    // Refresh the session so genre and required fields are updated and the redirect check works
    await update({ 
      genre: form.genre,
      monthlyListeners: form.monthlyListeners,
      instagramFollowers: form.instagramFollowers
    });
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
          className="h-full bg-[#F5E000] transition-all duration-500"
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
                  className={`flex items-center justify-center gap-2 rounded-full min-w-0 transition-all duration-200 shadow-sm ${
                    active
                      ? "px-4 py-1.5 bg-[#F5E000] border border-[#F5E000] text-black flex-1"
                      : done
                      ? "w-8 h-8 bg-ok/10 border border-ok/40 text-ok flex-none"
                      : "w-8 h-8 bg-bg-surface border border-border text-cm-text-muted flex-none"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${active ? "text-black" : done ? "text-ok" : "text-cm-text-muted"}`}
                  />
                  {active && (
                    <span className="font-sans text-xs font-bold uppercase tracking-wider truncate text-black">
                      {t(`steps.${key}`)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: Basics ── */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="p-4 bg-[#F5E000]/10 border border-[#F5E000]/20 flex items-start gap-3">
                <Info size={18} className="text-[#F5E000] shrink-0 mt-0.5" />
                <p className="font-sans text-sm text-cm-text-primary leading-relaxed">
                  Please complete your profile to access your submissions and improve your experience. These metrics help our curators match your music with the right opportunities.
                </p>
              </div>
              <StepHeader title={t("basics.title")} />
              
              <div className="space-y-6">
                <div className="p-4 bg-bg-surface border border-border">
                  <p className="text-xs font-bold uppercase tracking-wider mb-4 text-cm-text-muted">
                    Auto-Fill Profile
                  </p>
                  <p className="text-sm text-cm-text-primary mb-4 leading-relaxed">
                    Paste your Spotify or SoundCloud profile link to automatically fetch your Official Artist Name.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Spotify URL</label>
                      <input 
                        type="url" 
                        className="input" 
                        placeholder="https://open.spotify.com/artist/..." 
                        value={form.spotifyUrl}
                        onChange={(e) => set("spotifyUrl", e.target.value)}
                        onBlur={(e) => autofillNameFromUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="label">SoundCloud URL</label>
                      <input 
                        type="url" 
                        className="input" 
                        placeholder="https://soundcloud.com/..." 
                        value={form.soundcloudUrl}
                        onChange={(e) => set("soundcloudUrl", e.target.value)}
                        onBlur={(e) => autofillNameFromUrl(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label" htmlFor="artistName">
                    Artist Name *
                  </label>
                  <input
                    id="artistName"
                    type="text"
                    className={`input ${nameError ? "border-red-500 bg-red-500/5" : ""}`}
                    placeholder="E.g. MIDNIGHT ECHO"
                    value={form.artistName}
                    onChange={(e) => {
                      set("artistName", e.target.value);
                      setNameError("");
                    }}
                    onBlur={(e) => checkArtistName(e.target.value)}
                    required
                  />
                  {checkingName && <p className="text-xs text-cm-text-muted mt-2 font-bold uppercase tracking-wider">Checking availability...</p>}
                  {nameError && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50">
                      <p className="text-sm font-bold text-red-500 mb-2">{nameError}</p>
                      <button 
                        type="button"
                        onClick={copySupportEmail}
                        className="text-xs font-black uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 inline-block transition-colors"
                      >
                        {copiedEmail ? "COPIED!" : "Contact Support"}
                      </button>
                    </div>
                  )}
                  {!nameError && (
                    <p className="text-xs text-cm-text-muted mt-2">
                      If you didn't use a link above, please write your name EXACTLY as it appears on official sites to match future submissions.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="label" htmlFor="country">
                  {t("basics.country")} *
                </label>
                <select
                  id="country"
                  className="input"
                  value={form.country}
                  onChange={(e) => {
                    set("country", e.target.value);
                    set("city", ""); // reset city when country changes
                  }}
                >
                  <option value="">{t("basics.countryPlaceholder")}</option>
                  {Country.getAllCountries().map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label" htmlFor="city">
                  {t("basics.city")}
                </label>
                {(!form.country || State.getStatesOfCountry(form.country)?.length) ? (
                  <select
                    id="city"
                    className="input"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    disabled={!form.country}
                  >
                    <option value="">{t("basics.statePlaceholder")}</option>
                    {form.country && State.getStatesOfCountry(form.country)?.map((state) => (
                      <option key={`${state.name}-${state.isoCode}`} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                    {form.country && <option value="OTHER">OTHER / NOT LISTED</option>}
                  </select>
                ) : (
                  <input
                    id="city"
                    type="text"
                    className="input"
                    placeholder={t("basics.statePlaceholder")}
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                )}
                {form.city === "OTHER" && (
                  <input
                    type="text"
                    className="input mt-2"
                    placeholder="TYPE YOUR CITY NAME"
                    onChange={(e) => set("city", e.target.value)}
                  />
                )}
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
                      className={`p-6 border-4 transition-all duration-150 rounded-none text-left flex flex-col justify-between ${
                        form.roleType === r
                          ? "border-[#F5E000] bg-[#F5E000] text-black shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)]"
                          : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <p className="font-sans text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">PROJECT_TYPE</p>
                      <p className="font-sans text-2xl font-black uppercase tracking-tighter leading-none">
                        {r === "ARTIST" ? t("project.soloArtist") : t("project.band")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age range (for both ARTIST and BAND) */}
              <div>
                <label className="label" htmlFor="ageRange">
                  {t("project.ageRange")} *
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
                      onClick={() => {
                        set("genre", g);
                        set("subgenre", "");
                        setIsCustomSubgenre(false);
                      }}
                      className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${
                        form.genre === g
                          ? "bg-[#F5E000] text-black border-[#F5E000]"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              
              {form.genre && GENRE_MAP[form.genre] && (
                <div>
                  <label className="label" htmlFor="subgenre">
                    {t("genres.subgenre")} *
                  </label>
                  <select
                    id="subgenre"
                    className="input mb-3"
                    value={isCustomSubgenre ? "Other" : form.subgenre}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "Other") {
                        setIsCustomSubgenre(true);
                        set("subgenre", "");
                      } else {
                        setIsCustomSubgenre(false);
                        set("subgenre", val);
                      }
                    }}
                  >
                    <option value="">— Select Subgenre —</option>
                    {GENRE_MAP[form.genre].map((sg) => (
                      <option key={sg} value={sg}>
                        {sg}
                      </option>
                    ))}
                  </select>

                  {isCustomSubgenre && (
                    <input
                      type="text"
                      className="input animate-fade-in"
                      placeholder={t("genres.subgenrePlaceholder")}
                      value={form.subgenre}
                      onChange={(e) => set("subgenre", e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Languages ── */}
          {step === 4 && (
            <div className="animate-fade-in space-y-6">
              <StepHeader title={`${t("languages.title")} *`} hint={t("languages.hint")} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {MUSIC_LANGUAGES.map(({ code, labelKey }) => {
                  const selected = form.musicLanguages.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleLanguage(code)}
                      className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${
                        selected
                          ? "bg-[#F5E000] text-black border-[#F5E000]"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
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
                  {t("career.listeners")} *
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
                <label className="label" htmlFor="instagramFollowers">
                  {tRegister("instagramFollowers")} *
                </label>
                <select
                  id="instagramFollowers"
                  className="input"
                  value={form.instagramFollowers}
                  onChange={(e) => set("instagramFollowers", e.target.value)}
                >
                  <option value="">— select —</option>
                  {FOLLOWERS.map((f) => (
                    <option key={f} value={f}>
                      {tRegister(`followers.${f}`)}
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
                      className={`flex-1 py-4 border-2 transition-all font-sans text-[10px] font-black uppercase tracking-widest ${
                        form.hasManager === val
                          ? "bg-[#F5E000] text-black border-[#F5E000]"
                          : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
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
