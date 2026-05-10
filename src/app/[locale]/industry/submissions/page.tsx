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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
            Agency Submissions
          </h1>
          <p className="font-sans text-cm-text-secondary mt-2">
            Track the status of songs submitted on behalf of your artists.
          </p>
        </div>
        <Link
          href={`/${locale}/industry/submit`}
          className="btn-primary flex items-center gap-2"
          id="new-submission-btn"
        >
          <Music size={16} />
          Submit a Track
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all ${
              filter === f
                ? "bg-accent-red text-white shadow-sm"
                : "bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:text-cm-text-primary border border-border"
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
        <div className="flex items-center justify-center py-24 text-cm-text-muted bg-bg-surface border border-border rounded-xl">
          <Loader2 size={24} className="animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-bg-surface border border-border rounded-xl text-center shadow-sm">
          <Music size={48} className="text-cm-text-muted mb-6" />
          <h2 className="font-sans text-xl font-bold text-cm-text-primary mb-2">No Submissions Found</h2>
          <p className="font-sans text-sm text-cm-text-secondary mb-6 max-w-sm">
            {filter === "ALL" 
              ? "You haven't submitted any tracks for your artists yet."
              : "No submissions match this filter."}
          </p>
          {filter === "ALL" && (
            <Link href={`/${locale}/industry/submit`} className="btn-primary">
              Submit Your First Track
            </Link>
          )}
        </div>
      )}

      {/* Submissions list */}
      {!loading && submissions.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_minmax(150px,1fr)_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
            <span className="w-12 shrink-0" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.track")}
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              Roster Artist
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.status")}
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.date")}
            </span>
          </div>

          <div className="divide-y divide-border">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_minmax(150px,1fr)_auto_auto] gap-4 items-center px-6 py-5 hover:bg-bg-elevated transition-colors"
              >
                {/* Cover */}
                <div className="w-12 h-12 rounded-md shrink-0 bg-bg-elevated border border-border overflow-hidden flex items-center justify-center">
                  {sub.autoFilledCover ? (
                    <img
                      src={sub.autoFilledCover}
                      alt={sub.trackTitle}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={16} className="text-cm-text-muted" />
                  )}
                </div>

                {/* Track info */}
                <div className="min-w-0 pr-4">
                  <p className="font-sans text-base font-bold text-cm-text-primary truncate" title={sub.trackTitle}>
                    {sub.trackTitle}
                  </p>
                  <p className="font-sans text-sm text-cm-text-secondary truncate mt-0.5">
                    {sub.artistName} · {sub.genres[0] ?? "—"}
                  </p>
                  <span className="inline-block px-2 py-0.5 bg-bg-elevated border border-border rounded text-[10px] font-bold text-cm-text-secondary uppercase mt-1.5">
                    {sub.opportunity}
                  </span>
                </div>

                {/* Roster Artist info */}
                <div className="min-w-0 hidden sm:flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-red/10 flex items-center justify-center text-accent-red shrink-0">
                    <Users size={12} />
                  </div>
                  <span className="font-sans text-sm font-semibold text-cm-text-primary truncate">
                    {sub.managedArtist?.artistName || "Unknown Artist"}
                  </span>
                </div>

                {/* Status badge */}
                <div className={`shrink-0 ${STATUS_COLORS[sub.status]}`}>
                  <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-2 py-1">
                    {statusLabel(sub.status)}
                  </span>
                </div>

                {/* Date + link */}
                <div className="flex items-center justify-end gap-3 shrink-0">
                  <span className="font-sans text-xs text-cm-text-secondary font-medium">
                    {formatDate(sub.submittedAt)}
                  </span>
                  <a
                    href={sub.streamingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-surface border border-transparent hover:border-border p-2 rounded-md transition-all bg-bg-elevated/50"
                    title="Open streaming link"
                  >
                    <ExternalLink size={14} />
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
