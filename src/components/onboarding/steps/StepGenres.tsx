"use client";

import { GENRES } from "@/lib/genres";
import { OnboardingFormData, SetFormField } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

interface Props {
  form: OnboardingFormData;
  set: SetFormField;
  t: (key: string) => string;
}

export default function StepGenres({ form, set, t }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <StepHeader title={t("genres.title")} />

      <div>
        <label className="label" htmlFor="genre">{t("genres.genre")} *</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => { set("genre", g); set("subgenre", ""); }}
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

      {form.genre && (
        <div>
          <label className="label" htmlFor="subgenre">{t("genres.subgenre")} *</label>
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
    </div>
  );
}
