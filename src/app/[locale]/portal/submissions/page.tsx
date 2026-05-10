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
    if (s === "ACCEPTED") return tStatus("selected");
    return tStatus("notSelected");
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          {t("title")}
        </h1>
        <Link
          href={`/${locale}/portal/submit`}
          className="btn-primary"
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
            className={`font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-md transition-all ${
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
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Music size={48} className="text-cm-text-muted mb-6" />
          <p className="font-sans text-base font-medium text-cm-text-secondary mb-4">{t("empty")}</p>
          <Link href={`/${locale}/portal/submit`} className="btn-primary">
            {t("submitFirst")}
          </Link>
        </div>
      )}

      {/* Submissions list */}
      {!loading && submissions.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
            <span className="w-10 shrink-0" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.track")}
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.status")}
            </span>
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
              {t("columns.date")}
            </span>
          </div>

          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
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
              <div className="min-w-0">
                <p className="font-sans text-base font-bold text-cm-text-primary truncate">
                  {sub.trackTitle}
                </p>
                <p className="font-sans text-sm text-cm-text-secondary truncate mt-0.5">
                  {sub.artistName} · {sub.genres[0] ?? "—"} · {sub.opportunity}
                </p>
              </div>

              {/* Status badge */}
              <div className={`shrink-0 ${STATUS_COLORS[sub.status]}`}>
                <span className="font-sans text-xs font-bold uppercase tracking-wider">
                  {statusLabel(sub.status)}
                </span>
              </div>

              {/* Date + link */}
              <div className="flex items-center gap-4 shrink-0">
                <span className="font-sans text-sm text-cm-text-secondary">
                  {formatDate(sub.submittedAt)}
                </span>
                <a
                  href={sub.streamingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-elevated p-2 rounded-md transition-all"
                  title="Open streaming link"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
