"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, KeyRound, Loader2, CheckCircle, X, ShieldAlert } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserResult {
  id: string;
  name: string | null;
  artistName: string | null;
  legalName: string | null;
  email: string;
  accountType: string;
  roleType: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<UserResult | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Search debounce ──────────────────────────────────────────────────────────

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/users/search?q=${encodeURIComponent(q.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.users ?? []);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  // ── Select user ─────────────────────────────────────────────────────────────

  const selectUser = (user: UserResult) => {
    setSelected(user);
    setResults([]);
    setQuery("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  const clearSelected = () => {
    setSelected(null);
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleReset = async () => {
    setError("");
    if (!selected) return;

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Display name helper ──────────────────────────────────────────────────────

  const displayName = (u: UserResult) =>
    u.artistName ?? u.legalName ?? u.name ?? "—";

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b-4 border-white/10 pb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-3 block">
          ADMIN TOOLS
        </span>
        <h1 className="font-sans text-5xl font-black text-white tracking-tighter uppercase leading-none">
          RESET<br />PASSWORD.
        </h1>
        <p className="font-sans text-sm font-semibold text-white/40 mt-4 uppercase tracking-wider">
          Search for any user or industry account and set a new password.
        </p>
      </div>

      {/* Search */}
      <div className="space-y-3">
        <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          Search User
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            {searching ? (
              <Loader2 size={16} className="animate-spin text-white/30" />
            ) : (
              <Search size={16} className="text-white/30" />
            )}
          </div>
          <input
            id="reset-password-search"
            type="text"
            className="w-full bg-black border-2 border-white/10 text-white font-sans font-semibold text-sm pl-10 pr-4 py-4 focus:outline-none focus:border-[#F5E000] transition-colors placeholder:text-white/20"
            placeholder="Name, artist name, email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && (
          <div className="bg-black border-2 border-[#F5E000]/30 divide-y-2 divide-white/5">
            {results.map((u) => (
              <button
                key={u.id}
                id={`select-user-${u.id}`}
                onClick={() => selectUser(u)}
                className="w-full flex items-start gap-4 px-5 py-4 hover:bg-[#F5E000]/5 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-sm font-black text-white truncate">
                    {displayName(u)}
                  </p>
                  <p className="font-sans text-xs font-semibold text-white/40 truncate mt-0.5">
                    {u.email}
                  </p>
                </div>
                <span className="shrink-0 font-sans text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-white/10 text-white/30 mt-0.5">
                  {u.accountType}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {!searching && query.trim().length >= 2 && results.length === 0 && !selected && (
          <p className="font-sans text-xs font-semibold text-white/30 uppercase tracking-wider px-1">
            No users found for &quot;{query}&quot;
          </p>
        )}
      </div>

      {/* Selected User Card + Password Form */}
      {selected && (
        <div className="border-4 border-white/10 bg-black/50 space-y-8 p-8">
          {/* User info */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                Selected Account
              </p>
              <p className="font-sans text-2xl font-black text-white tracking-tight">
                {displayName(selected)}
              </p>
              <p className="font-sans text-sm font-semibold text-white/40 mt-1">
                {selected.email}
              </p>
              <div className="flex gap-2 mt-3">
                <span className="font-sans text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-[#F5E000]/30 text-[#F5E000]/70">
                  {selected.accountType}
                </span>
                <span className="font-sans text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-white/10 text-white/30">
                  {selected.roleType}
                </span>
              </div>
            </div>
            <button
              onClick={clearSelected}
              title="Clear selection"
              className="p-2 text-white/30 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>

          {success ? (
            /* Success state */
            <div className="border-2 border-[#00FF00]/20 bg-[#00FF00]/5 px-6 py-5 flex items-center gap-4">
              <CheckCircle size={24} className="text-[#00FF00] shrink-0" strokeWidth={3} />
              <div>
                <p className="font-sans text-sm font-black text-[#00FF00] uppercase tracking-wider">
                  Password updated successfully
                </p>
                <p className="font-sans text-xs font-semibold text-[#00FF00]/60 mt-1">
                  The user can now log in with the new password.
                </p>
              </div>
            </div>
          ) : (
            /* Password form */
            <div className="space-y-5">
              <div className="border-t-2 border-white/5 pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert size={16} className="text-[#F5E000] shrink-0" strokeWidth={3} />
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    Set New Password
                  </p>
                </div>

                <div className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                      New Password
                    </label>
                    <input
                      id="admin-new-password"
                      type="password"
                      className="w-full bg-black border-2 border-white/10 text-white font-sans font-semibold text-sm px-4 py-3.5 focus:outline-none focus:border-[#F5E000] transition-colors placeholder:text-white/20"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                        setSuccess(false);
                      }}
                    />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">
                      Confirm Password
                    </label>
                    <input
                      id="admin-confirm-password"
                      type="password"
                      className="w-full bg-black border-2 border-white/10 text-white font-sans font-semibold text-sm px-4 py-3.5 focus:outline-none focus:border-[#F5E000] transition-colors placeholder:text-white/20"
                      placeholder="Repeat the password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                        setSuccess(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleReset()}
                    />
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-3 border-2 border-red-500/20 bg-red-500/5 px-4 py-3">
                  <X size={14} className="text-red-400 shrink-0" strokeWidth={3} />
                  <p className="font-sans text-xs font-black text-red-400 uppercase tracking-wider">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                id="admin-reset-password-submit"
                onClick={handleReset}
                disabled={saving || !newPassword || !confirmPassword}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#F5E000] text-black font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" strokeWidth={3} />
                ) : (
                  <KeyRound size={16} strokeWidth={3} />
                )}
                {saving ? "UPDATING..." : "SET NEW PASSWORD"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
