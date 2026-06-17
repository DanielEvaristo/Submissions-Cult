import { useState, useEffect } from "react";
import { Music, Star, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";

export type Status =
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "PUBLISHED"
  | "REJECTED";

export interface QueueItem {
  id: string;
  trackTitle: string;
  artistName: string;
  opportunity: string;
  autoFilledCover: string | null;
  placement: string | null;
  publicationUrl: string | null;
  interviewUrl: string | null;
  articleUrl: string | null;
  masterReviewedAt: string | null;
  assignedPremiumServices: string[];
  premiumServicesPaid: boolean;
  user: { name: string | null; email: string | null };
}

export interface ArtistData {
  country: string | null;
  city: string | null;
  bio: string | null;
  roleType: string;
  ageRange: string | null;
  musicLanguages: string[];
  careerStartYear: number | null;
  monthlyListeners: string | null;
  state: string | null;
  hasManager: boolean;
  spotifyUrl: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  soundcloudUrl: string | null;
  website: string | null;
}

export interface Submission {
  id: string;
  trackTitle: string;
  artistName: string;
  opportunity: Opportunity;
  status: Status;
  masterCuratorId: string | null;
  channels: string[];
  premiumServices: string[];
  genres: string[];
  subgenres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  pitch: string | null;
  fastTrack: boolean;
  fastTrackDeadline: string | null;
  reviewRequested: boolean;
  premiumPrStatus: string;
  submittedAt: string;
  curatorNotes: string | null;
  curatorRating: number | null;
  curatorReviewedAt: string | null;
  user: ArtistData;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const OPP_COLORS: Record<Opportunity, string> = {
  WEEKLY: "bg-black text-white px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  SPOTIFY: "bg-[#F5E000] text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  WEBRADIO: "border-2 border-black text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  ALBUM_STORY: "bg-black text-[#F5E000] px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });

export function useCountdown(deadline: string | null) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; expired: boolean } | null>(null);

  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = new Date(deadline).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      const totalSeconds = Math.floor(diff / 1000);
      setTimeLeft({
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60,
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return timeLeft;
}

// ─── Shared Components ────────────────────────────────────────────────────────

export function SubmissionItem({ 
  sub, 
  selected, 
  onClick 
}: { 
  sub: Submission; 
  selected: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 transition-all border-l-[12px] ${
        selected 
          ? "bg-[#F5E000] text-black border-l-black" 
          : "bg-black text-white border-l-transparent hover:bg-white/5"
      }`}
    >
      <div className="flex gap-4">
        <div className={`w-14 h-14 bg-black shrink-0 overflow-hidden border-2 border-black flex items-center justify-center ${selected ? 'border-black' : ''}`}>
          {sub.autoFilledCover ? (
            <img src={sub.autoFilledCover} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music size={20} className={selected ? 'text-[#F5E000]' : 'text-white'} strokeWidth={3} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-base font-black uppercase tracking-tighter truncate leading-none mb-1">
            {sub.trackTitle}
          </p>
          <p className="font-sans text-xs font-bold uppercase tracking-widest opacity-60 truncate">
            {sub.artistName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {sub.reviewRequested && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#F5E000] text-black">
                ✍ DETAILED REVIEW
              </span>
            )}
            {sub.premiumServices?.length > 0 && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white text-black">
                🎙️ PREMIUM PR REQ.
              </span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border ${selected ? 'bg-black text-[#F5E000] border-black' : 'bg-[#F5E000] text-black border-black'}`}>
              L1 APPROVED
            </span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest opacity-40 flex items-center gap-1">
              <Star size={10} className="fill-black" strokeWidth={0} /> {sub.curatorRating}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

export function PriorityItem({
  sub,
  selected,
  onClick,
}: {
  sub: Submission;
  selected: boolean;
  onClick: () => void;
}) {
  const countdown = useCountdown(sub.fastTrackDeadline);
  const hoursLeft = countdown ? countdown.hours : null;

  const countdownColor =
    countdown?.expired
      ? "text-[#FF0000] animate-pulse"
      : hoursLeft !== null && hoursLeft < 4
      ? "text-[#FF0000] animate-pulse"
      : hoursLeft !== null && hoursLeft < 12
      ? "text-[#F5E000]"
      : "text-green-400";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 transition-all border-l-[6px] relative overflow-hidden ${
        selected
          ? "bg-[#FF0000] text-white border-l-white"
          : "bg-[#FF0000]/10 text-white border-l-[#FF0000] hover:bg-[#FF0000]/20"
      }`}
    >
      <div className="flex gap-4 items-start">
        {/* Cover */}
        <div className="w-12 h-12 shrink-0 overflow-hidden bg-black flex items-center justify-center">
          {sub.autoFilledCover
            ? <img src={sub.autoFilledCover} alt="" className="w-full h-full object-cover" />
            : <Music size={18} className="text-[#FF0000]" strokeWidth={3} />}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-black uppercase tracking-tight truncate leading-none mb-0.5">
            {sub.trackTitle}
          </p>
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-60 truncate mb-2">
            {sub.artistName}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {sub.fastTrack && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#FF0000] text-white">
                ⚡ FAST TRACK 48H
              </span>
            )}
            {sub.reviewRequested && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#F5E000] text-black">
                ✍ DETAILED REVIEW
              </span>
            )}
            {sub.premiumServices?.length > 0 && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-white text-black">
                🎙️ PREMIUM PR REQ.
              </span>
            )}
          </div>

          {/* Countdown */}
          {sub.fastTrackDeadline && countdown && (
            <div className={`font-mono text-xs font-black ${countdownColor}`}>
              {countdown.expired
                ? "⛔ EXPIRED"
                : `⏱ ${String(countdown.hours).padStart(2, "0")}:${String(countdown.minutes).padStart(2, "0")}:${String(countdown.seconds).padStart(2, "0")} LEFT`}
            </div>
          )}
          {sub.reviewRequested && !sub.fastTrackDeadline && (
            <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#F5E000]/60">
              Written review required
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function PremiumItem({
  sub,
  selected,
  onClick,
}: {
  sub: Submission;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 transition-all border-l-[6px] relative overflow-hidden ${
        selected
          ? "bg-[#FF00FF] text-white border-l-white"
          : "bg-[#FF00FF]/10 text-white border-l-[#FF00FF] hover:bg-[#FF00FF]/20"
      }`}
    >
      <div className="flex gap-4 items-start">
        {/* Cover */}
        <div className="w-12 h-12 shrink-0 overflow-hidden bg-black flex items-center justify-center">
          {sub.autoFilledCover
            ? <img src={sub.autoFilledCover} alt="" className="w-full h-full object-cover" />
            : <Music size={18} className="text-[#FF00FF]" strokeWidth={3} />}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-black uppercase tracking-tight truncate leading-none mb-0.5">
            {sub.trackTitle}
          </p>
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-60 truncate mb-2">
            {sub.artistName}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#FF00FF] text-white">
              🎙️ PREMIUM PR: {sub.premiumPrStatus}
            </span>
            {sub.fastTrack && (
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#FF0000] text-white">
                ⚡ FAST TRACK
              </span>
            )}
          </div>
          {sub.premiumServices?.length > 0 && (
            <p className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#FF00FF]/80">
              Services: {sub.premiumServices.join(", ")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center text-sm font-sans">
      <span className="text-cm-text-secondary">{label}</span>
      <span className="text-cm-text-primary font-medium text-right ml-2">{value}</span>
    </div>
  );
}

export function buildUrl(label: string, url: string): string | null {
  const val = url?.trim() ?? "";
  if (!val || val.toLowerCase() === "n/a") return null;
  // Already a full URL
  if (/^https?:\/\//i.test(val)) return val;
  // Strip leading @ for platforms that use it
  const username = val.startsWith("@") ? val.slice(1) : val;
  const bases: Record<string, string> = {
    Instagram:  "https://www.instagram.com/",
    TikTok:     "https://www.tiktok.com/@",
    YouTube:    "https://www.youtube.com/@",
    Spotify:    "https://open.spotify.com/artist/",
    SoundCloud: "https://soundcloud.com/",
    Website:    "https://",
  };
  const base = bases[label];
  if (base) return base + username;
  return null;
}

export function LinkRow({ label, url }: { label: string; url: string }) {
  const href = buildUrl(label, url);
  if (!href) return null;
  return (
    <a 
      href={href} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex justify-between items-center text-sm font-sans text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-elevated p-1 -mx-1 rounded transition-colors"
    >
      <span>{label}</span>
      <ExternalLink size={12} />
    </a>
  );
}
