"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Artist {
  id: string;
  name: string | null;
  artistName: string | null;
  email: string;
  country: string | null;
  genre: string | null;
  roleType: string;
  createdAt: string;
  _count: { submissions: number };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const fetchArtists = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/artists?page=${page}`);
    if (res.ok) {
      const data = await res.json();
      setArtists(data.users);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
            Artists
          </h1>
          <p className="font-sans text-base text-cm-text-secondary mt-2">
            {total} registered artist{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && artists.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-cm-text-muted">
            No artists registered yet.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && artists.length > 0 && (
        <>
          <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
            {/* Column headers */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
              {["Artist", "Email", "Country", "Genre", "Submissions", "Joined"].map((h) => (
                <span
                  key={h}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary"
                >
                  {h}
                </span>
              ))}
            </div>

            {artists.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
              >
                {/* Name */}
                <div className="min-w-0">
                  <p className="font-sans text-base font-bold text-cm-text-primary truncate">
                    {a.artistName ?? a.name ?? "—"}
                  </p>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-cm-text-secondary mt-1">
                    {a.roleType}
                  </p>
                </div>

                {/* Email */}
                <p className="font-sans text-sm text-cm-text-secondary truncate">
                  {a.email}
                </p>

                {/* Country */}
                <span className="font-sans text-sm text-cm-text-secondary shrink-0">
                  {a.country ?? "—"}
                </span>

                {/* Genre */}
                <span className="font-sans text-sm text-cm-text-secondary shrink-0">
                  {a.genre ?? "—"}
                </span>

                {/* Submissions count */}
                <span
                  className={`font-sans text-base font-bold shrink-0 ${
                    a._count.submissions > 0 ? "text-accent-red" : "text-cm-text-muted"
                  }`}
                >
                  {a._count.submissions}
                </span>

                {/* Date */}
                <span className="font-sans text-sm text-cm-text-secondary shrink-0">
                  {formatDate(a.createdAt)}
                </span>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="font-sans text-xs font-semibold text-cm-text-secondary uppercase tracking-wider">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  id="artists-prev-page"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-2 border border-border rounded-md text-cm-text-secondary hover:bg-bg-elevated transition-all disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  id="artists-next-page"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
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
