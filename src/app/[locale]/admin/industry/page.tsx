"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Loader2, ExternalLink, CheckCircle, XCircle, KeyRound, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LabelStatus = "PENDING_VERIFICATION" | "APPROVED" | "REJECTED";

interface IndustryUser {
  id: string;
  name: string | null;
  email: string;
  legalName: string | null;
  websiteUrl: string | null;
  labelInstagram: string | null;
  labelStatus: LabelStatus;
  isVerifiedLabel: boolean;
  rejectionReason: string | null;
  createdAt: string;
}

const STATUS_STYLES: Record<LabelStatus, string> = {
  PENDING_VERIFICATION: "badge-review",
  APPROVED: "badge-selected",
  REJECTED: "badge-rejected",
};

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "PENDING_VERIFICATION", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-bg-surface border border-border w-full max-w-md p-6 rounded-xl shadow-lg space-y-4">
        <h2 className="font-sans text-lg font-bold text-cm-text-primary tracking-tight">
          Reject Application
        </h2>
        <p className="font-sans text-sm text-cm-text-secondary">
          Optionally provide a reason. This will be stored on the account.
        </p>
        <textarea
          className="input w-full min-h-[100px] resize-none"
          placeholder="Reason for rejection (optional)..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3 justify-end mt-2">
          <button
            onClick={onCancel}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            id="reject-confirm-btn"
            onClick={() => onConfirm(reason)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-danger text-white hover:bg-danger/90 rounded-md transition-all disabled:opacity-50 font-sans text-sm font-medium shadow-sm"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm Reject
          </button>
        </div>
      </div>
    </div>
  );
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

export default function IndustryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const statusFilter = searchParams.get("status") ?? "";

  const [users, setUsers] = useState<IndustryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<{ id: string; name: string; email: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const url = statusFilter
      ? `/api/admin/industry?status=${statusFilter}`
      : "/api/admin/industry";
    const res = await fetch(url);
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  };

  const approve = async (id: string) => {
    setActionLoading(true);
    await fetch(`/api/admin/industry/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    setActionLoading(false);
    fetchUsers();
  };

  const reject = async (id: string, reason: string) => {
    setActionLoading(true);
    await fetch(`/api/admin/industry/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", reason }),
    });
    setActionLoading(false);
    setRejectTarget(null);
    fetchUsers();
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          Industry Applications
        </h1>
        <p className="font-sans text-base text-cm-text-secondary mt-2">
          Review and manage label / industry account verifications.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 mb-6 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value || "all"}
            id={`industry-filter-${value || "all"}`}
            onClick={() => setFilter(value)}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && users.length === 0 && (
        <div className="py-20 text-center">
          <p className="font-mono text-sm text-cm-text-muted">
            No industry accounts found.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && users.length > 0 && (
        <div className="bg-bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 px-6 py-4 bg-bg-elevated border-b border-border">
            {["Account", "Links", "Status", "Registered", "Actions"].map((h) => (
              <span
                key={h}
                className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary"
              >
                {h}
              </span>
            ))}
          </div>

          {users.map((u) => (
            <div
              key={u.id}
              className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center px-6 py-5 border-b border-border last:border-0 hover:bg-bg-elevated transition-colors"
            >
              {/* Account info */}
              <div className="min-w-0">
                <p className="font-sans text-base font-bold text-cm-text-primary truncate">
                  {u.legalName ?? u.name ?? "—"}
                </p>
                <p className="font-sans text-sm text-cm-text-secondary truncate mt-0.5">
                  {u.email}
                </p>
                {u.rejectionReason && (
                  <p className="font-sans text-xs text-danger mt-1 truncate">
                    Reason: {u.rejectionReason}
                  </p>
                )}
              </div>

              {/* Links */}
              <div className="flex items-center gap-4 min-w-0">
                {u.websiteUrl && (
                  <a
                    href={u.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-cm-text-secondary hover:text-cm-text-primary flex items-center gap-1.5 truncate transition-colors"
                  >
                    <ExternalLink size={14} />
                    Website
                  </a>
                )}
                {u.labelInstagram && (
                  <a
                    href={`https://instagram.com/${u.labelInstagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-cm-text-secondary hover:text-cm-text-primary flex items-center gap-1.5 truncate transition-colors"
                  >
                    <ExternalLink size={14} />
                    Instagram
                  </a>
                )}
                {!u.websiteUrl && !u.labelInstagram && (
                  <span className="font-sans text-sm text-cm-text-muted">—</span>
                )}
              </div>

              {/* Status badge */}
              <div className={STATUS_STYLES[u.labelStatus]}>
                {u.labelStatus.replace(/_/g, " ")}
              </div>

              {/* Date */}
              <span className="font-sans text-sm text-cm-text-secondary shrink-0">
                {formatDate(u.createdAt)}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {u.labelStatus !== "APPROVED" && (
                  <button
                    id={`approve-${u.id}`}
                    onClick={() => approve(u.id)}
                    disabled={actionLoading}
                    title="Approve"
                    className="p-2 bg-ok/10 text-ok hover:bg-ok hover:text-white rounded-md transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                {u.labelStatus !== "REJECTED" && (
                  <button
                    id={`reject-${u.id}`}
                    onClick={() => setRejectTarget(u.id)}
                    disabled={actionLoading}
                    title="Reject"
                    className="p-2 bg-danger/10 text-danger hover:bg-danger hover:text-white rounded-md transition-all disabled:opacity-50"
                  >
                    <XCircle size={18} />
                  </button>
                )}
                <button
                  id={`reset-password-${u.id}`}
                  title="Reset password"
                  onClick={() =>
                    setResetTarget({
                      id: u.id,
                      name: u.legalName ?? u.name ?? "User",
                      email: u.email,
                    })
                  }
                  className="p-2 text-cm-text-muted hover:text-cm-text-primary hover:bg-bg-elevated rounded-md transition-all"
                >
                  <KeyRound size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTarget && (
        <RejectModal
          loading={actionLoading}
          onConfirm={(reason) => reject(rejectTarget, reason)}
          onCancel={() => setRejectTarget(null)}
        />
      )}

      {/* Reset password modal */}
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
