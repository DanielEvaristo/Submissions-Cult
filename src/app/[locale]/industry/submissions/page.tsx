"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Loader2, Music, ExternalLink, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import UnverifiedLock from "@/components/industry/UnverifiedLock";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status =
  | "PENDING"
  | "IN_REVIEW"
  | "CURATOR_APPROVED"
  | "CURATOR_REJECTED"
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "REJECTED";

interface Submission {
  id: string;
  trackTitle: string;
  artistName: string; // The text typed in the form
  opportunity: string;
  status: Status;
  releaseType: string;
  genres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  submittedAt: string;
  managedArtist?: {
    artistName: string;
  } | null;
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: "badge-review",
  IN_REVIEW: "badge-review",
  CURATOR_APPROVED: "badge-selected",
  CURATOR_REJECTED: "badge-rejected",
  MASTER_REVIEW: "badge-review",
  ACCEPTED: "badge-selected",
  REJECTED: "badge-rejected",
};

const FILTER_OPTIONS = ["ALL", "UNDER_REVIEW", "SELECTED", "NOT_SELECTED"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IndustrySubmissionsPage() {
  const t = useTranslations("submissions");
  const tStatus = useTranslations("status");
  const locale = useLocale();
  const { data: session, status } = useSession();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("ALL");

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
          const data = await res.json();
          setSubmissions(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [filter]);

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
    if (s === "ACCEPTED") return tStatus("selected");
    return tStatus("notSelected");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24 text-cm-text-muted">
        <Loader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-12 animate-reveal">
      {/* Editorial Header */}
      <div className="border-b-4 border-white/10 pb-8 mb-12 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">AGENCY ACTIVITY</span>
          <h1 className="font-sans text-6xl font-black text-white tracking-tighter uppercase leading-none">
            SUBMISSION<br/>TRACKER
          </h1>
        </div>
        <Link
          href={`/${locale}/industry/submit`}
          className="bg-black text-white px-8 py-4 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-[#F5E000] hover:text-black transition-all border-2 border-white/10 flex items-center gap-3"
          id="new-submission-btn"
        >
          <Music size={20} strokeWidth={3} /> SUBMIT TRACK
        </Link>
      </div>

      {/* Filters */}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-[#F5E000]">
          <Loader2 size={32} className="animate-spin" strokeWidth={3} />
        </div>
      )}

      {/* Empty state */}
      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 border-4 border-white/10 border-dashed bg-black">
          <Music size={64} className="text-white/5 mb-8" strokeWidth={3} />
          <h2 className="font-sans text-xl font-black uppercase tracking-tighter text-white/20 mb-4">NO ACTIVITY FOUND.</h2>
          <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/20 mb-8 max-w-sm text-center">
            {filter === "ALL" 
              ? "YOU HAVEN'T SUBMITTED ANY TRACKS FOR YOUR ARTISTS YET."
              : "NO SUBMISSIONS MATCH THIS FILTER."}
          </p>
          {filter === "ALL" && (
            <Link href={`/${locale}/industry/submit`} className="bg-[#F5E000] text-black px-12 py-6 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all">
              SUBMIT FIRST TRACK
            </Link>
          )}
        </div>
      )}

      {/* Submissions list */}
      {!loading && submissions.length > 0 && (
        <div className="border-4 border-white/10 bg-black">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[80px_1fr_1fr_180px_150px] gap-8 px-10 py-6 bg-black text-white items-center border-b-2 border-white/5">
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">COVER</span>
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">TRACK / OPPORTUNITY</span>
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">ROSTER ARTIST</span>
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-center">STATUS</span>
            <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40 text-right">DATE</span>
          </div>

          <div className="divide-y-2 divide-white/5">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_180px_150px] gap-8 items-center px-10 py-8 hover:bg-white/5 transition-all group"
              >
                {/* Cover */}
                <div className="w-16 h-16 bg-black border-2 border-white/10 shadow-[4px_4px_0px_0px_rgba(245,224,0,0.1)] group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 transition-all overflow-hidden flex items-center justify-center">
                  {sub.autoFilledCover ? (
                    <img
                      src={sub.autoFilledCover}
                      alt={sub.trackTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={20} className="text-[#F5E000]" strokeWidth={3} />
                  )}
                </div>

                {/* Track info */}
                <div className="min-w-0 pr-4">
                  <p className="font-sans text-xl font-black uppercase tracking-tighter text-white truncate mb-1" title={sub.trackTitle}>
                    {sub.trackTitle}
                  </p>
                  <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40">
                    {sub.artistName} · <span className="text-black bg-[#F5E000] px-1">{sub.opportunity ? sub.opportunity.replace(/_/g, " ") : "GENERAL SUBMISSION"}</span>
                  </p>
                </div>

                {/* Roster Artist info */}
                <div className="min-w-0 hidden sm:flex items-center gap-3">
                  <div className="w-8 h-8 bg-black flex items-center justify-center text-[#F5E000] border border-white/10">
                    <Users size={16} strokeWidth={3} />
                  </div>
                  <span className="font-sans text-[10px] font-black uppercase tracking-widest text-white truncate">
                    {sub.managedArtist?.artistName || "UNKNOWN"}
                  </span>
                </div>

                {/* Status badge */}
                <div className="flex justify-center">
                  <div className={`px-4 py-2 border-2 font-sans text-[9px] font-black uppercase tracking-widest ${
                    sub.status === 'ACCEPTED' ? 'bg-[#F5E000] text-black border-black' : 
                    sub.status === 'REJECTED' || sub.status === 'CURATOR_REJECTED' ? 'bg-[#FF0000] text-white border-[#FF0000]' : 
                    'bg-black text-white border-white/10'
                  }`}>
                    {statusLabel(sub.status)}
                  </div>
                </div>

                {/* Date + link */}
                <div className="flex items-center justify-end gap-6">
                  <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    {formatDate(sub.submittedAt)}
                  </span>
                  <a
                    href={sub.streamingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center bg-black border-2 border-white/10 text-[#F5E000] hover:bg-[#F5E000] hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    title="Open streaming link"
                  >
                    <ExternalLink size={16} strokeWidth={3} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
