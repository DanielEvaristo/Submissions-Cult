"use client";

import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OnboardingFormData {
  country: string;
  state: string;
  city: string;
  artistName: string;
  bio: string;
  roleType: "ARTIST" | "BAND";
  ageRange: string;
  bandSize: number;
  memberAgeRanges: string[];
  genre: string;
  subgenre: string;
  musicLanguages: string[];
  spotifyUrl: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  soundcloudUrl: string;
  website: string;
  careerStartYear: string;
  monthlyListeners: string;
  instagramFollowers: string;
  hasManager: boolean;
}

const INITIAL: OnboardingFormData = {
  country: "",
  state: "",
  city: "",
  artistName: "",
  bio: "",
  roleType: "ARTIST",
  ageRange: "",
  bandSize: 2,
  memberAgeRanges: ["", ""],
  genre: "",
  subgenre: "",
  musicLanguages: [],
  spotifyUrl: "",
  instagram: "",
  tiktok: "",
  youtube: "",
  soundcloudUrl: "",
  website: "",
  careerStartYear: "",
  monthlyListeners: "",
  instagramFollowers: "",
  hasManager: false,
};

const TOTAL_STEPS = 7;

export type SetFormField = <K extends keyof OnboardingFormData>(
  key: K,
  value: OnboardingFormData[K]
) => void;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOnboardingForm(
  updateSession: (data: any) => Promise<any>,
  onQualified: () => void,
  onFinished: () => void
) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showUnlocked, setShowUnlocked] = useState(false);
  const [error, setError] = useState("");
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [form, setForm] = useState<OnboardingFormData>(INITIAL);

  const set: SetFormField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleLanguage = (code: string) => {
    setForm((prev) => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l) => l !== code)
        : [...prev.musicLanguages, code],
    }));
  };

  const updateBandSize = (size: number) => {
    const clamped = Math.max(2, Math.min(20, size));
    setForm((prev) => ({
      ...prev,
      bandSize: clamped,
      memberAgeRanges: Array.from({ length: clamped }, (_, i) => prev.memberAgeRanges[i] ?? ""),
    }));
  };

  const canProceed = (): boolean => {
    if (step === 1) return !!form.artistName && !nameError && !!form.country;
    if (step === 2) return !!form.ageRange;
    if (step === 3) return !!form.genre && !!form.subgenre;
    if (step === 4) return form.musicLanguages.length > 0;
    if (step === 6) return !!form.monthlyListeners && !!form.instagramFollowers;
    return true;
  };

  const checkArtistName = async (name: string) => {
    if (!name) {
      setNameError("");
      return true;
    }
    setCheckingName(true);
    setNameError("");
    try {
      const res = await fetch(`/api/artist/check-name?name=${encodeURIComponent(name)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.exists) {
          setNameError(
            "This artist name is already registered. If you think this is a mistake, contact support."
          );
          return false;
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingName(false);
    }
    return true;
  };

  const copySupportEmail = () => {
    navigator.clipboard.writeText("support@cultmachine.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const autofillNameFromUrl = async (url: string) => {
    if (!url || form.artistName) return;
    try {
      const res = await fetch(`/api/track-info?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.artist && data.artist !== "Unknown Artist") {
          set("artistName", data.artist);
          checkArtistName(data.artist);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => s - 1);
    setError("");
  };

  const handleFinish = async () => {
    if (!form.genre) {
      setError("Please select a genre before finishing.");
      return;
    }
    if (!form.monthlyListeners || !form.instagramFollowers) {
      setError("Please provide your Monthly Listeners and Instagram Followers to proceed.");
      return;
    }
    setLoading(true);
    setError("");

    const payload = {
      artistName: form.artistName,
      country: form.country,
      state: form.state || undefined,
      city: form.city || undefined,
      bio: form.bio,
      roleType: form.roleType,
      ageRange: form.ageRange || undefined,
      genre: form.genre,
      subgenre: form.subgenre || undefined,
      musicLanguages: form.musicLanguages,
      spotifyUrl: form.spotifyUrl || undefined,
      instagram: form.instagram || undefined,
      tiktok: form.tiktok || undefined,
      youtube: form.youtube || undefined,
      soundcloudUrl: form.soundcloudUrl || undefined,
      website: form.website || undefined,
      careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      monthlyListeners: form.monthlyListeners || undefined,
      instagramFollowers: form.instagramFollowers || undefined,
      hasManager: form.hasManager,
    };

    const res = await fetch("/api/artist/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        console.error("Non-JSON error response", e);
      }
      setError(data.error ?? `Error ${res.status}: Something went wrong. Please try again.`);
      setLoading(false);
      return;
    }

    try {
      await updateSession({
        genre: form.genre,
        monthlyListeners: form.monthlyListeners,
        instagramFollowers: form.instagramFollowers,
      });
    } catch (e) {
      console.warn("Error updating session:", e);
    }

    const isQualified =
      !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.monthlyListeners || "") &&
      !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.instagramFollowers || "");

    if (isQualified) {
      setShowUnlocked(true);
      setLoading(false);
      onQualified();
    } else {
      onFinished();
    }
  };

  return {
    step,
    loading,
    showUnlocked,
    setShowUnlocked,
    error,
    checkingName,
    nameError,
    setNameError,
    copiedEmail,
    form,
    set,
    toggleLanguage,
    updateBandSize,
    canProceed,
    checkArtistName,
    copySupportEmail,
    autofillNameFromUrl,
    handleNext,
    handleBack,
    handleFinish,
    TOTAL_STEPS,
  };
}
