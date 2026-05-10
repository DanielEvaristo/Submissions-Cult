"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";

export default function ArtistForm() {
  const router = useRouter();
  const locale = useLocale();

  const [form, setForm] = useState({
    artistName: "",
    genre: "",
    subgenre: "",
    spotifyUrl: "",
    instagram: "",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/industry/artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create artist");
      }

      router.push(`/${locale}/industry/artists`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-bg-surface p-6 rounded-2xl border border-border shadow-sm">
      
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="artistName">Artist Name *</label>
          <input
            id="artistName"
            type="text"
            className="input"
            placeholder="e.g. The Beatles"
            value={form.artistName}
            onChange={(e) => set("artistName", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="genre">Primary Genre</label>
            <input
              id="genre"
              type="text"
              className="input"
              placeholder="e.g. Rock"
              value={form.genre}
              onChange={(e) => set("genre", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="subgenre">Subgenre</label>
            <input
              id="subgenre"
              type="text"
              className="input"
              placeholder="e.g. Classic Rock"
              value={form.subgenre}
              onChange={(e) => set("subgenre", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="spotifyUrl">Spotify URL</label>
            <input
              id="spotifyUrl"
              type="url"
              className="input"
              placeholder="https://open.spotify.com/artist/..."
              value={form.spotifyUrl}
              onChange={(e) => set("spotifyUrl", e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="instagram">Instagram Username</label>
            <input
              id="instagram"
              type="text"
              className="input"
              placeholder="@thebeatles"
              value={form.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="notes">Internal Notes</label>
          <textarea
            id="notes"
            className="input min-h-[100px] resize-none"
            placeholder="Any internal notes or PR details about this artist..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-md border border-danger/30 bg-danger/10 font-sans text-sm font-medium text-danger flex items-center gap-2">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-border">
        <button type="submit" disabled={loading} className="btn-primary min-w-[150px] flex justify-center items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Saving..." : "Add Artist"}
        </button>
      </div>
    </form>
  );
}
