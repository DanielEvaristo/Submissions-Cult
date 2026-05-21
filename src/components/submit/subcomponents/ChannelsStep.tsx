"use client";

import { CheckCircle2 } from "lucide-react";
import type { Channel } from "@/lib/pricing";
import type { FormData } from "../SubmitFlowV2";

interface ChannelsStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export default function ChannelsStep({ form, set }: ChannelsStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[
          { id: "RADAR", label: "CULT RADAR" },
          { id: "INTERNET_WAVE", label: "INTERNET WAVE" },
          { id: "SPOTIFY_PLAYLIST", label: "SPOTIFY PLAYLISTS" },
          { id: "STORIES", label: "IG/TIKTOK STORIES" },
        ].map((c) => {
          const isActive =
            form.channels.includes(c.id as Channel) || form.applyAllChannels;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                if (form.applyAllChannels) return;
                // If free, toggle one.
                set(
                  "channels",
                  form.channels.includes(c.id as Channel) ? [] : [c.id as Channel]
                );
              }}
              className={`p-6 border-4 flex justify-between items-center transition-all ${
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-black text-white border-white/10 hover:border-white/30"
              }`}
            >
              <span className="text-lg font-black uppercase tracking-widest">
                {c.label}
              </span>
              {isActive && <CheckCircle2 size={24} />}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => set("applyAllChannels", !form.applyAllChannels)}
        className={`w-full p-6 border-4 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between ${
          form.applyAllChannels
            ? "bg-[#00FF00] text-black border-[#00FF00]"
            : "bg-black text-white border-white/10 hover:border-white"
        }`}
      >
        <span>APPLY TO ALL CHANNELS</span>
        <span className="bg-black/20 px-4 py-2 text-xs">+1 CREDIT</span>
      </button>
    </div>
  );
}
