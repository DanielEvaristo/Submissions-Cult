"use client";

import { OnboardingFormData, SetFormField } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

const LISTENERS = [
  "UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K",
  "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K",
] as const;

const FOLLOWERS = [
  "UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K",
  "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K",
] as const;

interface Props {
  form: OnboardingFormData;
  set: SetFormField;
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function StepCareer({ form, set, t, tRegister }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <StepHeader title={t("career.title")} />

      <div>
        <label className="label" htmlFor="careerStartYear">{t("career.startYear")}</label>
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
        <label className="label" htmlFor="monthlyListeners">{t("career.listeners")} *</label>
        <select
          id="monthlyListeners"
          className="input"
          value={form.monthlyListeners}
          onChange={(e) => set("monthlyListeners", e.target.value)}
        >
          <option value="">— select —</option>
          {LISTENERS.map((l) => (
            <option key={l} value={l}>{tRegister(`listeners.${l}`)}</option>
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
            <option key={f} value={f}>{tRegister(`followers.${f}`)}</option>
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
  );
}
