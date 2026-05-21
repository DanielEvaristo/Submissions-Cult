"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import { useProfileForm } from "./subcomponents/useProfileForm";
import ProfileBasics from "./subcomponents/ProfileBasics";
import ProfileGenres from "./subcomponents/ProfileGenres";
import ProfileSocials from "./subcomponents/ProfileSocials";
import ProfileCareer from "./subcomponents/ProfileCareer";
import PremiumPRUnlockedModal from "./subcomponents/PremiumPRUnlockedModal";

export default function ProfileForm({ initialData }: { initialData: any }) {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  const { update } = useSession();

  const {
    form,
    showUnlocked,
    setShowUnlocked,
    loading,
    isFollowersLocked,
    fetchingFollowers,
    fetchError,
    checkingName,
    nameError,
    copiedEmail,
    status,
    set,
    checkArtistName,
    handleInstagramBlur,
    copySupportEmail,
    toggleLanguage,
    handleSubmit,
  } = useProfileForm(initialData, update);

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      <ProfileBasics
        form={form}
        set={set}
        checkingName={checkingName}
        nameError={nameError}
        checkArtistName={checkArtistName}
        copiedEmail={copiedEmail}
        copySupportEmail={copySupportEmail}
        initialData={initialData}
        t={t}
      />

      <ProfileGenres
        form={form}
        set={set}
        toggleLanguage={toggleLanguage}
        initialData={initialData}
        t={t}
        tRegister={tRegister}
      />

      <ProfileSocials
        form={form}
        set={set}
        isFollowersLocked={isFollowersLocked}
        fetchingFollowers={fetchingFollowers}
        fetchError={fetchError}
        handleInstagramBlur={handleInstagramBlur}
        t={t}
        tRegister={tRegister}
      />

      <ProfileCareer
        form={form}
        set={set}
        initialData={initialData}
        t={t}
        tRegister={tRegister}
      />

      {/* SAVE ACTIONS */}
      <div className="flex items-center justify-between pt-4 pb-12">
        <div>
          {status.type === "success" && (
            <p className="text-ok text-sm font-medium flex items-center gap-2">
              <CheckCircle2 size={16} /> {status.message}
            </p>
          )}
          {status.type === "error" && (
            <p className="text-danger text-sm font-medium flex items-center gap-2">
              <AlertCircle size={16} /> {status.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary min-w-[150px] flex justify-center items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Profile
        </button>
      </div>

      <PremiumPRUnlockedModal
        showUnlocked={showUnlocked}
        setShowUnlocked={setShowUnlocked}
      />
    </form>
  );
}
