"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle, Zap, X } from "lucide-react";

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

export default function ProfileForm({ initialData }: { initialData: any }) {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  const { update } = useSession();
  
  const [form, setForm] = useState({
    artistName: initialData.artistName || "",
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
    instagramFollowers: initialData.instagramFollowers || "",
    tiktok: initialData.tiktok || "",
    youtube: initialData.youtube || "",
    soundcloudUrl: initialData.soundcloudUrl || "",
    website: initialData.website || "",
    careerStartYear: initialData.careerStartYear?.toString() || "",
    monthlyListeners: initialData.monthlyListeners || "",
    distributionMethod: initialData.distributionMethod || "",
    hasManager: !!initialData.hasManager,
  });
  
  const [showUnlocked, setShowUnlocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });
  const [isCustomSubgenre, setIsCustomSubgenre] = useState(() => {
    if (initialData.genre && initialData.subgenre) {
      const predefined = GENRE_MAP[initialData.genre] || [];
      return !predefined.includes(initialData.subgenre);
    }
    return false;
  });

  const set = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setStatus({ type: null, message: "" }); // clear messages on edit
    if (key === "artistName") {
      setNameError("");
    }
  };

  const checkArtistName = async (name: string) => {
    if (!name || name === initialData.artistName) {
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

  const toggleLanguage = (code: string) => {
    setForm(prev => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l: string) => l !== code)
        : [...prev.musicLanguages, code],
    }));
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;
    
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      if (!form.monthlyListeners || !form.instagramFollowers) {
        throw new Error("Monthly Listeners and Instagram Followers are required to access full features.");
      }
      if (!form.genre || !form.subgenre) {
        throw new Error("Please select a Genre and Subgenre.");
      }
      if (form.musicLanguages.length === 0) {
        throw new Error("Please select at least one language you create in.");
      }

      const payload = {
        ...form,
        careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      };

      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Profile updated successfully!" });
        
        await update({
          name: form.artistName,
          artistName: form.artistName,
          genre: form.genre,
          subgenre: form.subgenre,
          country: form.country,
          monthlyListeners: form.monthlyListeners,
          instagramFollowers: form.instagramFollowers,
        });

        // Qualification check for Premium PR
        const isQualified = 
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.monthlyListeners) && 
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.instagramFollowers);
        
        if (isQualified) {
          setShowUnlocked(true);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
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
        
        <div>
          <label className="label" htmlFor="artistName">
            Artist Name *
          </label>
          <input
            id="artistName"
            type="text"
            className={`input ${nameError ? "border-red-500 bg-red-500/5" : ""} disabled:opacity-50 disabled:cursor-not-allowed`}
            placeholder="E.g. MIDNIGHT ECHO"
            value={form.artistName}
            onChange={(e) => set("artistName", e.target.value)}
            onBlur={(e) => checkArtistName(e.target.value)}
            required
            disabled={!!initialData.artistName}
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="country">{t("basics.country")}</label>
            <select id="country" className="input" value={form.country} onChange={(e) => {
                set("country", e.target.value);
                set("city", "");
              }}>
              <option value="">{t("basics.countryPlaceholder")}</option>
              {Country.getAllCountries().map((c) => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">{t("basics.city")}</label>
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
                  <option key={`${state.name}-${state.isoCode}`} value={state.name}>{state.name}</option>
                ))}
                {form.country && <option value="OTHER">OTHER / NOT LISTED</option>}
              </select>
            ) : (
              <input id="city" type="text" className="input" placeholder={t("basics.statePlaceholder")} value={form.city} onChange={(e) => set("city", e.target.value)} />
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
              disabled={!!initialData.roleType && initialData.roleType !== r}
              className={`p-6 border-4 transition-all duration-150 rounded-none text-left flex flex-col justify-between disabled:opacity-50 disabled:cursor-not-allowed ${form.roleType === r ? "border-[#F5E000] bg-[#F5E000] text-black shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)]" : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"}`}
            >
              <p className="font-sans text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">PROJECT_TYPE</p>
              <p className="font-sans text-2xl font-black uppercase tracking-tighter leading-none">{r === "ARTIST" ? t("project.soloArtist") : t("project.band")}</p>
            </button>
          ))}
        </div>

        {/* Age Range (both ARTIST and BAND) */}
        <div>
          <label className="label" htmlFor="ageRange">{t("project.ageRange")}</label>
          <select 
            id="ageRange" 
            className="input disabled:opacity-50 disabled:cursor-not-allowed" 
            value={form.ageRange} 
            onChange={(e) => set("ageRange", e.target.value)}
            disabled={!!initialData.ageRange}
          >
            <option value="">— {tRegister("ageRange")} —</option>
            {AGE_RANGES.map((a) => <option key={a} value={a}>{tRegister(`ageRanges.${a}`)}</option>)}
          </select>
        </div>

        <div className="pt-4 border-t border-border">
          <label className="label">{t("genres.genre")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((g) => (
              <button
                key={g} type="button" 
                onClick={() => {
                  set("genre", g);
                  set("subgenre", "");
                  setIsCustomSubgenre(false);
                }}
                className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${form.genre === g ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {form.genre && GENRE_MAP[form.genre] && (
          <div>
            <label className="label" htmlFor="subgenre">{t("genres.subgenre")} *</label>
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
                <option key={sg} value={sg}>{sg}</option>
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
        
        <div>
          <label className="label">{t("languages.title")} *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MUSIC_LANGUAGES.map(({ code, labelKey }) => (
              <button
                key={code} type="button" onClick={() => toggleLanguage(code)}
                className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${form.musicLanguages.includes(code) ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}
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
          <div>
            <label className="label">{tRegister("instagramFollowers")} *</label>
            <select className="input" value={form.instagramFollowers} onChange={(e) => set("instagramFollowers", e.target.value)}>
              <option value="">— select —</option>
              {FOLLOWERS.map((f) => <option key={f} value={f}>{tRegister(`followers.${f}`)}</option>)}
            </select>
          </div>
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
            <input 
              type="number" 
              className="input disabled:opacity-50 disabled:cursor-not-allowed" 
              min={1950} 
              max={new Date().getFullYear()} 
              value={form.careerStartYear} 
              onChange={(e) => set("careerStartYear", e.target.value)} 
              disabled={!!initialData.careerStartYear}
            />
          </div>
          <div>
            <label className="label">{t("career.listeners")} *</label>
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
            <div className="flex gap-4">
              {[true, false].map((val) => (
                <button
                  key={String(val)} type="button" onClick={() => set("hasManager", val)}
                  className={`flex-1 py-4 border-2 transition-all font-sans text-[10px] font-black uppercase tracking-widest ${form.hasManager === val ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
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

      {showUnlocked && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-reveal">
          <div className="bg-black border-4 border-[#00FF00] p-10 max-w-xl w-full text-center relative">
            <button onClick={() => setShowUnlocked(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={24}/></button>
            <div className="w-20 h-20 bg-[#00FF00] mx-auto mb-8 flex items-center justify-center">
              <Zap size={40} className="text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">PREMIUM PR UNLOCKED</h2>
            <p className="text-sm font-bold opacity-60 mb-10 leading-relaxed uppercase tracking-widest">
              Your numbers meet our editorial standards. You can now request Interviews and Articles in your next submission.
            </p>
            <button onClick={() => setShowUnlocked(false)} className="btn-primary w-full bg-[#00FF00] text-black border-[#00FF00]">GOT IT</button>
          </div>
        </div>
      )}

    </form>
  );
}
