"use client";

import { Zap, X } from "lucide-react";

interface PremiumPRUnlockedModalProps {
  showUnlocked: boolean;
  setShowUnlocked: (val: boolean) => void;
}

export default function PremiumPRUnlockedModal({
  showUnlocked,
  setShowUnlocked,
}: PremiumPRUnlockedModalProps) {
  if (!showUnlocked) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-reveal">
      <div className="bg-black border-4 border-[#00FF00] p-10 max-w-xl w-full text-center relative">
        <button
          onClick={() => setShowUnlocked(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          <X size={24} />
        </button>
        <div className="w-20 h-20 bg-[#00FF00] mx-auto mb-8 flex items-center justify-center">
          <Zap size={40} className="text-black" />
        </div>
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">
          PREMIUM PR UNLOCKED
        </h2>
        <p className="text-sm font-bold opacity-60 mb-10 leading-relaxed uppercase tracking-widest">
          Your numbers meet our editorial standards. You can now request Interviews and Articles in
          your next submission.
        </p>
        <button
          onClick={() => setShowUnlocked(false)}
          className="btn-primary w-full bg-[#00FF00] text-black border-[#00FF00]"
        >
          GOT IT
        </button>
      </div>
    </div>
  );
}
