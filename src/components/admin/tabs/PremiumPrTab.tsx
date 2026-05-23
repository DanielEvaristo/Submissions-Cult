"use client";

import { Loader2, CheckCircle2, XCircle, DollarSign, Briefcase } from "lucide-react";
import { SectionHeader } from "../AdminShared";

interface Props {
  premiumPrRequests: any[];
  premiumPrLoading: boolean;
  processingId: string | null;
  handlePremiumPrAction: (id: string, action: "APPROVE" | "REJECT", type: "SUBMISSION" | "CREATIVE") => void;
}

export default function PremiumPrTab({
  premiumPrRequests,
  premiumPrLoading,
  processingId,
  handlePremiumPrAction,
}: Props) {
  return (
    <div className="space-y-10 animate-reveal">
      <SectionHeader
        icon={Briefcase}
        title="PREMIUM PR & COLLABS"
        subtitle="Manage incoming requests for interviews, articles and collaborations"
      />

      {premiumPrLoading && premiumPrRequests.length === 0 ? (
        <div className="flex items-center gap-4 py-16 text-white">
          <Loader2 size={32} className="animate-spin" />
          <span className="font-black uppercase tracking-widest text-sm">
            LOADING REQUESTS...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              {premiumPrRequests.length} request{premiumPrRequests.length !== 1 ? "s" : ""}
            </p>
          </div>

          {premiumPrRequests.length === 0 ? (
            <div className="border-4 border-white/10 p-16 text-center">
              <Briefcase size={48} className="mx-auto mb-4 text-[#F5E000]" />
              <p className="font-black text-xl uppercase tracking-tighter text-white">
                NO REQUESTS
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">
                No Premium PR or Collaboration requests at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              {premiumPrLoading && (
                <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-[#F5E000]" />
                </div>
              )}
              {premiumPrRequests.map((req) => (
                <div
                  key={req.id}
                  className="border-4 border-white/10 p-6 bg-black flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#F5E000]/30 transition-colors relative z-0"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-lg text-white">
                        {req.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                          req.status === "PAID"
                            ? "bg-[#00FF00]/20 text-[#00FF00]"
                            : req.status === "APPROVED" || req.status === "REQUESTED" || req.status === "PENDING"
                            ? "bg-[#F5E000]/20 text-[#F5E000]"
                            : "bg-[#FF0000]/20 text-[#FF0000]"
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-black uppercase tracking-widest">
                        {req.type}
                      </span>
                    </div>
                    
                    <p className="text-xs font-bold text-white/50">{req.email}</p>
                    
                    <div className="flex flex-wrap gap-4 text-[9px] font-black uppercase tracking-widest text-white/40 mt-2">
                      <span className="text-[#F5E000]">
                        WANTS: {req.requestedServices.join(", ")}
                      </span>
                      {req.instagram && (
                        <a href={req.instagram} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                          INSTAGRAM
                        </a>
                      )}
                      {req.spotifyUrl && (
                        <a href={req.spotifyUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                          SPOTIFY/PORTFOLIO
                        </a>
                      )}
                      <span>
                        {new Date(req.date).toLocaleDateString()}
                      </span>
                      {req.cost !== null && req.cost > 0 && (
                        <span className="text-[#00FF00]">
                          ${(req.cost / 100).toFixed(2)} USD
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 shrink-0">
                    {/* Only show Approve/Reject if it is PENDING or REQUESTED */}
                    {(req.status === "REQUESTED" || req.status === "PENDING") && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePremiumPrAction(req.id, "APPROVE", req.type)}
                          disabled={processingId === req.id || premiumPrLoading}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF00] text-black font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                        >
                          {processingId === req.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          APPROVE
                        </button>
                        <button
                          onClick={() => handlePremiumPrAction(req.id, "REJECT", req.type)}
                          disabled={processingId === req.id || premiumPrLoading}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#FF0000] text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} />
                          REJECT
                        </button>
                      </div>
                    )}

                    {/* Show Payment Link if it's APPROVED and is a SUBMISSION */}
                    {req.status === "APPROVED" && req.type === "SUBMISSION" && req.paymentLink && (
                      <div className="flex items-center gap-2 mt-2 border border-white/20 p-2">
                        <DollarSign size={14} className="text-[#F5E000]" />
                        <a href={req.paymentLink} target="_blank" rel="noreferrer" className="text-[9px] font-black uppercase tracking-widest text-[#F5E000] hover:underline">
                          CHECKOUT LINK
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
