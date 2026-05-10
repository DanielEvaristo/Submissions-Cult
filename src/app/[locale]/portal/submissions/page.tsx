"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Loader2, Music, ExternalLink } from "lucide-react";

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
  artistName: string;
  opportunity: string;
  status: Status;
  releaseType: string;
  genres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  submittedAt: string;
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: "text-cm-text-muted border-cm-text-muted/30",
  IN_REVIEW: "text-warning border-warning/30",
  CURATOR_APPROVED: "text-ok border-ok/30",
  CURATOR_REJECTED: "text-danger border-danger/30",
  MASTER_REVIEW: "text-accent-red border-accent-red/30",
  ACCEPTED: "text-ok border-ok/40",
  REJECTED: "text-danger border-danger/40",
};

const FILTER_OPTIONS = ["ALL", "PENDING", "IN_REVIEW", "ACCEPTED", "REJECTED"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmissionsPage() {
  const t = useTranslations("submissions");
  const tStatus = useTranslations("status");
  const tOpp = useTranslations("submit.opportunities");
  const locale = useLocale();

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
    if (s === "ACCEPTED" || s === "CURATOR_REJECTED" === false) return tStatus("selected");
    return tStatus("notSelected");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-mono text-2xl font-bold text-cm-text-primary">
          {t("title")}
        </h1>
        <Link
          href={`/${locale}/portal/submit`}
          className="btn-primary text-sm"
          id="new-submission-btn"
        >
          + {t("submitAnother")}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 border transition-all ${
              filter === f
                ? "border-accent-red text-accent-red"
                : "border-border text-cm-text-muted hover:border-cm-text-muted hover:text-cm-text-secondary"
            }`}
          >
            {f === "ALL"
              ? t("filters.all")
              : f === "PENDING" || f === "IN_REVIEW"
              ? t("filters.underReview")
              : f === "ACCEPTED"
              ? t("filters.selected")
              : t("filters.notSelected")}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Music size={36} className="text-cm-text-muted mb-4" />
          <p className="font-mono text-sm text-cm-text-secondary mb-2">{t("empty")}</p>
          <Link href={`/${locale}/portal/submit`} className="btn-primary mt-4">
            {t("submitFirst")}
          </Link>
        </div>
      )}

      {/* Submissions list */}
      {!loading && submissions.length > 0 && (
        <div className="space-y-2">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 pb-2 border-b border-border">
            <span className="font-mono text-[9px] uppercase tracking-widest text-cm-text-muted w-10" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-cm-text-muted">
              {t("columns.track")}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-cm-text-muted">
              {t("columns.status")}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-cm-text-muted">
              {t("columns.date")}
            </span>
          </div>

          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-3 sm:gap-4 items-center p-4 border border-border hover:border-cm-text-muted/40 transition-colors"
            >
              {/* Cover */}
              <div className="w-10 h-10 shrink-0 bg-border overflow-hidden">
                {sub.autoFilledCover ? (
                  <img
                    src={sub.autoFilledCover}
                    alt={sub.trackTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={14} className="text-cm-text-muted" />
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="min-w-0">
                <p className="font-mono text-sm font-bold text-cm-text-primary truncate">
                  {sub.trackTitle}
                </p>
                <p className="font-sans text-xs text-cm-text-secondary truncate">
                  {sub.artistName} · {sub.genres[0] ?? "—"} · {sub.opportunity}
                </p>
              </div>

              {/* Status badge */}
              <div className={`shrink-0 px-2 py-0.5 border font-mono text-[10px] uppercase tracking-widest ${STATUS_COLORS[sub.status]}`}>
                {sub.status.replace(/_/g, " ")}
              </div>

              {/* Date + link */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-[10px] text-cm-text-muted">
                  {formatDate(sub.submittedAt)}
                </span>
                <a
                  href={sub.streamingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cm-text-muted hover:text-cm-text-secondary transition-colors"
                  title="Open streaming link"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
