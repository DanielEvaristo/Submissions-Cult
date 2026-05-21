"use client";

import { Info } from "lucide-react";
import { Country, State } from "country-state-city";
import { OnboardingFormData, SetFormField } from "../useOnboardingForm";
import { StepHeader } from "../OnboardingShared";

interface Props {
  form: OnboardingFormData;
  set: SetFormField;
  checkingName: boolean;
  nameError: string;
  setNameError: (v: string) => void;
  checkArtistName: (name: string) => Promise<boolean>;
  copiedEmail: boolean;
  copySupportEmail: () => void;
  autofillNameFromUrl: (url: string) => Promise<void>;
  t: (key: string, opts?: any) => string;
}

export default function StepBasics({
  form, set, checkingName, nameError, setNameError,
  checkArtistName, copiedEmail, copySupportEmail, autofillNameFromUrl, t,
}: Props) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="p-4 bg-[#F5E000]/10 border border-[#F5E000]/20 flex items-start gap-3">
        <Info size={18} className="text-[#F5E000] shrink-0 mt-0.5" />
        <p className="font-sans text-sm text-cm-text-primary leading-relaxed">
          Please complete your profile to access your submissions and improve your experience. These
          metrics help our curators match your music with the right opportunities.
        </p>
      </div>
      <StepHeader title={t("basics.title")} />

      <div className="space-y-6">
        <div className="p-4 bg-bg-surface border border-border">
          <p className="text-xs font-bold uppercase tracking-wider mb-4 text-cm-text-muted">
            Auto-Fill Profile
          </p>
          <p className="text-sm text-cm-text-primary mb-4 leading-relaxed">
            Paste your Spotify or SoundCloud profile link to automatically fetch your Official
            Artist Name.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Spotify URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://open.spotify.com/artist/..."
                value={form.spotifyUrl}
                onChange={(e) => set("spotifyUrl", e.target.value)}
                onBlur={(e) => autofillNameFromUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Other Link URL</label>
              <input
                type="url"
                className="input"
                placeholder="https://..."
                value={form.soundcloudUrl}
                onChange={(e) => set("soundcloudUrl", e.target.value)}
                onBlur={(e) => autofillNameFromUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="artistName">Artist Name *</label>
          <input
            id="artistName"
            type="text"
            className={`input ${nameError ? "border-red-500 bg-red-500/5" : ""}`}
            placeholder="E.g. MIDNIGHT ECHO"
            value={form.artistName}
            onChange={(e) => { set("artistName", e.target.value); setNameError(""); }}
            onBlur={(e) => checkArtistName(e.target.value)}
            required
          />
          {checkingName && (
            <p className="text-xs text-cm-text-muted mt-2 font-bold uppercase tracking-wider">
              Checking availability...
            </p>
          )}
          {nameError && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50">
              <p className="text-sm font-bold text-red-500 mb-2">{nameError}</p>
              <button
                type="button"
                onClick={copySupportEmail}
                className="text-xs font-black uppercase tracking-wider text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 inline-block transition-colors"
              >
                {copiedEmail ? "COPIED!" : "Contact Support"}
              </button>
            </div>
          )}
          {!nameError && (
            <p className="text-xs text-cm-text-muted mt-2">
              If you didn&apos;t use a link above, please write your name EXACTLY as it appears on
              official sites to match future submissions.
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="label" htmlFor="country">{t("basics.country")} *</label>
        <select
          id="country"
          className="input"
          value={form.country}
          onChange={(e) => { set("country", e.target.value); set("city", ""); }}
        >
          <option value="">{t("basics.countryPlaceholder")}</option>
          {Country.getAllCountries().map((c) => (
            <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="state">STATE / REGION (OPTIONAL)</label>
        {!form.country || State.getStatesOfCountry(form.country)?.length ? (
          <select
            id="state"
            className="input"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            disabled={!form.country}
          >
            <option value="">{t("basics.statePlaceholder")}</option>
            {form.country &&
              State.getStatesOfCountry(form.country)?.map((s) => (
                <option key={`${s.name}-${s.isoCode}`} value={s.name}>{s.name}</option>
              ))}
            {form.country && <option value="OTHER">OTHER / NOT LISTED</option>}
          </select>
        ) : (
          <input
            id="state"
            type="text"
            className="input"
            placeholder={t("basics.statePlaceholder")}
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
          />
        )}
        {form.state === "OTHER" && (
          <input
            type="text"
            className="input mt-2"
            placeholder="TYPE YOUR STATE / REGION NAME"
            onChange={(e) => set("state", e.target.value)}
          />
        )}
      </div>

      <div>
        <label className="label" htmlFor="city">CITY (OPTIONAL)</label>
        <input
          id="city"
          type="text"
          className="input"
          placeholder="e.g. Los Angeles, London, Tokyo..."
          value={form.city}
          onChange={(e) => set("city", e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="bio">
          {t("basics.bio")}
          <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">
            {t("basics.bioHint", { count: form.bio.length })}
          </span>
        </label>
        <textarea
          id="bio"
          className="input min-h-[100px] resize-none"
          placeholder={t("basics.bioPlaceholder")}
          maxLength={500}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>
    </div>
  );
}
