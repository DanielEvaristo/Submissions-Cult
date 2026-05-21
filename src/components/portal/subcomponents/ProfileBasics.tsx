"use client";

import { Country, State } from "country-state-city";
import { ProfileFormData } from "./useProfileForm";

interface ProfileBasicsProps {
  form: ProfileFormData;
  set: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  checkingName: boolean;
  nameError: string;
  checkArtistName: (name: string) => Promise<boolean>;
  copiedEmail: boolean;
  copySupportEmail: () => void;
  initialData: any;
  t: (key: string) => string;
}

export default function ProfileBasics({
  form,
  set,
  checkingName,
  nameError,
  checkArtistName,
  copiedEmail,
  copySupportEmail,
  initialData,
  t,
}: ProfileBasicsProps) {
  return (
    <div className="card space-y-6">
      <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
        {t("basics.title")}
      </h2>

      <div>
        <label className="label" htmlFor="artistName">
          Artist Name *
        </label>
        <input
          id="artistName"
          type="text"
          className={`input ${
            nameError ? "border-red-500 bg-red-500/5" : ""
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder="E.g. MIDNIGHT ECHO"
          value={form.artistName}
          onChange={(e) => set("artistName", e.target.value)}
          onBlur={(e) => checkArtistName(e.target.value)}
          required
          disabled={!!initialData.artistName}
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="country">
            {t("basics.country")}
          </label>
          <select
            id="country"
            className="input"
            value={form.country}
            onChange={(e) => {
              set("country", e.target.value);
              set("state", "");
              set("city", "");
            }}
          >
            <option value="">{t("basics.countryPlaceholder")}</option>
            {Country.getAllCountries().map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="state">
            STATE / REGION (OPTIONAL)
          </label>
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
                State.getStatesOfCountry(form.country)?.map((state) => (
                  <option
                    key={`${state.name}-${state.isoCode}`}
                    value={state.name}
                  >
                    {state.name}
                  </option>
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
          <label className="label" htmlFor="city">
            CITY (OPTIONAL)
          </label>
          <input
            id="city"
            type="text"
            className="input"
            placeholder="e.g. Los Angeles, London, Tokyo..."
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="bio">
          {t("basics.bio")}
          <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">
            {form.bio.length}/500
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
