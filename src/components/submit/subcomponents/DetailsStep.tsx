"use client";

import { AlertCircle } from "lucide-react";
import { GENRES } from "@/lib/genres";
import type { FormData } from "../SubmitFlowV2";

interface DetailsStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  fetchingInfo: boolean;
  handleAutoFill: () => void;
  artistNameLocked: boolean;
  artistMetadataMismatch: boolean;
  registeredArtistName: string;
}

export default function DetailsStep({
  form,
  set,
  session,
  fetchingInfo,
  handleAutoFill,
  artistNameLocked,
  artistMetadataMismatch,
  registeredArtistName,
}: DetailsStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      {/* AI Warning */}
      <div className="p-4 border-2 border-[#FF0000] bg-[#FF0000]/10 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.2)]">
        <AlertCircle size={24} className="text-[#FF0000] shrink-0 mt-1" strokeWidth={3} />
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-[#FF0000] mb-1">
            NO AI MUSIC
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 leading-relaxed">
            WE DO NOT SUPPORT AI-GENERATED ART. ANY TRACK WITH AI PRODUCTION OR AI COVER ART WILL BE IMMEDIATELY REJECTED.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="label">STREAMING URL (SONG OR RELEASE ONLY)</label>
            <input
              type="url"
              className="input"
              placeholder="Paste a song, single, EP, or album link..."
              value={form.streamingUrl}
              onChange={(e) => {
                const url = e.target.value;
                set("streamingUrl", url);

                // Simple URL based auto-detection (refined by API onBlur)
                if (url.includes("/album/") || url.includes("/sets/")) {
                  set("submissionType", "ALBUM");
                } else if (url.includes("/track/")) {
                  set("submissionType", "SINGLE");
                }
              }}
              onBlur={handleAutoFill}
            />
            {fetchingInfo && (
              <p className="text-[10px] font-bold text-cult-yellow animate-pulse mt-2 uppercase tracking-widest text-right">
                FETCHING METADATA...
              </p>
            )}

            {(form.submissionType === "ALBUM" || form.submissionType === "EP") && (
              <div className="mt-4 p-4 border-2 border-cult-yellow/20 bg-cult-yellow/5 animate-reveal">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-cult-yellow uppercase tracking-tight">
                    {form.submissionType} DETECTED (+
                    {form.submissionType === "ALBUM" ? 2 : 1} CREDITS)
                  </p>
                  <button
                    onClick={() => {
                      set("streamingUrl", "");
                      set("trackTitle", "");
                      set("artistName", "");
                      set("submissionType", "SINGLE");
                    }}
                    className="text-[10px] font-black text-[#00FF00] underline uppercase tracking-widest hover:text-white transition-colors"
                  >
                    I want to keep it free, send one song instead
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {form.autoFilledCover && (
          <div className="flex items-center gap-6 p-6 border-4 border-black bg-black text-white">
            <img
              src={form.autoFilledCover}
              alt="cover"
              className="w-24 h-24 object-cover border-2 border-white"
            />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cult-yellow mb-1">
                FOUND METADATA
              </p>
              <p className="text-2xl font-black uppercase tracking-tighter leading-none">
                {form.autoFilledTitle}
              </p>
              <p className="text-sm font-light text-[#999999] mt-2 italic">
                {form.autoFilledArtist}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!session && (
            <div>
              <label className="label">YOUR EMAIL</label>
              <input
                type="email"
                className="input"
                placeholder="To receive updates..."
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="label">TRACK TITLE</label>
            <input
              type="text"
              className="input"
              value={form.trackTitle}
              onChange={(e) => set("trackTitle", e.target.value)}
            />
          </div>
          <div>
            <label className="label">ARTIST NAME</label>
            <input
              type="text"
              className="input disabled:opacity-70 disabled:cursor-not-allowed"
              value={form.artistName}
              onChange={(e) => set("artistName", e.target.value)}
              readOnly={artistNameLocked}
              disabled={artistNameLocked}
            />
            {artistNameLocked && (
              <div className="mt-3 p-3 border-2 border-cult-yellow/20 bg-cult-yellow/5 flex items-start gap-3 animate-reveal">
                <AlertCircle size={16} className="text-cult-yellow shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cult-yellow leading-relaxed">
                  This submission uses your registered artist name: <span className="text-white">&quot;{registeredArtistName}&quot;</span>.
                </p>
              </div>
            )}
            {artistMetadataMismatch && (
              <div className="mt-3 p-3 border-2 border-[#FF0000] bg-[#FF0000]/10 flex items-start gap-3 animate-reveal">
                <AlertCircle size={16} className="text-[#FF0000] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0000] leading-relaxed">
                  The streaming link appears to belong to a different artist. We only allow your own releases, but collaborations are accepted when <span className="text-white">&quot;{registeredArtistName}&quot;</span> is part of the credited artists.
                </p>
              </div>
            )}
          </div>

          {(!session || !session.user?.instagram) && (
            <div>
              <label className="label">INSTAGRAM USERNAME</label>
              <input
                type="text"
                className="input"
                placeholder="@yourhandle"
                value={form.instagram}
                onChange={(e) => set("instagram", e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <label className="label">MAIN GENRE</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  set("genre", g);
                  set("subgenre", "");
                }}
                className={`py-3 border-2 border-white/10 text-center font-black uppercase text-[10px] transition-all ${
                  form.genre === g
                    ? "bg-[#F5E000] text-black border-[#F5E000]"
                    : "bg-black text-white hover:bg-white/5"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {form.genre && (
          <div>
            <label className="label">SUBGENRE *</label>
            <input
              type="text"
              className="input animate-fade-in"
              placeholder="e.g. Melodic Techno, Lo-Fi..."
              value={form.subgenre}
              onChange={(e) => set("subgenre", e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
