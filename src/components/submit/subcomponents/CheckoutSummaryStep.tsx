"use client";

import type { FormData } from "../SubmitFlowV2";
import type { CreditBreakdown } from "@/lib/pricing";
import { CreditCard, Wallet } from "lucide-react";

interface CheckoutSummaryStepProps {
  form: FormData;
  credits: CreditBreakdown;
  retentionDiscountApplied: boolean;
  totalCreditsNeeded: number;
  canPayWithCredits: boolean;
  currentCredits: number;
  basePriceUsd: number;
  discountedPriceUsd: number;
}

export default function CheckoutSummaryStep({
  form,
  credits,
  retentionDiscountApplied,
  totalCreditsNeeded,
  canPayWithCredits,
  currentCredits,
  basePriceUsd,
  discountedPriceUsd,
}: CheckoutSummaryStepProps) {
  return (
    <div className="animate-reveal border-4 border-white/10 p-8 bg-black/50">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b-2 border-white/10 pb-4">
        ORDER SUMMARY
      </h2>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <span className="font-bold text-sm uppercase opacity-70">
            TRACK TYPE ({form.submissionType})
          </span>
          <span className="font-black">
            {credits.base > 0 ? `${credits.base} CRD` : "FREE"}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <span className="font-bold text-sm uppercase opacity-70">
            CHANNELS ({form.applyAllChannels ? "ALL" : "SINGLE"})
          </span>
          <span className="font-black">
            {credits.channels > 0 ? `+${credits.channels} CRD` : "FREE"}
          </span>
        </div>

        {form.fastTrack && (
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="font-bold text-sm uppercase opacity-70">FAST TRACK</span>
            <span className="font-black">+1 CRD</span>
          </div>
        )}

        {form.reviewRequested && (
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="font-bold text-sm uppercase opacity-70">A&R REVIEW</span>
            <span className="font-black">+1 CRD</span>
          </div>
        )}

        {form.premiumServices.map((s) => (
          <div
            key={s}
            className="flex justify-between items-center border-b border-white/5 pb-4"
          >
            <span className="font-bold text-sm uppercase opacity-70">
              {s} SERVICE
            </span>
            <span className="font-black text-[#F5E000]">PAY IF ACCEPTED</span>
          </div>
        ))}
      </div>

      {/* ── TOTAL BLOCK ── */}
      <div className="flex items-center p-6 bg-white/5 border-2 border-white/10 mb-8">
        <div className="flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
            FINAL TOTAL — {totalCreditsNeeded} CREDIT{totalCreditsNeeded !== 1 ? "S" : ""}
          </p>

          {/* Paying with wallet credits */}
          {canPayWithCredits ? (
            <div className="flex items-center gap-3 mt-2">
              <Wallet size={18} className="text-[#00CC66] shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#00CC66] mb-1">
                  PAYING WITH YOUR CREDIT WALLET ({currentCredits} available)
                </p>
                <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                  {totalCreditsNeeded} CREDITS
                </h3>
                <p className="text-xs font-bold text-white/40 mt-1">
                  {currentCredits - totalCreditsNeeded} credits will remain after submission
                </p>
              </div>
            </div>
          ) : (
            /* Paying via Stripe */
            <div className="flex items-center gap-3 mt-2">
              <CreditCard size={18} className="text-[#F5E000] shrink-0" />
              <div>
                {retentionDiscountApplied ? (
                  <>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5E000] mb-2">
                      EXIT OFFER APPLIED: 50% OFF
                    </p>
                    <div className="flex items-baseline gap-3">
                      <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                        ${discountedPriceUsd.toFixed(2)}
                      </h3>
                      <span className="text-lg font-black text-white/30 line-through">
                        ${basePriceUsd.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs font-black text-[#00CC66] mt-1">
                      YOU SAVE ${(basePriceUsd - discountedPriceUsd).toFixed(2)}
                    </p>
                  </>
                ) : (
                  <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                    ${basePriceUsd.toFixed(2)}
                  </h3>
                )}
                <p className="text-[10px] font-bold text-white/30 mt-2 uppercase tracking-widest">
                  USD · Charged via Stripe
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment method icons — only shown for Stripe path */}
      {!canPayWithCredits && (
        <div className="p-6 border-4 border-dashed border-white/10 bg-black/20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">
            PAYMENT METHOD
          </p>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">
              VISA
            </div>
            <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">
              MASTERCARD
            </div>
            <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">
              AMEX
            </div>
            <div className="ml-auto text-[10px] font-bold text-white/20 uppercase tracking-widest">
              SECURE BY STRIPE
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
