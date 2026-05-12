"use client";

interface GatingWrapperProps {
  children: React.ReactNode;
  isComplete: boolean;
  locale: string;
}

export default function PortalGating({ children, isComplete, locale }: GatingWrapperProps) {
  return (
    <div className="space-y-6">
      {!isComplete && (
        <div className="border-2 border-[#F5E000] bg-[#F5E000]/10 p-4 lg:p-5 text-white flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5E000] mb-2">Profile Reminder</p>
            <p className="text-sm font-bold uppercase tracking-[0.12em]">
              Complete your profile to unlock all artist tools.
            </p>
          </div>
          <a
            href={`/${locale}/portal/onboarding`}
            className="inline-flex items-center justify-center px-5 py-3 bg-[#F5E000] text-black text-[10px] font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
          >
            Complete Profile
          </a>
        </div>
      )}
      {children}
    </div>
  );
}
