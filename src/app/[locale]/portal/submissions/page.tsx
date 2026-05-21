"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Loader2, Music, ExternalLink, Lock, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";

type Status =
  | "PENDING"
  | "IN_REVIEW"
  | "CURATOR_APPROVED"
  | "CURATOR_REJECTED"
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "PUBLISHED";

interface Submission {
  id: string;
  trackTitle: string;
  artistName: string;
  opportunity: string;
  status: Status;
  releaseType: string;
  genres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  submittedAt: string;
  placement: string | null;
  publicationUrl: string | null;
  interviewUrl: string | null;
  articleUrl: string | null;
  publishedAt: string | null;
  masterNotes: string | null;
  masterRating: number | null;
  curatorNotes: string | null;
  curatorRating: number | null;
  assignedPremiumServices: string[];
  premiumServicesPaid: boolean;
  premiumPrStatus?: string | null;
}

const FILTER_OPTIONS = ["ALL", "UNDER_REVIEW", "SELECTED", "NOT_SELECTED"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

export default function SubmissionsPage() {
  const t = useTranslations("submissions");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const { data: session } = useSession();
  // Profile is complete when the user has provided all mandatory fields
  const isProfileIncomplete = session?.user?.accountType === "ARTIST" && 
    (!session?.user?.country || !session?.user?.monthlyListeners || !session?.user?.instagramFollowers);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [hasPaidActivity, setHasPaidActivity] = useState(false);
  const [isEmailGracePeriodExpired, setIsEmailGracePeriodExpired] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);
  const [payLoading, setPayLoading] = useState<string | null>(null);

  const handlePayPremium = async (submissionId: string) => {
    setPayLoading(submissionId);
    try {
      const res = await fetch("/api/checkout/premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to initiate payment");
    } finally {
      setPayLoading(null);
    }
  };

  useEffect(() => {
    const fetchAccess = async () => {
      try {
        const res = await fetch("/api/user/access");
        if (res.ok) {
          const data = (await res.json()) as { hasPaidActivity: boolean; isEmailGracePeriodExpired: boolean };
          setHasPaidActivity(data.hasPaidActivity);
          setIsEmailGracePeriodExpired(data.isEmailGracePeriodExpired);
        }
      } finally {
        setAccessLoading(false);
      }
    };

    fetchAccess();
  }, []);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const url =
          filter === "ALL"
            ? "/api/submissions"
            : `/api/submissions?status=${filter}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = (await res.json()) as Submission[];
          setSubmissions(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [filter]);

  const handlePremiumPayment = async (submissionId: string) => {
    try {
      const res = await fetch("/api/checkout/premium-pr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } else {
        alert("Payment failed to initialize");
      }
    } catch (err) {
      console.error(err);
      alert("Error initializing payment");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "es" ? "es-MX" : locale === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusLabel = (s: Status): string => {
    if (s === "PENDING" || s === "IN_REVIEW" || s === "CURATOR_APPROVED" || s === "MASTER_REVIEW") {
      return tStatus("underReview");
    }
    if (s === "ACCEPTED") return "ACCEPTED — PENDING PUBLICATION";
    if (s === "PUBLISHED") return tStatus("selected");
    return tStatus("notSelected");
  };

  const hasSubmissions = submissions.length > 0;
  // CASE 1: Free user, profile incomplete → lock tracker (blur)
  // CASE 3: Email not verified after 3 days → lock tracker (blur)
  const shouldLockTracker = (isProfileIncomplete && !hasPaidActivity) || isEmailGracePeriodExpired;
  // CASE 2: Paid user, profile incomplete → show persistent reminder (handled by PortalGating in layout)
  // No need to show additional reminder here — PortalGating banner covers it.

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-12 animate-reveal">
      <div className="border-b-4 border-white/10 pb-8 mb-12 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">MY WORKSPACE</span>
          <h1 className="font-sans text-6xl font-black text-white tracking-tighter uppercase leading-none">
            TRACK<br/>HISTORY
          </h1>
        </div>
        <Link
          href={`/${locale}/portal/submit`}
          className="bg-black text-white px-8 py-4 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-[#F5E000] hover:text-black transition-all border-2 border-white/10"
          id="new-submission-btn"
        >
          + SUBMIT NEW
        </Link>
      </div>


      <div className="flex items-center gap-0 border-4 border-white/10 bg-black p-1 w-fit">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`font-sans text-[10px] font-black uppercase tracking-widest px-6 py-3 transition-all ${
              filter === f
                ? "bg-[#F5E000] text-black"
                : "bg-black text-white hover:bg-white/10"
            }`}
          >
            {f === "ALL"
              ? t("filters.all")
              : f === "UNDER_REVIEW"
              ? t("filters.underReview")
              : f === "SELECTED"
              ? t("filters.selected")
              : t("filters.notSelected")}
          </button>
        ))}
      </div>

      {(loading || accessLoading) && (
        <div className="flex items-center justify-center py-20 text-[#F5E000]">
          <Loader2 size={32} className="animate-spin" strokeWidth={3} />
        </div>
      )}

      {!loading && !accessLoading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 border-4 border-white/10 border-dashed bg-black">
          <Music size={64} className="text-white/5 mb-8" strokeWidth={3} />
          <p className="font-sans text-xl font-black uppercase tracking-tighter text-white/20 mb-8">{t("empty")}</p>
          <Link href={`/${locale}/portal/submit`} className="bg-[#F5E000] text-black px-12 py-6 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all">
            {t("submitFirst")}
          </Link>
        </div>
      )}

      {!loading && !accessLoading && submissions.length > 0 && (
        <div className="relative">
          {shouldLockTracker && (
            <div className="absolute inset-0 z-10 flex items-center justify-center p-10 bg-black/60 backdrop-blur-[6px]">
              <div className="bg-black text-white p-10 border-8 border-[#F5E000] max-w-lg text-center shadow-[20px_20px_0px_0px_rgba(245,224,0,0.1)] animate-reveal">
                <div className="w-20 h-20 bg-[#F5E000] text-black flex items-center justify-center mx-auto mb-8 border-4 border-black">
                  <Lock size={40} strokeWidth={3} />
                </div>
                <p className="font-bold text-xs tracking-wider text-[#F5E000] mb-3">
                  Track Status Locked
                </p>
                <h2 className="font-sans text-3xl font-bold tracking-tight mb-4 text-white">
                  {isEmailGracePeriodExpired
                    ? "Please verify your email to unlock tracking."
                    : "To view the status of your track, please complete your profile."}
                </h2>
                <p className="font-sans text-sm text-white/60 mb-10 leading-relaxed">
                  {isEmailGracePeriodExpired
                    ? "Your 3-day grace period has expired. Please check your inbox for the verification link."
                    : "We need a bit more information about you to activate tracking for your submissions."}
                </p>
                <Link
                  href={`/${locale}/portal/${isEmailGracePeriodExpired ? "profile" : "onboarding"}`}
                  className="w-full py-5 bg-[#F5E000] text-black font-bold text-sm hover:bg-white transition-all flex items-center justify-center gap-4"
                >
                  GO TO PROFILE <ArrowRight size={18} strokeWidth={2} />
                </Link>
              </div>
            </div>
          )}

          <div className={`border-4 border-white/10 bg-black transition-all duration-700 ${shouldLockTracker ? "blur-md select-none pointer-events-none" : ""}`}>
            <div className="hidden sm:grid grid-cols-[100px_1fr_200px_200px] gap-8 px-10 py-6 bg-black text-white items-center border-b-2 border-white/5">
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">COVER</span>
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">{t("columns.track")}</span>
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center">{t("columns.status")}</span>
              <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-right">{t("columns.date")}</span>
            </div>

            <div className="divide-y-2 divide-black/5">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="grid grid-cols-1 sm:grid-cols-[100px_1fr_200px_200px] gap-8 items-center px-10 py-10 hover:bg-white/5 transition-all group"
                >
                  <div className="w-20 h-20 bg-black border-2 border-white/10 shadow-[4px_4px_0px_0px_rgba(245,224,0,0.1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all overflow-hidden flex items-center justify-center">
                    {sub.autoFilledCover ? (
                      <img
                        src={sub.autoFilledCover}
                        alt={sub.trackTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Music size={24} className="text-[#F5E000]" strokeWidth={3} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-sans text-2xl font-black uppercase tracking-tighter text-white truncate mb-1">
                      {sub.trackTitle}
                    </p>
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40">
                      {sub.artistName} · {sub.genres[0] ?? "GENRE"} · {sub.opportunity ? sub.opportunity.replace(/_/g, " ") : "GENERAL SUBMISSION"}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className={`px-4 py-2 border-2 font-sans text-[10px] font-black uppercase tracking-widest ${
                      sub.status === "PUBLISHED" ? "bg-[#00CC66] text-black border-[#00CC66]" :
                      sub.status === "ACCEPTED" ? "bg-[#F5E000] text-black border-black" :
                      sub.status === "REJECTED" || sub.status === "CURATOR_REJECTED" ? "bg-[#FF0000] text-white border-[#FF0000]" :
                      "bg-black text-white border-white/10"
                    }`}>
                      {statusLabel(sub.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-4 flex-wrap">
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      {(sub.status === "ACCEPTED" || sub.status === "PUBLISHED") && sub.placement && (
                        <span className="font-sans text-[9px] font-black uppercase tracking-widest text-[#F5E000] border border-[#F5E000]/30 px-2 py-1 text-center">
                          {sub.placement}
                        </span>
                      )}
                      
                      {/* Premium PR Status UI */}
                      {sub.premiumPrStatus && sub.premiumPrStatus !== "NONE" && (
                        <div className="flex flex-col items-end gap-1 mt-2">
                          <span className="font-sans text-[9px] font-black uppercase tracking-widest text-white/50">
                            PR REQUEST: <span className={
                              sub.premiumPrStatus === "APPROVED" ? "text-[#F5E000]" :
                              sub.premiumPrStatus === "PAID" ? "text-[#00CC66]" :
                              sub.premiumPrStatus === "REJECTED" ? "text-red-500" :
                              "text-white"
                            }>{sub.premiumPrStatus}</span>
                          </span>
                          
                          {sub.premiumPrStatus === "APPROVED" && (
                            <button
                              onClick={() => handlePremiumPayment(sub.id)}
                              className="px-4 py-2 bg-[#F5E000] text-black font-sans font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all w-full mt-1 border-2 border-transparent"
                            >
                              PAY PREMIUM PR
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {/* Publication link - only when URL is present */}
                    {sub.publicationUrl && (
                      <a
                        href={sub.publicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#00CC66] text-black font-sans font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                      >
                        <ExternalLink size={12} strokeWidth={3} /> VER PUBLICACIÓN
                      </a>
                    )}
                    {/* Interview link - only when published */}
                    {sub.interviewUrl && (
                      <a
                        href={sub.interviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#00CC66] text-black font-sans font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                      >
                        <ExternalLink size={12} strokeWidth={3} /> VER ENTREVISTA
                      </a>
                    )}
                    {/* Article link - only when published */}
                    {sub.articleUrl && (
                      <a
                        href={sub.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#00CC66] text-black font-sans font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
                      >
                        <ExternalLink size={12} strokeWidth={3} /> VER ARTÍCULO
                      </a>
                    )}
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                      {formatDate(sub.submittedAt)}
                    </span>
                    <a
                      href={sub.streamingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 flex items-center justify-center bg-black border-2 border-white/10 text-[#F5E000] hover:bg-[#F5E000] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      title="Open streaming link"
                    >
                      <ExternalLink size={18} strokeWidth={3} />
                    </a>
                  </div>

                  {/* Premium Services Payment Section */}
                  {(sub.status === "ACCEPTED" || sub.status === "PUBLISHED") && sub.assignedPremiumServices?.length > 0 && (
                    <div className="col-span-1 sm:col-span-4 mt-4 p-6 border-l-4 border-[#00CC66] bg-[#00CC66]/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div>
                        <p className="font-sans text-[10px] font-black uppercase tracking-widest text-[#00CC66] mb-1">
                          PREMIUM PR ACCEPTED
                        </p>
                        <p className="font-sans text-xs font-bold text-white/80">
                          Your track was accepted for {sub.assignedPremiumServices.join(" and ")}.
                        </p>
                      </div>
                      {sub.premiumServicesPaid ? (
                        <span className="px-6 py-3 bg-[#00CC66] text-black font-black uppercase text-[10px] tracking-widest">
                          PAID & ACTIVE
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePayPremium(sub.id)}
                          disabled={payLoading === sub.id}
                          className="px-6 py-3 bg-[#00CC66] text-black font-black uppercase text-[10px] tracking-widest hover:bg-white transition-all flex items-center gap-2"
                        >
                          {payLoading === sub.id ? <Loader2 size={14} className="animate-spin" /> : null}
                          PAY TO UNLOCK
                        </button>
                      )}
                    </div>
                  )}

                  {/* Curator Review Section */}
                  {(() => {
                    const isTerminal = sub.status === "ACCEPTED" || sub.status === "PUBLISHED" || sub.status === "REJECTED" || sub.status === "CURATOR_REJECTED";
                    const finalNotes = sub.masterNotes || sub.curatorNotes;
                    const finalRating = sub.masterRating ?? sub.curatorRating;
                    
                    if (!isTerminal || (!finalNotes && !finalRating)) return null;

                    return (
                      <div className="col-span-1 sm:col-span-4 mt-4 p-6 border-l-4 border-[#F5E000] bg-white/5">
                        <p className="font-sans text-[10px] font-black uppercase tracking-widest text-[#F5E000] mb-3">FINAL REVIEW</p>
                        {finalRating && (
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg key={star} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={finalRating >= star ? "#F5E000" : "none"} stroke={finalRating >= star ? "#F5E000" : "rgba(255,255,255,0.2)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            ))}
                          </div>
                        )}
                        {finalNotes && (
                          <p className="font-sans text-sm font-bold text-white/80 whitespace-pre-wrap leading-relaxed">{finalNotes}</p>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
