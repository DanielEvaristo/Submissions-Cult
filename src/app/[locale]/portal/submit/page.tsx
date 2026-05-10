"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Music,
  Radio,
  ListMusic,
  BookOpen,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";
type ReleaseType = "SINGLE" | "EP" | "ALBUM";

interface FormData {
  // Step 1
  opportunity: Opportunity | "";
  // Step 2
  streamingUrl: string;
  streamingPlatform: string;
  trackTitle: string;
  artistName: string;
  releaseType: ReleaseType | "";
  releaseDate: string;
  genre: string;
  subgenre: string;
  pitch: string;
  pressKitUrl: string;
  // Auto-fill metadata
  autoFilledTitle: string;
  autoFilledArtist: string;
  autoFilledCover: string;
  autoFillSource: string;
}

const INITIAL: FormData = {
  opportunity: "",
  streamingUrl: "",
  streamingPlatform: "",
  trackTitle: "",
  artistName: "",
  releaseType: "",
  releaseDate: "",
  genre: "",
  subgenre: "",
  pitch: "",
  pressKitUrl: "",
  autoFilledTitle: "",
  autoFilledArtist: "",
  autoFilledCover: "",
  autoFillSource: "",
};

const GENRES = [
  "Rock", "Electronic", "Hip-Hop", "R&B / Soul", "Pop",
  "Folk / Acoustic", "Latin", "Jazz", "Metal", "Ambient / Experimental", "Other",
];

const OPPORTUNITIES: {
  key: Opportunity;
  icon: React.ElementType;
  locked?: boolean;
}[] = [
  { key: "WEEKLY", icon: Music },
  { key: "SPOTIFY", icon: ListMusic },
  { key: "WEBRADIO", icon: Radio },
  { key: "ALBUM_STORY", icon: BookOpen, locked: true },
];

const RELEASE_TYPES: ReleaseType[] = ["SINGLE", "EP", "ALBUM"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SubmitPage() {
  const t = useTranslations("submit");
  const locale = useLocale();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [autoFillError, setAutoFillError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  // ─── Auto-fill from streaming URL ─────────────────────────────────────────

  const handleAutoFill = async () => {
    if (!form.streamingUrl.trim()) return;
    setFetchingInfo(true);
    setAutoFillError("");
    try {
      const res = await fetch(
        `/api/track-info?url=${encodeURIComponent(form.streamingUrl)}`
      );
      if (!res.ok) {
        setAutoFillError(t("autoFillFailed"));
        return;
      }
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        trackTitle: data.title || prev.trackTitle,
        artistName: data.artist || prev.artistName,
        autoFilledTitle: data.title || "",
        autoFilledArtist: data.artist || "",
        autoFilledCover: data.cover || "",
        autoFillSource: data.source || "",
        streamingPlatform: data.platform || "",
      }));
    } catch {
      setAutoFillError(t("autoFillFailed"));
    } finally {
      setFetchingInfo(false);
    }
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const canNext = (): boolean => {
    if (step === 1) return !!form.opportunity;
    if (step === 2)
      return (
        !!form.streamingUrl &&
        !!form.trackTitle &&
        !!form.artistName &&
        !!form.releaseType &&
        !!form.genre
      );
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunity: form.opportunity,
          streamingUrl: form.streamingUrl,
          streamingPlatform: form.streamingPlatform || null,
          trackTitle: form.trackTitle,
          artistName: form.artistName,
          releaseType: form.releaseType,
          releaseDate: form.releaseDate || null,
          genre: form.genre,
          subgenre: form.subgenre || null,
          pitch: form.pitch || null,
          pressKitUrl: form.pressKitUrl || null,
          autoFilledTitle: form.autoFilledTitle || null,
          autoFilledArtist: form.autoFilledArtist || null,
          autoFilledCover: form.autoFilledCover || null,
          autoFillSource: form.autoFillSource || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      setSubmissionId(data.id);
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success screen ───────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
        <CheckCircle2 size={48} className="text-ok mb-6" />
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary mb-3 tracking-tight">
          {t("thankYou")}
        </h1>
        <p className="font-sans text-base text-cm-text-secondary text-center max-w-sm mb-10">
          {t("thankYouMessage")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm(INITIAL);
              setStep(1);
              setSubmitted(false);
            }}
            className="btn-ghost"
          >
            {t("submitAnother") ?? "Submit another"}
          </button>
          <button
            onClick={() => router.push(`/${locale}/portal/submissions`)}
            className="btn-primary"
          >
            {t("viewSubmissions") ?? "View my submissions"}
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary mb-2">
          {t(`step${step}` as "step1" | "step2" | "step3")}
        </p>
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          {t("title")}
        </h1>

        {/* Step progress dots */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 transition-all duration-300 ${
                n <= step ? "bg-accent-red" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 1: Choose Opportunity ── */}
      {step === 1 && (
        <div className="space-y-3 animate-fade-in">
          {OPPORTUNITIES.map(({ key, icon: Icon, locked }) => {
            const active = form.opportunity === key;
            return (
              <button
                key={key}
                id={`opp-${key.toLowerCase()}`}
                type="button"
                disabled={locked}
                onClick={() => !locked && set("opportunity", key)}
                className={`w-full flex items-start gap-4 p-5 border rounded-xl text-left transition-all duration-200 shadow-sm ${
                  locked
                    ? "border-border bg-bg-surface opacity-50 cursor-not-allowed"
                    : active
                    ? "border-accent-red bg-accent-red/10 ring-1 ring-accent-red/20"
                    : "border-border bg-bg-surface hover:border-cm-text-muted hover:bg-bg-elevated"
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${active ? "bg-accent-red text-white" : "bg-bg-elevated text-cm-text-secondary"}`}>
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className={`font-sans text-base font-bold mb-1 ${active ? "text-cm-text-primary" : "text-cm-text-primary"}`}>
                    {t(`opportunities.${key}`)}
                  </p>
                  <p className="font-sans text-sm text-cm-text-secondary leading-relaxed">
                    {locked
                      ? t(`opportunities.ALBUM_STORY_locked`)
                      : t(`opportunities.${key}_desc`)}
                  </p>
                </div>
                {active && (
                  <CheckCircle2 size={16} className="text-accent-red shrink-0 ml-auto mt-0.5" />
                )}
              </button>
            );
          })}

          <p className="font-sans text-xs font-semibold text-ok uppercase tracking-wider mt-6">
            ✓ {t("freeSubmission")}
          </p>
        </div>
      )}

      {/* ── STEP 2: Track Details ── */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          {/* Streaming URL + auto-fill */}
          <div>
            <label className="label" htmlFor="streamingUrl">
              {t("streamingUrl")} *
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <LinkIcon
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-cm-text-muted"
                />
                <input
                  id="streamingUrl"
                  type="url"
                  className="input pl-8"
                  placeholder="https://open.spotify.com/track/... or deezer.com/track/..."
                  value={form.streamingUrl}
                  onChange={(e) => {
                    set("streamingUrl", e.target.value);
                    setAutoFillError("");
                  }}
                  onBlur={handleAutoFill}
                />
              </div>
              <button
                type="button"
                onClick={handleAutoFill}
                disabled={fetchingInfo || !form.streamingUrl}
                className="btn-ghost shrink-0 flex items-center gap-1.5 disabled:opacity-40"
              >
                {fetchingInfo ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : null}
                {fetchingInfo ? t("fetchingInfo") : "Auto-fill"}
              </button>
            </div>
            <p className="font-sans text-[11px] text-cm-text-muted mt-1">
              {t("streamingUrlHint")}
            </p>
            {autoFillError && (
              <p className="flex items-center gap-1.5 font-sans text-[11px] text-warning mt-1">
                <AlertCircle size={11} /> {autoFillError}
              </p>
            )}
          </div>

          {/* Auto-fill cover preview */}
          {form.autoFilledCover && (
            <div className="flex items-center gap-4 p-4 rounded-xl border border-ok/30 bg-ok/10 shadow-sm">
              <img
                src={form.autoFilledCover}
                alt="cover"
                className="w-16 h-16 rounded-md object-cover shadow-sm"
              />
              <div>
                <p className="font-sans text-base font-bold text-cm-text-primary">{form.autoFilledTitle}</p>
                <p className="font-sans text-sm text-cm-text-secondary mt-0.5">{form.autoFilledArtist}</p>
              </div>
            </div>
          )}

          {/* Track title */}
          <div>
            <label className="label" htmlFor="trackTitle">{t("trackTitle")} *</label>
            <input id="trackTitle" type="text" className="input"
              value={form.trackTitle} onChange={(e) => set("trackTitle", e.target.value)} required />
          </div>

          {/* Artist name */}
          <div>
            <label className="label" htmlFor="artistName">{t("artistName")} *</label>
            <input id="artistName" type="text" className="input"
              value={form.artistName} onChange={(e) => set("artistName", e.target.value)} required />
          </div>

          {/* Release type */}
          <div>
            <label className="label">{t("releaseType")} *</label>
            <div className="flex gap-2">
              {RELEASE_TYPES.map((rt) => (
                <button
                  key={rt}
                  type="button"
                  onClick={() => set("releaseType", rt)}
                  className={`flex-1 py-3 border rounded-lg font-sans text-sm font-medium transition-all shadow-sm ${
                    form.releaseType === rt
                      ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20"
                      : "border-border bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:border-cm-text-muted"
                  }`}
                >
                  {t(`releaseTypes.${rt}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Release date */}
          <div>
            <label className="label" htmlFor="releaseDate">{t("releaseDate")}</label>
            <input id="releaseDate" type="date" className="input"
              value={form.releaseDate} onChange={(e) => set("releaseDate", e.target.value)} />
          </div>

          {/* Genre */}
          <div>
            <label className="label">{t("genre")} *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set("genre", g)}
                  className={`px-3 py-2.5 border rounded-md text-left transition-all font-sans text-sm font-medium shadow-sm ${
                    form.genre === g
                      ? "border-accent-red bg-accent-red/10 text-cm-text-primary ring-1 ring-accent-red/20"
                      : "border-border bg-bg-surface text-cm-text-secondary hover:bg-bg-elevated hover:border-cm-text-muted"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Subgenre */}
          <div>
            <label className="label" htmlFor="subgenre">{t("subgenre")}</label>
            <input id="subgenre" type="text" className="input"
              placeholder="e.g. Dream Pop, Lo-fi Hip-Hop"
              value={form.subgenre} onChange={(e) => set("subgenre", e.target.value)} />
          </div>

          {/* Pitch */}
          <div>
            <label className="label" htmlFor="pitch">
              {t("pitch")}
              <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">
                {form.pitch.length}/1000
              </span>
            </label>
            <textarea
              id="pitch"
              className="input min-h-[120px] resize-none"
              placeholder={t("pitchHint")}
              maxLength={1000}
              value={form.pitch}
              onChange={(e) => set("pitch", e.target.value)}
            />
          </div>

          {/* Press kit URL */}
          <div>
            <label className="label" htmlFor="pressKitUrl">{t("pressKitUrl")}</label>
            <input id="pressKitUrl" type="url" className="input"
              placeholder="https://..."
              value={form.pressKitUrl} onChange={(e) => set("pressKitUrl", e.target.value)} />
          </div>
        </div>
      )}

      {/* ── STEP 3: Review & Confirm ── */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="card space-y-4">
            <ReviewRow label={t("step1")} value={t(`opportunities.${form.opportunity as Opportunity}`)} />
            <ReviewRow label={t("trackTitle")} value={form.trackTitle} />
            <ReviewRow label={t("artistName")} value={form.artistName} />
            <ReviewRow label={t("releaseType")} value={t(`releaseTypes.${form.releaseType as ReleaseType}`)} />
            {form.releaseDate && <ReviewRow label={t("releaseDate")} value={form.releaseDate} />}
            <ReviewRow label={t("genre")} value={[form.genre, form.subgenre].filter(Boolean).join(" / ")} />
            <ReviewRow label={t("streamingUrl")} value={form.streamingUrl} truncate />
            {form.pitch && <ReviewRow label={t("pitch")} value={form.pitch} truncate />}
            {form.pressKitUrl && <ReviewRow label={t("pressKitUrl")} value={form.pressKitUrl} truncate />}
          </div>

          {/* Cover art if auto-filled */}
          {form.autoFilledCover && (
            <div className="flex items-center gap-4">
              <img src={form.autoFilledCover} alt="cover" className="w-20 h-20 rounded-md object-cover border border-border shadow-sm" />
              <div>
                <p className="font-sans text-xs font-bold text-cm-text-muted uppercase tracking-wider mb-1">Auto-filled cover</p>
                <p className="font-sans text-base font-medium text-cm-text-secondary">{form.autoFilledArtist} — <span className="font-bold text-cm-text-primary">{form.autoFilledTitle}</span></p>
              </div>
            </div>
          )}

          <p className="font-sans text-xs font-semibold text-ok uppercase tracking-wider mt-6">
            ✓ {t("freeSubmission")}
          </p>

          {error && (
            <div className="px-4 py-3 rounded-md border border-danger/30 bg-danger/10 font-sans text-sm font-medium text-danger shadow-sm mt-4">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="mt-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => { setStep((s) => s - 1); setError(""); }}
          disabled={step === 1}
          className="btn-ghost flex items-center gap-1 text-cm-text-secondary disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>

        {step < 3 ? (
          <button
            type="button"
            id={`submit-next-${step}`}
            onClick={() => setStep((s) => s + 1)}
            disabled={!canNext()}
            className="btn-primary flex items-center gap-2 disabled:opacity-40"
          >
            {step === 2 ? t("step3") : "Next"}
            <ChevronRight size={14} />
          </button>
        ) : (
          <button
            id="submit-confirm"
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {t("step3")} →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function ReviewRow({
  label,
  value,
  truncate,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary shrink-0">
        {label}
      </p>
      <p className={`font-sans text-sm font-medium text-cm-text-primary text-right ${truncate ? "truncate max-w-[60%]" : ""}`}>
        {value || "—"}
      </p>
    </div>
  );
}
