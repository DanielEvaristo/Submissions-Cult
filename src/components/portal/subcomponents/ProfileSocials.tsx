"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { ProfileFormData } from "./useProfileForm";

const FOLLOWERS = [
  "UNDER_1K",
  "FROM_1K_TO_10K",
  "FROM_10K_TO_50K",
  "FROM_50K_TO_100K",
  "FROM_100K_TO_500K",
  "OVER_500K",
] as const;

interface ProfileSocialsProps {
  form: ProfileFormData;
  set: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  isFollowersLocked: boolean;
  fetchingFollowers: boolean;
  fetchError: boolean;
  handleInstagramBlur: () => Promise<void>;
  t: (key: string) => string;
  tRegister: (key: string) => string;
}

export default function ProfileSocials({
  form,
  set,
  isFollowersLocked,
  fetchingFollowers,
  fetchError,
  handleInstagramBlur,
  t,
  tRegister,
}: ProfileSocialsProps) {
  return (
    <div className="card space-y-6">
      <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
        {t("socials.title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Instagram */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">{t("socials.instagram")}</label>
            <button
              type="button"
              onClick={() => set("instagram", "N/A")}
              className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
            >
              I DON&apos;T HAVE THIS
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="input pr-10"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
              onBlur={handleInstagramBlur}
            />
            {fetchingFollowers && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 size={14} className="animate-spin text-white/40" />
              </div>
            )}
            {fetchError && !fetchingFollowers && !isFollowersLocked && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FF0000]"
                title="Couldn't auto-fetch. Please select manually."
              >
                <AlertCircle size={14} />
              </div>
            )}
          </div>
        </div>

        {/* Instagram Followers */}
        <div>
          <label className="label">{tRegister("instagramFollowers")} *</label>
          <select
            className="input disabled:opacity-50"
            value={form.instagramFollowers}
            onChange={(e) => set("instagramFollowers", e.target.value)}
            disabled={isFollowersLocked}
          >
            <option value="">— select —</option>
            {FOLLOWERS.map((f) => (
              <option key={f} value={f}>
                {tRegister(`followers.${f}`)}
              </option>
            ))}
          </select>
        </div>

        {/* TikTok */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">{t("socials.tiktok")}</label>
            <button
              type="button"
              onClick={() => set("tiktok", "N/A")}
              className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
            >
              I DON&apos;T HAVE THIS
            </button>
          </div>
          <input
            type="text"
            className="input"
            value={form.tiktok}
            onChange={(e) => set("tiktok", e.target.value)}
          />
        </div>

        {/* YouTube */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">{t("socials.youtube")}</label>
            <button
              type="button"
              onClick={() => set("youtube", "N/A")}
              className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
            >
              I DON&apos;T HAVE THIS
            </button>
          </div>
          <input
            type="text"
            className="input"
            value={form.youtube}
            onChange={(e) => set("youtube", e.target.value)}
          />
        </div>

        {/* Other Link (Soundcloud) */}
        <div>
          <label className="label">Other Link URL</label>
          <input
            type="text"
            className="input"
            value={form.soundcloudUrl}
            onChange={(e) => set("soundcloudUrl", e.target.value)}
          />
        </div>

        {/* Website */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0">{t("socials.website")}</label>
            <button
              type="button"
              onClick={() => set("website", "N/A")}
              className="text-[9px] uppercase font-black tracking-widest text-cm-text-muted hover:text-[#F5E000] transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/5"
            >
              I DON&apos;T HAVE THIS
            </button>
          </div>
          <input
            type="text"
            className="input"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
