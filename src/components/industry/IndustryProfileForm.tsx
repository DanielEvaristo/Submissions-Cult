"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

interface ProfileData {
  legalName: string;
  roleType: string;
  websiteUrl: string;
  labelInstagram: string;
  country: string;
  city: string;
  bio: string;
  isVerifiedLabel: boolean;
  labelStatus: string;
}

const INITIAL: ProfileData = {
  legalName: "",
  roleType: "MANAGEMENT",
  websiteUrl: "",
  labelInstagram: "",
  country: "",
  city: "",
  bio: "",
  isVerifiedLabel: false,
  labelStatus: "PENDING_VERIFICATION",
};

export default function IndustryProfileForm() {
  const [form, setForm] = useState<ProfileData>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/industry/profile")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setForm({
            legalName: data.legalName || "",
            roleType: data.roleType || "MANAGEMENT",
            websiteUrl: data.websiteUrl || "",
            labelInstagram: data.labelInstagram || "",
            country: data.country || "",
            city: data.city || "",
            bio: data.bio || "",
            isVerifiedLabel: data.isVerifiedLabel || false,
            labelStatus: data.labelStatus || "PENDING_VERIFICATION",
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/industry/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-cm-text-muted" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-bg-surface p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
      
      {/* Verification Status */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-bg-elevated border border-border mb-6">
        <div className={`p-2 rounded-full shrink-0 ${form.isVerifiedLabel ? "bg-ok/10 text-ok" : "bg-warning/10 text-warning"}`}>
          {form.isVerifiedLabel ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
        </div>
        <div>
          <p className="font-sans text-sm font-bold uppercase tracking-wider text-cm-text-secondary mb-1">
            Verification Status
          </p>
          <p className={`font-sans text-lg font-bold ${form.isVerifiedLabel ? "text-ok" : "text-warning"}`}>
            {form.labelStatus.replace("_", " ")}
          </p>
          {!form.isVerifiedLabel && (
            <p className="font-sans text-xs text-cm-text-muted mt-1">
              We are currently reviewing your account. You can still manage artists and submit tracks.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="legalName">Agency / Label Name *</label>
          <input
            id="legalName"
            type="text"
            className="input"
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="roleType">Primary Role</label>
          <select
            id="roleType"
            className="input"
            value={form.roleType}
            onChange={(e) => set("roleType", e.target.value)}
          >
            <option value="AGENCY">Record Label / Agency</option>
            <option value="MANAGEMENT">Management</option>
            <option value="PR">Public Relations (PR)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="country">Country</label>
          <input
            id="country"
            type="text"
            className="input"
            placeholder="e.g. United States"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="city">City</label>
          <input
            id="city"
            type="text"
            className="input"
            placeholder="e.g. Los Angeles"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="label" htmlFor="websiteUrl">Website URL</label>
          <input
            id="websiteUrl"
            type="url"
            className="input"
            placeholder="https://youragency.com"
            value={form.websiteUrl}
            onChange={(e) => set("websiteUrl", e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="labelInstagram">Instagram Username</label>
          <input
            id="labelInstagram"
            type="text"
            className="input"
            placeholder="@youragency"
            value={form.labelInstagram}
            onChange={(e) => set("labelInstagram", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="bio">
          Company Bio
          <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">
            {form.bio.length}/500
          </span>
        </label>
        <textarea
          id="bio"
          className="input min-h-[120px] resize-none"
          placeholder="Tell us about your agency, the genres you focus on, and your vision..."
          maxLength={500}
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-md border border-danger/30 bg-danger/10 font-sans text-sm font-medium text-danger flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="px-4 py-3 rounded-md border border-ok/30 bg-ok/10 font-sans text-sm font-medium text-ok flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          Profile updated successfully!
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <button type="submit" disabled={saving} className="btn-primary min-w-[150px] flex justify-center items-center gap-2">
          {saving && <Loader2 size={16} className="animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
