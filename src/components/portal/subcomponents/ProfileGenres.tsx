"use client";

import { GENRES } from "@/lib/genres";
import { ProfileFormData } from "./useProfileForm";

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

interface ProfileGenresProps {
  form: ProfileFormData;
  set: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  toggleLanguage: (code: string) => void;
  initialData: any;
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function ProfileGenres({
  form,
  set,
  toggleLanguage,
  initialData,
  t,
  tRegister,
}: ProfileGenresProps) {
  return (
    <div className="card space-y-6">
      <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
        {t("project.title")} / {t("genres.title")}
      </h2>

      {/* Role Type */}
      <div className="grid grid-cols-2 gap-3">
        {(["ARTIST", "BAND"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => set("roleType", r)}
            disabled={!!initialData.roleType && initialData.roleType !== r}
            className={`p-6 border-4 transition-all duration-150 rounded-none text-left flex flex-col justify-between disabled:opacity-50 disabled:cursor-not-allowed ${
              form.roleType === r
                ? "border-[#F5E000] bg-[#F5E000] text-black shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)]"
                : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"
            }`}
          >
            <p className="font-sans text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
              PROJECT_TYPE
            </p>
            <p className="font-sans text-2xl font-black uppercase tracking-tighter leading-none">
              {r === "ARTIST" ? t("project.soloArtist") : t("project.band")}
            </p>
          </button>
        ))}
      </div>

      {/* Age Range */}
      <div>
        <label className="label" htmlFor="ageRange">
          {t("project.ageRange")}
        </label>
        <select
          id="ageRange"
          className="input disabled:opacity-50 disabled:cursor-not-allowed"
          value={form.ageRange}
          onChange={(e) => set("ageRange", e.target.value)}
          disabled={!!initialData.ageRange}
        >
          <option value="">— {tRegister("ageRange")} —</option>
          {AGE_RANGES.map((a) => (
            <option key={a} value={a}>
              {tRegister(`ageRanges.${a}`)}
            </option>
          ))}
        </select>
      </div>

      {/* Primary Genre */}
      <div className="pt-4 border-t border-border">
        <label className="label">{t("genres.genre")}</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                set("genre", g);
                set("subgenre", "");
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

      {/* Subgenre */}
      {form.genre && (
        <div>
          <label className="label" htmlFor="subgenre">
            {t("genres.subgenre")} *
          </label>
          <input
            id="subgenre"
            type="text"
            className="input"
            placeholder={t("genres.subgenrePlaceholder")}
            value={form.subgenre}
            onChange={(e) => set("subgenre", e.target.value)}
            autoComplete="off"
          />
          <p className="mt-2 font-sans text-[10px] text-white/30 uppercase tracking-widest">
            e.g. Dark Pop, Bedroom Trap, Nu Metal, Bedroom Pop...
          </p>
        </div>
      )}

      {/* Music Languages */}
      <div>
        <label className="label">{t("languages.title")} *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {MUSIC_LANGUAGES.map(({ code, labelKey }) => (
            <button
              key={code}
              type="button"
              onClick={() => toggleLanguage(code)}
              className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${
                form.musicLanguages.includes(code)
                  ? "bg-[#F5E000] text-black border-[#F5E000]"
                  : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
              }`}
            >
              {t(`languages.${labelKey}`)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
