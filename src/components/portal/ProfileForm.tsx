"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const GENRES = [
  "Rock", "Electronic", "Hip-Hop", "R&B / Soul", "Pop",
  "Folk / Acoustic", "Latin", "Jazz", "Metal", "Ambient / Experimental", "Other",
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
];

export default function ProfileForm({ initialData }: { initialData: any }) {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  
  const [form, setForm] = useState({
    country: initialData.country || "",
    city: initialData.city || "",
    bio: initialData.bio || "",
    roleType: initialData.roleType || "ARTIST",
    ageRange: initialData.ageRange || "",
    bandSize: initialData.bandSize || 2,
    memberAgeRanges: Array.isArray(initialData.memberAgeRanges) 
      ? initialData.memberAgeRanges.map((r: any) => r.range || "") 
      : ["", ""],
    genre: initialData.genre || "",
    subgenre: initialData.subgenre || "",
    musicLanguages: Array.isArray(initialData.musicLanguages) ? initialData.musicLanguages : [],
    spotifyUrl: initialData.spotifyUrl || "",
    instagram: initialData.instagram || "",
    tiktok: initialData.tiktok || "",
    youtube: initialData.youtube || "",
    soundcloudUrl: initialData.soundcloudUrl || "",
    website: initialData.website || "",
    careerStartYear: initialData.careerStartYear?.toString() || "",
    monthlyListeners: initialData.monthlyListeners || "",
    distributionMethod: initialData.distributionMethod || "",
    hasManager: !!initialData.hasManager,
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const set = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setStatus({ type: null, message: "" }); // clear messages on edit
  };

  const toggleLanguage = (code: string) => {
    setForm(prev => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l) => l !== code)
        : [...prev.musicLanguages, code],
    }));
    setStatus({ type: null, message: "" });
  };

  const updateBandSize = (size: number) => {
    const clamped = Math.max(2, Math.min(20, size));
    setForm(prev => ({
      ...prev,
      bandSize: clamped,
      memberAgeRanges: Array.from({ length: clamped }, (_, i) => prev.memberAgeRanges[i] ?? ""),
    }));
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = {
        ...form,
        careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      };

      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }

      setStatus({ type: "success", message: "Profile saved successfully." });
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      
      {/* BASICS */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("basics.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="country">{t("basics.country")}</label>
            <select id="country" className="input" value={form.country} onChange={(e) => set("country", e.target.value)}>
              <option value="">{t("basics.countryPlaceholder")}</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">{t("basics.city")}</label>
            <input id="city" type="text" className="input" placeholder={t("basics.cityPlaceholder")} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="bio">
            {t("basics.bio")}
            <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">{form.bio.length}/500</span>
          </label>
          <textarea id="bio" className="input min-h-[100px] resize-none" placeholder={t("basics.bioPlaceholder")} maxLength={500} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>
      </div>

      {/* PROJECT & GENRES */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("project.title")} / {t("genres.title")}</h2>
        
        {/* Role Type */}
        <div className="grid grid-cols-2 gap-3">
          {(["ARTIST", "BAND"] as const).map((r) => (
            <button
              key={r} type="button" onClick={() => set("roleType", r)}
              className={`p-4 border rounded-xl text-left transition-all duration-200 shadow-sm ${form.roleType === r ? "border-accent-red bg-accent-red/10 ring-1 ring-accent-red/20" : "border-border bg-bg-surface hover:border-cm-text-muted"}`}
            >
              <p className="font-sans text-sm font-bold text-cm-text-primary">{r === "ARTIST" ? t("project.soloArtist") : t("project.band")}</p>
            </button>
          ))}
        </div>

        {/* Age Range (both ARTIST and BAND) */}
        <div>
          <label className="label" htmlFor="ageRange">{t("project.ageRange")}</label>
          <select id="ageRange" className="input" value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)}>
            <option value="">— {tRegister("ageRange")} —</option>
            {AGE_RANGES.map((a) => <option key={a} value={a}>{tRegister(`ageRanges.${a}`)}</option>)}
          </select>
        </div>

        <div className="pt-4 border-t border-border">
          <label className="label">{t("genres.genre")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((g) => (
              <button
                key={g} type="button" onClick={() => set("genre", g)}
                className={`px-3 py-2 border rounded-md text-left transition-all duration-200 font-sans text-sm font-medium shadow-sm ${form.genre === g ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20" : "border-border bg-bg-surface text-cm-text-secondary hover:border-cm-text-muted"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="subgenre">{t("genres.subgenre")}</label>
          <input id="subgenre" type="text" className="input" placeholder={t("genres.subgenrePlaceholder")} value={form.subgenre} onChange={(e) => set("subgenre", e.target.value)} />
        </div>
        
        <div>
          <label className="label">{t("languages.title")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MUSIC_LANGUAGES.map(({ code, labelKey }) => (
              <button
                key={code} type="button" onClick={() => toggleLanguage(code)}
                className={`px-3 py-2 border rounded-md text-left transition-all duration-200 font-sans text-sm font-medium shadow-sm ${form.musicLanguages.includes(code) ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20" : "border-border bg-bg-surface text-cm-text-secondary hover:border-cm-text-muted"}`}
              >
                {t(`languages.${labelKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SOCIALS */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("socials.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div><label className="label">{t("socials.spotify")}</label><input type="text" className="input" value={form.spotifyUrl} onChange={(e) => set("spotifyUrl", e.target.value)} /></div>
          <div><label className="label">{t("socials.instagram")}</label><input type="text" className="input" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
          <div><label className="label">{t("socials.tiktok")}</label><input type="text" className="input" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></div>
          <div><label className="label">{t("socials.youtube")}</label><input type="text" className="input" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} /></div>
          <div><label className="label">{t("socials.soundcloud")}</label><input type="text" className="input" value={form.soundcloudUrl} onChange={(e) => set("soundcloudUrl", e.target.value)} /></div>
          <div><label className="label">{t("socials.website")}</label><input type="text" className="input" value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
        </div>
      </div>

      {/* CAREER */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("career.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label">{t("career.startYear")}</label>
            <input type="number" className="input" min={1950} max={new Date().getFullYear()} value={form.careerStartYear} onChange={(e) => set("careerStartYear", e.target.value)} />
          </div>
          <div>
            <label className="label">{t("career.listeners")}</label>
            <select className="input" value={form.monthlyListeners} onChange={(e) => set("monthlyListeners", e.target.value)}>
              <option value="">— select —</option>
              {LISTENERS.map((l) => <option key={l} value={l}>{tRegister(`listeners.${l}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("career.distribution")}</label>
            <select className="input" value={form.distributionMethod} onChange={(e) => set("distributionMethod", e.target.value)}>
              <option value="">— select —</option>
              {DISTRIBUTION.map((d) => <option key={d} value={d}>{tRegister(`distribution.${d}`)}</option>)}
            </select>
          </div>
          <div>
            <p className="label mb-3">{t("career.manager")}</p>
            <div className="flex gap-3">
              {[true, false].map((val) => (
                <button
                  key={String(val)} type="button" onClick={() => set("hasManager", val)}
                  className={`flex-1 py-2 border rounded-md font-sans text-sm font-medium transition-all shadow-sm ${form.hasManager === val ? "border-accent-red bg-accent-red text-white" : "border-border bg-bg-surface text-cm-text-secondary hover:border-cm-text-muted"}`}
                >
                  {val ? t("career.yes") : t("career.no")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SAVE ACTIONS */}
      <div className="flex items-center justify-between pt-4 pb-12">
        <div>
          {status.type === "success" && <p className="text-ok text-sm font-medium flex items-center gap-2"><CheckCircle2 size={16}/> {status.message}</p>}
          {status.type === "error" && <p className="text-danger text-sm font-medium flex items-center gap-2"><AlertCircle size={16}/> {status.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary min-w-[150px] flex justify-center items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Profile
        </button>
      </div>

    </form>
  );
}
