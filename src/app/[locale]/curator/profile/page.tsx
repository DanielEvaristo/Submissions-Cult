"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Loader2, Save } from "lucide-react";

export default function CuratorProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    name: "",
    bio: "",
    country: "",
  });

  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  // Password state
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    // Fetch current user data from a generic endpoint, or just use session for now.
    // For a deeper profile, we could fetch from DB. 
    // For simplicity, we'll initialize from session if available.
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        bio: (session.user as any).bio || "",
        country: session.user.country || "",
      });
      setFetching(false);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Reusing the artist profile endpoint since it updates the generic User table
      // It handles name, bio, country natively.
      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          bio: form.bio,
          country: form.country,
          roleType: "ARTIST" // To pass validation if needed, though they are a curator
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await update({ name: form.name, bio: form.bio, country: form.country });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMessage(null);

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update password");
      }

      setPassMessage({ type: "success", text: "Password updated successfully" });
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPassMessage({ type: "error", text: err.message });
    } finally {
      setPassLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-cm-text-muted" size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          Curator Profile
        </h1>
        <p className="font-sans text-base text-cm-text-secondary mt-2">
          Update your personal details. This information is internal.
        </p>
      </div>

      <div className="bg-bg-surface border border-border rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="input"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="Your Name"
            />
          </div>

          <div>
            <label className="label" htmlFor="country">Country</label>
            <input
              id="country"
              type="text"
              className="input"
              value={form.country}
              onChange={e => setForm({...form, country: e.target.value})}
              placeholder="e.g. MX, US, FR"
            />
          </div>

          <div>
            <label className="label" htmlFor="bio">Bio / Internal Notes</label>
            <textarea
              id="bio"
              className="input min-h-[120px]"
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              placeholder="Tell us a bit about your musical background..."
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md font-sans text-sm font-medium border ${
              message.type === "success" 
                ? "bg-ok/10 text-ok border-ok/20" 
                : "bg-danger/10 text-danger border-danger/20"
            }`}>
              {message.text}
            </div>
          )}

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Profile
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8 bg-bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary mb-6">Security</h2>
        
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="input max-w-md"
              required
              value={passForm.currentPassword}
              onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
            />
          </div>

          <div>
            <label className="label" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="input max-w-md"
              required
              minLength={6}
              value={passForm.newPassword}
              onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
            />
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              className="input max-w-md"
              required
              minLength={6}
              value={passForm.confirmPassword}
              onChange={e => setPassForm({...passForm, confirmPassword: e.target.value})}
            />
          </div>

          {passMessage && (
            <div className={`p-3 rounded-md font-sans text-sm font-medium border max-w-md ${
              passMessage.type === "success" 
                ? "bg-ok/10 text-ok border-ok/20" 
                : "bg-danger/10 text-danger border-danger/20"
            }`}>
              {passMessage.text}
            </div>
          )}

          <div className="pt-4 border-t border-border flex">
            <button
              type="submit"
              disabled={passLoading}
              className="btn-primary flex items-center gap-2"
            >
              {passLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
