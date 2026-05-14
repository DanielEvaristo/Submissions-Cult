"use client";

import { ArrowRight, AlertTriangle } from "lucide-react";

interface GatingWrapperProps {
  children: React.ReactNode;
  isComplete: boolean;
  hasPaidActivity: boolean;
  locale: string;
}

/**
 * PortalGating wraps the portal layout.
 *
 * Behaviour:
 * - Profile COMPLETE → render children normally (no banner).
 * - Profile INCOMPLETE + paid activity → render children + persistent yellow banner.
 * - Profile INCOMPLETE + no paid activity → render children (submissions page handles its own blur).
 */
export default function PortalGating({
  children,
  isComplete,
  hasPaidActivity,
  locale,
}: GatingWrapperProps) {
  const showPersistentBanner = !isComplete && hasPaidActivity;

  return (
    <div className="space-y-0">
      {showPersistentBanner && (
        <div className="w-full bg-[#F5E000] border-b-4 border-black px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 z-50 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <AlertTriangle size={20} strokeWidth={3} className="text-black shrink-0" />
            <div>
              <p className="font-bold text-xs tracking-tight text-black">
                Profile Incomplete
              </p>
              <p className="font-medium text-xs text-black/70 mt-0.5">
                Complete your profile to unlock all artist tools.
              </p>
            </div>
          </div>
          <a
            href={`/${locale}/portal/onboarding`}
            className="shrink-0 inline-flex items-center justify-center gap-3 px-6 py-3 bg-black text-[#F5E000] text-xs font-bold hover:bg-white hover:text-black transition-all border-2 border-black"
          >
            Complete Profile <ArrowRight size={14} strokeWidth={2} />
          </a>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
