import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function UnverifiedLock({ locale }: { locale: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-reveal px-8 bg-black">
      <div className="w-24 h-24 bg-black text-[#F5E000] border-4 border-white/10 flex items-center justify-center mb-10 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
        <AlertCircle size={48} strokeWidth={3} />
      </div>
      <h2 className="font-sans text-5xl font-black uppercase tracking-tighter text-white mb-6 leading-none">
        PENDING<br/>VERIFICATION.
      </h2>
      <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 max-w-sm mx-auto mb-12 leading-relaxed">
        YOUR AGENCY ACCOUNT IS UNDER REVIEW. ACCESS TO SUBMISSION TOOLS IS RESTRICTED UNTIL SECURITY CLEARANCE IS GRANTED.
      </p>
      <Link href={`/${locale}/industry/profile`} className="px-12 py-6 bg-[#F5E000] text-black font-sans font-black text-xs uppercase tracking-[0.4em] border-4 border-black hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(245,224,0,0.2)] hover:shadow-none">
        VIEW AGENCY PROFILE
      </Link>
    </div>
  );
}
