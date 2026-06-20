"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight, KeyRound, X } from "lucide-react";

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

// ─── Reset Password Modal ──────────────────────────────────────────────────────

function ResetPasswordModal({
  target,
  onSuccess,
  onCancel,
}: {
  target: { id: string; name: string; email: string };
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/admin/users/${target.id}/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
    } else {
      setDone(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-bg-surface border border-border w-full max-w-md p-6 rounded-xl shadow-lg">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-sans text-lg font-bold text-cm-text-primary tracking-tight">
              Reset Password
            </h2>
            <p className="font-sans text-sm text-cm-text-secondary mt-1">
              {target.name} · {target.email}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-cm-text-muted hover:text-cm-text-primary transition-colors rounded-md hover:bg-bg-elevated"
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="bg-ok/10 border border-ok/30 rounded-lg px-4 py-3">
              <p className="font-sans text-sm font-semibold text-ok">
                ✓ Password updated successfully. A security alert email has been
                sent to the user.
              </p>
            </div>
            <button onClick={onSuccess} className="btn-primary w-full">
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary mb-1.5">
                New Password
              </label>
              <input
                id="admin-reset-password-input"
                type="password"
                className="input w-full"
                placeholder="Min. 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                autoFocus
              />
            </div>

            {error && (
              <p className="font-sans text-xs font-semibold text-danger">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={onCancel} className="btn-ghost">
                Cancel
              </button>
              <button
                id="admin-reset-password-confirm"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-accent-red text-white hover:bg-accent-red/90 rounded-md transition-all disabled:opacity-50 font-sans text-sm font-semibold shadow-sm"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Set New Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [resetTarget, setResetTarget] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

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
            <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
              {["Artist", "Email", "Country", "Genre", "Submissions", "Joined", ""].map((h, i) => (
                <span
                  key={i}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary"
                >
                  {h}
                </span>
              ))}
            </div>

            {artists.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto_auto_auto] gap-4 items-center px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
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

                {/* Reset password */}
                <button
                  id={`reset-password-${a.id}`}
                  title="Reset password"
                  onClick={() =>
                    setResetTarget({
                      id: a.id,
                      name: a.artistName ?? a.name ?? "User",
                      email: a.email,
                    })
                  }
                  className="p-2 text-cm-text-muted hover:text-cm-text-primary hover:bg-bg-elevated rounded-md transition-all shrink-0"
                >
                  <KeyRound size={16} />
                </button>
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

      {/* Reset Password Modal */}
      {resetTarget && (
        <ResetPasswordModal
          target={resetTarget}
          onSuccess={() => setResetTarget(null)}
          onCancel={() => setResetTarget(null)}
        />
      )}
    </div>
  );
}
