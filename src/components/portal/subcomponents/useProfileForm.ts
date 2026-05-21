"use client";

import { useState } from "react";
import { GENRE_MAP } from "@/lib/genres";

export interface ProfileFormData {
  artistName: string;
  country: string;
  state: string;
  city: string;
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
  instagramFollowers: string;
  tiktok: string;
  youtube: string;
  soundcloudUrl: string;
  website: string;
  careerStartYear: string;
  monthlyListeners: string;
  hasManager: boolean;
}

export function useProfileForm(initialData: any, updateSession: (data: any) => Promise<any>) {
  const [form, setForm] = useState<ProfileFormData>({
    artistName: initialData.artistName || "",
    country: initialData.country || "",
    state: initialData.state || "",
    city: initialData.city || "",
    bio: initialData.bio || "",
    roleType: initialData.roleType || "ARTIST",
    ageRange: initialData.ageRange || "",
    bandSize: initialData.bandSize || 2,
    memberAgeRanges: Array.isArray(initialData.memberAgeRanges)
      ? initialData.memberAgeRanges.map((r: any) => r.range || "")
      : ["", ""],
    genre: initialData.genre || "",
    subgenre: initialData.subgenre || "",
    musicLanguages: Array.isArray(initialData.musicLanguages) ? initialData.musicLanguages : [],
    spotifyUrl: initialData.spotifyUrl || "",
    instagram: initialData.instagram || "",
    instagramFollowers: initialData.instagramFollowers || "",
    tiktok: initialData.tiktok || "",
    youtube: initialData.youtube || "",
    soundcloudUrl: initialData.soundcloudUrl || "",
    website: initialData.website || "",
    careerStartYear: initialData.careerStartYear?.toString() || "",
    monthlyListeners: initialData.monthlyListeners || "",
    hasManager: !!initialData.hasManager,
  });

  const [showUnlocked, setShowUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFollowersLocked, setIsFollowersLocked] = useState(false);
  const [fetchingFollowers, setFetchingFollowers] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });

  const set = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus({ type: null, message: "" });
    if (key === "artistName") {
      setNameError("");
    }
  };

  const checkArtistName = async (name: string) => {
    if (!name || name === initialData.artistName) {
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
      console.error("Check name error", e);
    } finally {
      setCheckingName(false);
    }
    return true;
  };

  const handleInstagramBlur = async () => {
    const usernameParam = form.instagram.trim();
    if (!usernameParam || usernameParam === "N/A" || isFollowersLocked) return;

    let username = usernameParam;
    if (username.startsWith("@")) username = username.substring(1);
    if (username.includes("instagram.com/")) {
      const parts = username.split("instagram.com/");
      const afterSlash = parts[1].split(/[/?#]/)[0];
      username = afterSlash;
    }

    setFetchingFollowers(true);
    setFetchError(false);
    try {
      const res = await fetch(`/api/instagram/stats?username=${encodeURIComponent(username)}`);
      await new Promise((r) => setTimeout(r, 1000));

      if (res.ok) {
        const data = await res.json();
        if (data.range) {
          set("instagramFollowers", data.range);
          setIsFollowersLocked(true);
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } else {
        setFetchError(true);
      }
    } catch (e) {
      console.error("Failed to fetch instagram stats", e);
      setFetchError(true);
    } finally {
      setFetchingFollowers(false);
    }
  };

  const copySupportEmail = () => {
    navigator.clipboard.writeText("support@cultmachine.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const toggleLanguage = (code: string) => {
    setForm((prev) => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l: string) => l !== code)
        : [...prev.musicLanguages, code],
    }));
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) return;

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      if (!form.monthlyListeners || !form.instagramFollowers) {
        throw new Error(
          "Monthly Listeners and Instagram Followers are required to access full features."
        );
      }
      if (!form.genre || !form.subgenre) {
        throw new Error("Please select a Genre and Subgenre.");
      }
      if (form.musicLanguages.length === 0) {
        throw new Error("Please select at least one language you create in.");
      }

      const payload = {
        ...form,
        careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      };

      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Profile updated successfully!" });

        await updateSession({
          name: form.artistName,
          artistName: form.artistName,
          genre: form.genre,
          subgenre: form.subgenre,
          country: form.country,
          monthlyListeners: form.monthlyListeners,
          instagramFollowers: form.instagramFollowers,
        });

        const isQualified =
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.monthlyListeners) &&
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.instagramFollowers);

        if (isQualified) {
          setShowUnlocked(true);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
}
