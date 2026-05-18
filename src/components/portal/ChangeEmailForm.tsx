"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, Mail, ShieldCheck, ShieldAlert } from "lucide-react";

interface ChangeEmailFormProps {
  currentEmail: string;
  emailVerified: Date | null;
}

export default function ChangeEmailForm({ currentEmail, emailVerified }: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);

  const isVerified = !!emailVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newEmail || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (newEmail === currentEmail) {
      setError("The new email must be different from your current email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, password }),
      });

      let data: any = {};
      try { data = await res.json(); } catch {}

      if (!res.ok) {
        setError(data.error || "Failed to update email. Please try again.");
      } else {
        setSuccess("Email updated successfully. Please log in again to apply the changes.");
        setNewEmail("");
        setPassword("");
        setShowForm(false);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-6 mt-8 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
            Email Address
          </h2>
          <p className="font-sans text-sm text-cm-text-secondary mt-1">
            Manage your login email and verification status.
          </p>
        </div>
        {/* Verification badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 border-2 shrink-0 text-[10px] font-black uppercase tracking-widest ${
          isVerified
            ? "border-[#00FF00]/30 bg-[#00FF00]/10 text-[#00FF00]"
            : "border-[#F5E000]/30 bg-[#F5E000]/10 text-[#F5E000]"
        }`}>
          {isVerified
            ? <><ShieldCheck size={14} /> Verified</>
            : <><ShieldAlert size={14} /> Unverified</>
          }
        </div>
      </div>

      {/* Current email display */}
      <div className="flex items-center gap-3 p-4 border-2 border-white/10 bg-white/5">
        <Mail size={16} className="text-white/40 shrink-0" />
        <span className="font-sans text-sm font-bold text-white tracking-tight">{currentEmail}</span>
      </div>

      {!isVerified && (
        <p className="font-sans text-[11px] text-[#F5E000]/70 leading-relaxed">
          ⚠ Your email is not verified yet. Check your inbox for the verification link.
        </p>
      )}

      {/* Toggle form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="btn-secondary text-sm"
        >
          Change Email Address
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t-2 border-white/10">
          <p className="font-sans text-[11px] text-white/40 uppercase tracking-widest">
            Enter your new email and confirm your current password.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="label" htmlFor="newEmail">New Email</label>
              <input
                id="newEmail"
                type="email"
                className="input"
                placeholder="your@newemail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="emailPassword">Current Password</label>
              <input
                id="emailPassword"
                type="password"
                className="input"
                placeholder="Confirm your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              {error && (
                <p className="text-danger text-sm font-medium flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </p>
              )}
              {success && (
                <p className="text-ok text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 size={16} /> {success}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(""); setSuccess(""); }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Update Email
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
