import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full border-4 border-white/10 p-10 animate-reveal">
        <div className="w-20 h-20 bg-[#F5E000] text-black flex items-center justify-center mx-auto mb-8 border-4 border-black">
          <AlertTriangle size={40} strokeWidth={3} />
        </div>
        
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">
          ERROR 404
        </span>
        
        <h1 className="font-sans text-5xl font-black tracking-tighter uppercase leading-none mb-6">
          PAGE NOT <br /> FOUND
        </h1>
        
        <p className="font-sans text-sm text-white/60 mb-10 leading-relaxed">
          The page you are looking for does not exist or requires an active account to be accessed.
        </p>

        <Link
          href="/"
          className="w-full py-5 bg-[#F5E000] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all flex items-center justify-center border-2 border-transparent hover:border-black"
        >
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
