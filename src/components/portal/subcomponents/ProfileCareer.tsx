"use client";

import { ProfileFormData } from "./useProfileForm";

const LISTENERS = [
  "UNDER_1K",
  "FROM_1K_TO_10K",
  "FROM_10K_TO_50K",
  "FROM_50K_TO_100K",
  "FROM_100K_TO_500K",
  "OVER_500K",
] as const;

interface ProfileCareerProps {
  form: ProfileFormData;
  set: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  initialData: any;
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function ProfileCareer({
  form,
  set,
  initialData,
  t,
  tRegister,
}: ProfileCareerProps) {
  return (
    <div className="card space-y-6">
      <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
        {t("career.title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Career Start Year */}
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

        {/* Monthly Listeners */}
        <div>
          <label className="label">{t("career.listeners")} *</label>
          <select
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

        {/* Has Manager */}
        <div>
          <p className="label mb-3">{t("career.manager")}</p>
          <div className="flex gap-4">
            {[true, false].map((val) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => set("hasManager", val)}
                className={`flex-1 py-4 border-2 transition-all font-sans text-[10px] font-black uppercase tracking-widest ${
                  form.hasManager === val
                    ? "bg-[#F5E000] text-black border-[#F5E000]"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                }`}
              >
                {val ? t("career.yes") : t("career.no")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
