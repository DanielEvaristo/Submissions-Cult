"use client";

import type { FormData, ManagedArtistRef } from "../SubmitFlowV2";

interface SelectArtistStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  managedArtists: ManagedArtistRef[];
}

export default function SelectArtistStep({
  form,
  set,
  managedArtists,
}: SelectArtistStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="border-4 border-white/10 p-8 bg-black text-white">
        <label className="label" htmlFor="managedArtistId">
          SELECT ARTIST FROM ROSTER
        </label>
        <select
          id="managedArtistId"
          className="input text-lg font-bold mt-2"
          value={form.managedArtistId}
          onChange={(e) => {
            set("managedArtistId", e.target.value);
            const selected = managedArtists.find((a) => a.id === e.target.value);
            if (selected) set("artistName", selected.artistName);
          }}
        >
          <option value="">— CHOOSE ARTIST —</option>
          {managedArtists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.artistName.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
