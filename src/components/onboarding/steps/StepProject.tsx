"use client";

import { OnboardingFormData, SetFormField } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

const AGE_RANGES = ["UNDER_18", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_PLUS"] as const;

interface Props {
  form: OnboardingFormData;
  set: SetFormField;
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function StepProject({ form, set, t, tRegister }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <StepHeader title={t("project.title")} />

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
              <p className="font-sans text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">
                PROJECT_TYPE
              </p>
              <p className="font-sans text-2xl font-black uppercase tracking-tighter leading-none">
                {r === "ARTIST" ? t("project.soloArtist") : t("project.band")}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="ageRange">{t("project.ageRange")} *</label>
        <select
          id="ageRange"
          className="input"
          value={form.ageRange}
          onChange={(e) => set("ageRange", e.target.value)}
        >
          <option value="">— {tRegister("ageRange")} —</option>
          {AGE_RANGES.map((a) => (
            <option key={a} value={a}>{tRegister(`ageRanges.${a}`)}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
