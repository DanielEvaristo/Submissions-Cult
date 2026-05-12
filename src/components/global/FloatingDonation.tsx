"use client";

import { useState } from "react";
import { Star, X, Heart } from "lucide-react";

export default function FloatingDonation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[999] w-16 h-16 bg-[#F5E000] border-4 border-black text-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(245,224,0,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
        aria-label="Support Us"
      >
        <Star className="group-hover:rotate-12 transition-transform" size={32} fill="black" />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/80 animate-fade-in">
          <div className="bg-black border-8 border-white/10 w-full max-w-md p-10 relative animate-reveal shadow-[20px_20px_0px_0px_rgba(245,224,0,0.1)]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-[#F5E000] transition-colors"
            >
              <X size={32} strokeWidth={3} />
            </button>

            <div className="text-center">
              <div className="w-20 h-20 bg-black text-[#F5E000] flex items-center justify-center mx-auto mb-8 border-4 border-black">
                <Heart size={40} fill="#F5E000" />
              </div>
              <h2 className="font-sans text-4xl font-black uppercase tracking-tighter text-white mb-4">SUPPORT THE MACHINE.</h2>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-white/60 mb-10 leading-relaxed">
                We are an independent platform dedicated to giving artists a real voice. Your support keeps the gears turning.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[5, 10, 20, 50].map((amount) => (
                  <button
                    key={amount}
                    className="py-4 border-4 border-white/10 text-white font-black text-xl hover:bg-[#F5E000] hover:text-black transition-colors"
                    onClick={() => {
                      // Redirect to donation or open Stripe
                      window.open(`https://ko-fi.com/cultmachine`, '_blank');
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <button
                className="w-full py-5 bg-[#F5E000] text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all border-4 border-black shadow-[8px_8px_0px_0px_rgba(245,224,0,0.2)] hover:shadow-none"
                onClick={() => window.open(`https://ko-fi.com/cultmachine`, '_blank')}
              >
                CUSTOM AMOUNT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
