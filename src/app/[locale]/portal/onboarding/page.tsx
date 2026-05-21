"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import {
  MapPin, Music2, Globe2, Mic2, BarChart2, CheckCircle2,
  ChevronRight, ChevronLeft, Loader2,
} from "lucide-react";

import { useOnboardingForm } from "@/components/onboarding/useOnboardingForm";
import StepBasics from "@/components/onboarding/steps/StepBasics";
import StepProject from "@/components/onboarding/steps/StepProject";
import StepGenres from "@/components/onboarding/steps/StepGenres";
import StepLanguages from "@/components/onboarding/steps/StepLanguages";
import StepSocials from "@/components/onboarding/steps/StepSocials";
import StepCareer from "@/components/onboarding/steps/StepCareer";
import StepReview from "@/components/onboarding/steps/StepReview";
import PremiumPRUnlockedModal from "@/components/portal/subcomponents/PremiumPRUnlockedModal";

const STEP_ICONS = [MapPin, Mic2, Music2, Globe2, Globe2, BarChart2, CheckCircle2];
const stepKeys = ["basics", "project", "genres", "languages", "socials", "career", "review"] as const;

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  const locale = useLocale();
  const router = useRouter();
  const { update } = useSession();

  const {
    step, loading, showUnlocked, setShowUnlocked,
    error, checkingName, nameError, setNameError,
    copiedEmail, form, set, toggleLanguage,
    canProceed, checkArtistName, copySupportEmail, autofillNameFromUrl,
    handleNext, handleBack, handleFinish, TOTAL_STEPS,
  } = useOnboardingForm(
    update,
    () => {}, // onQualified: modal will show, no redirect yet
    () => router.push(`/${locale}/portal/profile`)
  );

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between bg-bg-surface">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
          Cult Machine
        </p>
        <p className="font-sans text-xs font-semibold text-cm-text-muted">
          {t("progress", { current: step, total: TOTAL_STEPS })}
        </p>
      </header>

      {/* Progress bar */}
      <div className="w-full h-[2px] bg-border">
        <div
          className="h-full bg-[#F5E000] transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-12">
        <div className="w-full max-w-xl">

          {/* Step indicators */}
          <div className="flex items-center flex-wrap gap-1.5 mb-10">
            {stepKeys.map((key, i) => {
              const Icon = STEP_ICONS[i];
              const n = i + 1;
              const active = n === step;
              const done = n < step;
              return (
                <div
                  key={key}
                  className={`flex items-center justify-center gap-2 rounded-full min-w-0 transition-all duration-200 shadow-sm ${
                    active
                      ? "px-4 py-1.5 bg-[#F5E000] border border-[#F5E000] text-black flex-1"
                      : done
                      ? "w-8 h-8 bg-ok/10 border border-ok/40 text-ok flex-none"
                      : "w-8 h-8 bg-bg-surface border border-border text-cm-text-muted flex-none"
                  }`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${active ? "text-black" : done ? "text-ok" : "text-cm-text-muted"}`}
                  />
                  {active && (
                    <span className="font-sans text-xs font-bold uppercase tracking-wider truncate text-black">
                      {t(`steps.${key}`)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Step panels */}
          {step === 1 && (
            <StepBasics
              form={form} set={set} checkingName={checkingName} nameError={nameError}
              setNameError={setNameError} checkArtistName={checkArtistName}
              copiedEmail={copiedEmail} copySupportEmail={copySupportEmail}
              autofillNameFromUrl={autofillNameFromUrl} t={t}
            />
          )}
          {step === 2 && <StepProject form={form} set={set} t={t} tRegister={tRegister} />}
          {step === 3 && <StepGenres form={form} set={set} t={t} />}
          {step === 4 && <StepLanguages form={form} toggleLanguage={toggleLanguage} t={t} />}
          {step === 5 && <StepSocials form={form} set={set} t={t} />}
          {step === 6 && <StepCareer form={form} set={set} t={t} tRegister={tRegister} />}
          {step === 7 && <StepReview form={form} t={t} tRegister={tRegister} />}

          {/* Error */}
          {error && (
            <div className="mt-8 px-4 py-3 rounded-md border border-danger/30 bg-danger/10 font-sans text-sm font-medium text-danger shadow-sm text-center">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="btn-ghost flex items-center gap-1 text-cm-text-secondary disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-primary flex items-center gap-2 disabled:opacity-40"
                id={`onboarding-next-step-${step}`}
              >
                {t("saveAndContinue")}
                <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="btn-primary flex items-center gap-2"
                id="onboarding-finish"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {t("finish")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Premium PR modal — on close, redirect to profile */}
      <PremiumPRUnlockedModal
        showUnlocked={showUnlocked}
        setShowUnlocked={(v) => {
          setShowUnlocked(v);
          if (!v) router.push(`/${locale}/portal/profile`);
        }}
      />
    </div>
  );
}
