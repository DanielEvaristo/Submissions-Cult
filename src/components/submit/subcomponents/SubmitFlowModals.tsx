"use client";

import React from "react";
import { Heart, Zap, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SubmitFlowModalsProps {
  showExitIntent: boolean;
  canShowRetentionOffer: boolean;
  handleApplyRetentionDiscount: () => void;
  handleSwitchToFreeSong: () => void;
  handleConfirmedExit: () => void;

  showDonationPrompt: boolean;
  setShowDonationPrompt: React.Dispatch<React.SetStateAction<boolean>>;
  setIncludeDonation: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  session: any;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit: (forceResubmitOverride?: boolean) => Promise<void>;

  showActiveBlockModal: boolean;
  setShowActiveBlockModal: React.Dispatch<React.SetStateAction<boolean>>;
  locale: string;

  showRejectedConfirm: boolean;
  setShowRejectedConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  setForceResubmit: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SubmitFlowModals({
  showExitIntent,
  canShowRetentionOffer,
  handleApplyRetentionDiscount,
  handleSwitchToFreeSong,
  handleConfirmedExit,

  showDonationPrompt,
  setShowDonationPrompt,
  setIncludeDonation,
  session,
  setStep,
  handleSubmit,

  showActiveBlockModal,
  setShowActiveBlockModal,
  locale,

  showRejectedConfirm,
  setShowRejectedConfirm,
  setForceResubmit,
}: SubmitFlowModalsProps) {
  const router = useRouter();

  return (
    <>
      {/* ── EXIT INTENT MODAL ── */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#F5E000] p-8 max-w-xl w-full shadow-[16px_16px_0px_0px_rgba(245,224,0,0.12)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5E000] mb-4">
              Exit Offer
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              Before you leave, keep these credits at 50% off.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/70 leading-relaxed mb-8">
              Before leaving, we can keep the credits you are using for this
              submission at a 50% discount. Or switch this flow to one free song
              and keep moving.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {canShowRetentionOffer ? (
                <button
                  onClick={handleApplyRetentionDiscount}
                  className="w-full p-4 bg-[#F5E000] text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
                >
                  Apply 50% Discount
                </button>
              ) : (
                <div className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.2em] text-center">
                  50% discount already used in the last 30 days.
                </div>
              )}
              <button
                onClick={handleSwitchToFreeSong}
                className="w-full p-4 border-2 border-[#F5E000] text-[#F5E000] text-xs font-black uppercase tracking-[0.25em] hover:bg-[#F5E000] hover:text-black transition-all"
              >
                Send One Song For Free
              </button>
              <button
                onClick={handleConfirmedExit}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DONATION PROMPT MODAL ── */}
      {showDonationPrompt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-white/10 p-8 max-w-lg w-full">
            <Heart size={48} className="text-[#FF0000] mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">
              SUPPORT THE CULT
            </h2>
            <p className="text-sm font-bold opacity-60 mb-8 leading-relaxed">
              We process hundreds of submissions for free. If you appreciate the
              platform, consider dropping a small tip so we can keep the lights
              on.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowDonationPrompt(false);
                  setIncludeDonation(true);
                  if (session) {
                    void handleSubmit();
                  } else {
                    setStep(10);
                  }
                }}
                className="w-full btn-primary bg-[#00FF00] text-black border-[#00FF00]"
              >
                DONATE $5
              </button>
              <button
                onClick={() => {
                  setShowDonationPrompt(false);
                  setIncludeDonation(false);
                  if (session) {
                    void handleSubmit();
                  } else {
                    setStep(10);
                  }
                }}
                className="w-full p-4 border-2 border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/40"
              >
                CONTINUE FOR FREE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE TRACK BLOCK MODAL ── */}
      {showActiveBlockModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#F5E000] p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(245,224,0,0.12)]">
            <div className="w-16 h-16 bg-[#F5E000] flex items-center justify-center mb-6">
              <Zap size={32} className="text-black" strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5E000] mb-4">
              Submission Active
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              This track is already under review.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/60 leading-relaxed mb-8">
              You already have an active submission for this track. You can't submit
              it again until the current review process is complete. Check your
              submissions to see its current status.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowActiveBlockModal(false);
                  router.push(`/${locale}/portal/submissions`);
                }}
                className="w-full p-4 bg-[#F5E000] text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
              >
                View My Submissions
              </button>
              <button
                onClick={() => setShowActiveBlockModal(false)}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTED TRACK CONFIRMATION MODAL ── */}
      {showRejectedConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#FF0000] p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(255,0,0,0.12)]">
            <AlertCircle size={48} className="text-[#FF0000] mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF0000] mb-4">
              Previously Rejected
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              This track has been previously rejected.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/60 leading-relaxed mb-8">
              Are you sure you want to submit it again? Our curators will review it
              with the same criteria as before. Make sure something has changed
              (mix, master, pitch, etc.) before resubmitting.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setShowRejectedConfirm(false);
                  setForceResubmit(true);
                  void handleSubmit(true);
                }}
                className="w-full p-4 bg-[#FF0000] text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all"
              >
                Yes, Submit Anyway
              </button>
              <button
                onClick={() => setShowRejectedConfirm(false)}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
