"use client";

import { OnboardingFormData, SetFormField } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

interface Props {
  form: OnboardingFormData;
  set: SetFormField;
  t: (key: string) => string;
}

export default function StepSocials({ form, set, t }: Props) {
  return (
    <div className="animate-fade-in space-y-5">
      <StepHeader title={t("socials.title")} hint={t("socials.hint")} />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0" htmlFor="instagram">{t("socials.instagram")}</label>
          <button
            type="button"
            onClick={() => set("instagram", "N/A")}
            className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
          >
            I DON&apos;T HAVE THIS
          </button>
        </div>
        <input
          id="instagram"
          type="text"
          className="input"
          placeholder={t("socials.instagramPlaceholder")}
          value={form.instagram}
          onChange={(e) => set("instagram", e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0" htmlFor="tiktok">{t("socials.tiktok")}</label>
          <button
            type="button"
            onClick={() => set("tiktok", "N/A")}
            className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
          >
            I DON&apos;T HAVE THIS
          </button>
        </div>
        <input
          id="tiktok"
          type="text"
          className="input"
          placeholder={t("socials.tiktokPlaceholder")}
          value={form.tiktok}
          onChange={(e) => set("tiktok", e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0" htmlFor="youtube">{t("socials.youtube")}</label>
          <button
            type="button"
            onClick={() => set("youtube", "N/A")}
            className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
          >
            I DON&apos;T HAVE THIS
          </button>
        </div>
        <input
          id="youtube"
          type="text"
          className="input"
          placeholder={t("socials.youtubePlaceholder")}
          value={form.youtube}
          onChange={(e) => set("youtube", e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0" htmlFor="website">{t("socials.website")}</label>
          <button
            type="button"
            onClick={() => set("website", "N/A")}
            className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
          >
            I DON&apos;T HAVE THIS
          </button>
        </div>
        <input
          id="website"
          type="text"
          className="input"
          placeholder={t("socials.websitePlaceholder")}
          value={form.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>
    </div>
  );
}
