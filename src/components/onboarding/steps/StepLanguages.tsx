"use client";

import { OnboardingFormData } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

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

interface Props {
  form: OnboardingFormData;
  toggleLanguage: (code: string) => void;
  t: (key: string) => string;
}

export default function StepLanguages({ form, toggleLanguage, t }: Props) {
  return (
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
  );
}
