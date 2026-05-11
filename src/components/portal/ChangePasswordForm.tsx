"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ChangePasswordForm() {
  const t = useTranslations("changePassword");
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update password");
      } else {
        setSuccess(t("success"));
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card space-y-6 mt-8 w-full">
      <div>
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">
          {t("title")}
        </h2>
        <p className="font-sans text-sm text-cm-text-secondary mt-2">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="label" htmlFor="currentPassword">
              {t("currentPassword")}
            </label>
            <input
              id="currentPassword"
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="newPassword">
              {t("newPassword")}
            </label>
            <input
              id="newPassword"
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">
              {t("confirmNewPassword")}
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 pb-4">
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
          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[150px] flex justify-center items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {t("button")}
          </button>
        </div>
      </form>
    </div>
  );
}
