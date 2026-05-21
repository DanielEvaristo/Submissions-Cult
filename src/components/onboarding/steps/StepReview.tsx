"use client";

import { Country } from "country-state-city";
import { OnboardingFormData } from "../useOnboardingForm";
import { StepHeader, ReviewRow } from "../OnboardingShared";

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
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function StepReview({ form, t, tRegister }: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <StepHeader title={t("review.title")} hint={t("review.subtitle")} />
      <div className="space-y-4">
        <ReviewRow
          label={t("review.location")}
          value={[
            form.city,
            form.state,
            form.country
              ? Country.getCountryByCode(form.country)?.name || form.country
              : null,
          ]
            .filter(Boolean)
            .filter((v) => v !== "N/A" && v !== "OTHER")
            .join(", ")}
          fallback={t("review.notSet")}
        />
        <ReviewRow
          label={t("review.projectType")}
          value={form.roleType === "BAND" ? `Band (${form.bandSize} members)` : "Solo Artist"}
        />
        <ReviewRow
          label={t("review.genre")}
          value={[form.genre, form.subgenre]
            .filter(Boolean)
            .filter((v) => v !== "Other")
            .join(" / ")}
          fallback={t("review.notSet")}
        />
        <ReviewRow
          label={t("review.languages")}
          value={
            form.musicLanguages.length > 0
              ? form.musicLanguages
                  .map((l) => MUSIC_LANGUAGES.find((m) => m.code === l)?.labelKey || l)
                  .map((k) => t(`languages.${k}`))
                  .join(", ")
              : ""
          }
          fallback={t("review.notSet")}
        />
        <ReviewRow
          label={t("review.socials")}
          value={[
            { name: "Spotify", url: form.spotifyUrl },
            { name: "Instagram", url: form.instagram },
            { name: "YouTube", url: form.youtube },
            { name: "TikTok", url: form.tiktok },
            { name: "Website", url: form.website },
            { name: "Other Link", url: form.soundcloudUrl },
          ]
            .filter((s) => s.url && s.url !== "N/A")
            .map((s) => s.name)
            .join(", ")}
          fallback={t("review.notSet")}
        />
        <ReviewRow
          label={t("review.career")}
          value={[
            form.careerStartYear ? `Since ${form.careerStartYear}` : "",
            form.monthlyListeners ? tRegister(`listeners.${form.monthlyListeners}`) : "",
          ]
            .filter(Boolean)
            .join(" · ")}
          fallback={t("review.notSet")}
        />
      </div>

      <div className="pt-2 border-t border-border">
        <p className="font-mono text-[10px] text-cm-text-muted uppercase tracking-widest">
          {t("progressHint")}
        </p>
      </div>
    </div>
  );
}
