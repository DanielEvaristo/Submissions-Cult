"use client";

import React from "react";
import { CheckCircle2, Zap, Mic, FileText } from "lucide-react";
import type { PremiumService } from "@/lib/pricing";
import type { FormData } from "../SubmitFlowV2";

interface PremiumServicesStepProps {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function PremiumServicesStep({
  form,
  setForm,
}: PremiumServicesStepProps) {
  return (
    <div className="space-y-8 animate-reveal">
      <div className="p-4 bg-white/5 border border-white/10 mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="text-[#00FF00]" />
          <span className="text-xs font-bold uppercase tracking-widest text-white/60">
            YOUR TRACK IS ELIGIBLE FOR PREMIUM PR
          </span>
        </div>
        <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">
          Note: This is a request. Cult Machine does not charge payola. The cost
          covers the labor time to write, edit, and publish the piece. You will only
          pay if your request is approved.
        </p>
      </div>

      <div className="mb-8 p-6 border-2 border-[#F5E000]/50 bg-[#F5E000]/10 text-[#F5E000]">
        <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
          <Zap size={16} /> NO UPFRONT PAYMENT REQUIRED
        </p>
        <p className="text-[10px] font-bold uppercase tracking-widest mt-2 leading-relaxed text-[#F5E000]/80">
          If you select an Interview or Article, you will not be charged today. If
          your track is accepted by our Master Curator for these premium features,
          you will receive a notification and a payment link in your artist portal
          to proceed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <button
          onClick={() => {
            setForm((prev) => {
              const has = prev.premiumServices.includes("INTERVIEW");
              const arr: PremiumService[] = has
                ? prev.premiumServices.filter(
                    (s): s is PremiumService => s !== "INTERVIEW"
                  )
                : [...prev.premiumServices, "INTERVIEW"];
              return { ...prev, premiumServices: arr };
            });
          }}
          className={`p-8 border-4 text-left transition-all ${
            form.premiumServices.includes("INTERVIEW")
              ? "bg-[#F5E000] text-black border-[#F5E000]"
              : "bg-black text-white border-white/10 hover:border-white/40"
          }`}
        >
          <Mic size={32} className="mb-4" />
          <p className="text-2xl font-black uppercase tracking-tighter">
            EXCLUSIVE INTERVIEW
          </p>
          <p className="text-xs font-bold opacity-60 mt-2">
            Full Q&A published on Cult Machine.
          </p>
          <p className="mt-6 font-black text-xs px-3 py-1 bg-black/10 inline-block uppercase">
            $30 USD (PAY IF ACCEPTED)
          </p>
        </button>

        <button
          onClick={() => {
            setForm((prev) => {
              const has = prev.premiumServices.includes("ARTICLE");
              const arr: PremiumService[] = has
                ? prev.premiumServices.filter(
                    (s): s is PremiumService => s !== "ARTICLE"
                  )
                : [...prev.premiumServices, "ARTICLE"];
              return { ...prev, premiumServices: arr };
            });
          }}
          className={`p-8 border-4 text-left transition-all ${
            form.premiumServices.includes("ARTICLE")
              ? "bg-[#F5E000] text-black border-[#F5E000]"
              : "bg-black text-white border-white/10 hover:border-white/40"
          }`}
        >
          <FileText size={32} className="mb-4" />
          <p className="text-2xl font-black uppercase tracking-tighter">
            DEDICATED ARTICLE
          </p>
          <p className="text-xs font-bold opacity-60 mt-2">
            Professional editorial review.
          </p>
          <p className="mt-6 font-black text-xs px-3 py-1 bg-black/10 inline-block uppercase">
            $25 USD (PAY IF ACCEPTED)
          </p>
        </button>
      </div>
    </div>
  );
}
