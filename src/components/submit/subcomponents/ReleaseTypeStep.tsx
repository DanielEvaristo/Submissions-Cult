"use client";

import { Music } from "lucide-react";
import type { SubmissionType } from "@/lib/pricing";
import type { FormData } from "../SubmitFlowV2";

interface ReleaseTypeStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export default function ReleaseTypeStep({ form, set }: ReleaseTypeStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { type: "SINGLE", credits: 0, desc: "1 Track" },
          { type: "EP", credits: 1, desc: "2-6 Tracks" },
          { type: "ALBUM", credits: 2, desc: "7+ Tracks" },
        ].map((rt) => (
          <button
            key={rt.type}
            type="button"
            onClick={() => set("submissionType", rt.type as SubmissionType)}
            disabled={form.submissionType !== rt.type && form.autoFilledTitle !== ""}
            className={`p-8 border-4 transition-all flex flex-col items-center justify-center gap-4 ${
              form.submissionType === rt.type
                ? "bg-[#F5E000] text-black border-[#F5E000]"
                : "bg-black text-white border-white/10 hover:border-white/40"
            } ${
              form.submissionType !== rt.type && form.autoFilledTitle !== ""
                ? "opacity-20 cursor-not-allowed"
                : ""
            }`}
          >
            <Music
              size={40}
              className={form.submissionType === rt.type ? "text-black" : "text-white/40"}
            />
            <div className="text-center">
              <p className="text-2xl font-black uppercase tracking-tighter">
                {rt.type}
              </p>
              <p className="text-xs font-bold opacity-60 uppercase">{rt.desc}</p>
              <p className="mt-4 font-sans text-xs font-black px-3 py-1 bg-black/10 inline-block uppercase">
                {rt.credits === 0 ? "FREE" : `+${rt.credits} CREDIT${rt.credits > 1 ? "S" : ""}`}
              </p>
            </div>
          </button>
        ))}
      </div>

      {(form.submissionType === "ALBUM" || form.submissionType === "EP") && (
        <div className="text-center pt-4">
          <button
            onClick={() => {
              set("submissionType", "SINGLE");
              set("streamingUrl", "");
            }}
            className="text-white/40 hover:text-cult-yellow text-[10px] font-black uppercase tracking-[0.2em] underline decoration-2 underline-offset-4 transition-all"
          >
            Send only one song instead
          </button>
        </div>
      )}
    </div>
  );
}
