"use client";

import { Zap, Edit3 } from "lucide-react";
import type { FormData } from "../SubmitFlowV2";

interface UpsellsStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  handleNext: () => void;
}

export default function UpsellsStep({
  form,
  set,
  handleNext,
}: UpsellsStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => set("fastTrack", !form.fastTrack)}
          className={`p-8 border-4 text-left transition-all ${
            form.fastTrack
              ? "bg-[#FF0000] text-white border-[#FF0000]"
              : "bg-black text-white border-white/10"
          }`}
        >
          <Zap size={32} className="mb-4" />
          <p className="text-2xl font-black uppercase tracking-tighter">
            FAST TRACK 48H
          </p>
          <p className="text-xs font-bold opacity-60 mt-2">
            Skip the queue. Guaranteed response.
          </p>
          <p className="mt-6 font-black text-xs px-3 py-1 bg-white/20 inline-block uppercase">
            +1 CREDIT
          </p>
        </button>

        <button
          onClick={() => set("reviewRequested", !form.reviewRequested)}
          className={`p-8 border-4 text-left transition-all ${
            form.reviewRequested
              ? "bg-[#F5E000] text-black border-[#F5E000]"
              : "bg-black text-white border-white/10"
          }`}
        >
          <Edit3 size={32} className="mb-4" />
          <p className="text-2xl font-black uppercase tracking-tighter">
            DETAILED REVIEW
          </p>
          <p className="text-xs font-bold opacity-60 mt-2">
            Get written feedback from our A&R.
          </p>
          <p className="mt-6 font-black text-xs px-3 py-1 bg-black/20 inline-block uppercase">
            +1 CREDIT
          </p>
        </button>
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={() => {
            set("fastTrack", false);
            set("reviewRequested", false);
            handleNext();
          }}
          className="text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white underline decoration-white/30 hover:decoration-white transition-all p-4"
        >
          CONTINUE WITHOUT EXTRAS
        </button>
      </div>
    </div>
  );
}
