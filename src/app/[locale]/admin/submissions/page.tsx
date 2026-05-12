"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, ExternalLink, ChevronLeft, ChevronRight, Music } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status =
  | "PENDING"
  | "IN_REVIEW"
  | "CURATOR_APPROVED"
  | "CURATOR_REJECTED"
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "REJECTED";

type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";

interface Submission {
  id: string;
  trackTitle: string;
  artistName: string;
  opportunity: Opportunity;
  status: Status;
  genres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  submittedAt: string;
  user: { id: string; name: string | null; email: string };
}

const STATUS_COLORS: Record<Status, string> = {
  PENDING: "badge-review",
  IN_REVIEW: "badge-review",
  CURATOR_APPROVED: "badge-selected",
  CURATOR_REJECTED: "badge-rejected",
  MASTER_REVIEW: "badge-review", // Can adjust these custom later if needed, but these map roughly
  ACCEPTED: "badge-selected",
  REJECTED: "badge-rejected",
};

const OPP_COLORS: Record<Opportunity, string> = {
  WEEKLY: "bg-bg-elevated text-cm-text-primary border border-border px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  SPOTIFY: "bg-ok/10 text-ok border border-ok/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  WEBRADIO: "bg-warn/10 text-warn border border-warn/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  ALBUM_STORY: "bg-accent-red/10 text-accent-red border border-accent-red/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "REJECTED", label: "Rejected" },
];

const OPP_FILTERS = [
  { value: "", label: "All Types" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "SPOTIFY", label: "Spotify" },
  { value: "WEBRADIO", label: "Web Radio" },
  { value: "ALBUM_STORY", label: "Album Story" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSubmissionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = searchParams.get("status") ?? "";
  const oppFilter = searchParams.get("opportunity") ?? "";
  const pageParam = parseInt(searchParams.get("page") ?? "1");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (oppFilter) params.set("opportunity", oppFilter);
    params.set("page", String(pageParam));

    const res = await fetch(`/api/admin/submissions?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setSubmissions(data.submissions);
      setTotal(data.total);
    }
    setLoading(false);
  }, [statusFilter, oppFilter, pageParam]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // reset to page 1 on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const goPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-6xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          Submissions
        </h1>
        <p className="font-sans text-base text-cm-text-secondary mt-2">
          {total} total submission{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2 mb-6">
        {/* Status */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value || "all-status"}
              id={`sub-filter-status-${value || "all"}`}
              onClick={() => updateParam("status", value)}
              className={`font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-md transition-all ${
                statusFilter === value
                  ? "bg-accent-red text-white shadow-sm"
                  : "bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:text-cm-text-primary border border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Opportunity */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {OPP_FILTERS.map(({ value, label }) => (
            <button
              key={value || "all-opp"}
              id={`sub-filter-opp-${value || "all"}`}
              onClick={() => updateParam("opportunity", value)}
              className={`font-sans text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-md transition-all ${
                oppFilter === value
                  ? "bg-accent-red text-white shadow-sm"
                  : "bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:text-cm-text-primary border border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && submissions.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-cm-text-muted">
            No submissions found.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && submissions.length > 0 && (
        <>
          <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Column headers */}
            <div className="hidden lg:grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
              {["", "Track", "Opportunity", "Status", "Submitted by", "Date"].map((h) => (
                <span
                  key={h}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary"
                >
                  {h}
                </span>
              ))}
            </div>

            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
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

                {/* Track + artist */}
                <div className="min-w-0">
                  <p className="font-sans text-base font-bold text-cm-text-primary truncate">
                    {sub.trackTitle}
                  </p>
                  <p className="font-sans text-sm text-cm-text-secondary truncate mt-0.5">
                    {sub.artistName}
                  </p>
                </div>

                {/* Opportunity */}
                <div className={`shrink-0 ${OPP_COLORS[sub.opportunity]}`}>
                  {sub.opportunity ? sub.opportunity.replace(/_/g, " ") : "GENERAL SUBMISSION"}
                </div>

                {/* Status */}
                <div className={`shrink-0 ${STATUS_COLORS[sub.status]}`}>
                  {sub.status.replace(/_/g, " ")}
                </div>

                {/* Submitted by */}
                <div className="min-w-0 shrink-0 max-w-[140px]">
                  <p className="font-sans text-sm text-cm-text-secondary truncate">
                    {sub.user.name ?? sub.user.email}
                  </p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="font-sans text-xs font-semibold text-cm-text-secondary uppercase tracking-wider">
                Page {pageParam} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  id="subs-prev-page"
                  onClick={() => goPage(pageParam - 1)}
                  disabled={pageParam === 1}
                  className="p-2 border border-border rounded-md text-cm-text-secondary hover:bg-bg-elevated transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  id="subs-next-page"
                  onClick={() => goPage(pageParam + 1)}
                  disabled={pageParam === totalPages}
                  className="p-2 border border-border rounded-md text-cm-text-secondary hover:bg-bg-elevated transition-all disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
