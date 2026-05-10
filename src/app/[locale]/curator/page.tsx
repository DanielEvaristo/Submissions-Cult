"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  Music, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Star,
  ExternalLink,
  Inbox
} from "lucide-react";

type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";

type Status = 
  | "PENDING"
  | "IN_REVIEW"
  | "CURATOR_APPROVED"
  | "CURATOR_REJECTED"
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "REJECTED";

interface ArtistData {
  country: string | null;
  city: string | null;
  bio: string | null;
  roleType: string;
  ageRange: string | null;
  musicLanguages: string[];
  careerStartYear: number | null;
  monthlyListeners: string | null;
  distributionMethod: string | null;
  hasManager: boolean;
  spotifyUrl: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  soundcloudUrl: string | null;
  website: string | null;
}

interface Submission {
  id: string;
  trackTitle: string;
  artistName: string;
  opportunity: Opportunity;
  status: Status;
  curatorId: string | null;
  genres: string[];
  subgenres: string[];
  autoFilledCover: string | null;
  streamingUrl: string;
  pitch: string | null;
  submittedAt: string;
  user: ArtistData;
}

const OPP_COLORS: Record<Opportunity, string> = {
  WEEKLY: "bg-bg-elevated text-cm-text-primary border border-border px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  SPOTIFY: "bg-ok/10 text-ok border border-ok/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  WEBRADIO: "bg-warn/10 text-warn border border-warn/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
  ALBUM_STORY: "bg-accent-red/10 text-accent-red border border-accent-red/20 px-2.5 py-1 rounded-md font-sans text-xs font-semibold",
};

export default function CuratorDashboard() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Review form state
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<"claim" | "approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/curator/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Reset form when selection changes
  useEffect(() => {
    setRating(0);
    setNotes("");
    setError(null);
  }, [selectedId]);

  const selectedSub = submissions.find((s) => s.id === selectedId);

  // Since it's auto-assigned, we only care about submissions assigned to us
  const myQueueSubs = submissions.filter((s) => s.status === "IN_REVIEW" && s.curatorId === session?.user?.id);

  const handleAction = async (action: "claim" | "approve" | "reject") => {
    if (!selectedSub) return;
    
    if ((action === "approve" || action === "reject") && rating === 0) {
      setError("Please provide a rating from 1 to 5 stars.");
      return;
    }

    setActionLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/curator/submissions/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes, rating })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process action");
      }

      // Success
      if (action === "approve" || action === "reject") {
        // Remove from list
        setSubmissions(prev => prev.filter(s => s.id !== selectedSub.id));
        setSelectedId(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });

  return (
    <div className="h-[calc(100vh-64px)] flex overflow-hidden">
      
      {/* ── Left Column: Inbox ── */}
      <div className="w-1/3 min-w-[350px] border-r border-border bg-bg-surface flex flex-col h-full">
        <div className="px-6 py-5 border-b border-border bg-bg-elevated/50">
          <h1 className="font-sans text-xl font-bold text-cm-text-primary">Curator Inbox</h1>
          <p className="font-sans text-sm text-cm-text-secondary mt-1">
            {myQueueSubs.length} tracks assigned to you
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={20} className="animate-spin text-cm-text-muted" />
            </div>
          ) : (
            <>
              {/* My Queue */}
              <div>
                <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-muted mb-3 px-2">
                  My Queue (In Review)
                </h2>
                {myQueueSubs.length === 0 ? (
                  <div className="text-center py-10 text-cm-text-muted px-4">
                    <Inbox size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="font-sans text-sm">Inbox zero! No assigned submissions.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {myQueueSubs.map((sub) => (
                      <SubmissionItem 
                        key={sub.id} 
                        sub={sub} 
                        selected={selectedId === sub.id}
                        onClick={() => setSelectedId(sub.id)}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right Column: Review Panel ── */}
      <div className="flex-1 bg-bg flex flex-col h-full overflow-y-auto">
        {!selectedSub ? (
          <div className="h-full flex items-center justify-center text-cm-text-muted">
            <div className="text-center">
              <Music size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-sans text-base">Select a submission to review</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full p-8 animate-fade-in space-y-8">
            
            {/* Header / Track Info */}
            <div className="flex gap-6 items-start">
              <div className="w-40 h-40 shrink-0 bg-bg-elevated border border-border rounded-xl overflow-hidden flex items-center justify-center shadow-lg">
                {selectedSub.autoFilledCover ? (
                  <img src={selectedSub.autoFilledCover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Music size={40} className="text-cm-text-muted" />
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-3 mb-3">
                  <span className={OPP_COLORS[selectedSub.opportunity]}>
                    {selectedSub.opportunity.replace(/_/g, " ")}
                  </span>
                  <span className="font-sans text-sm text-cm-text-secondary">
                    Submitted {formatDate(selectedSub.submittedAt)}
                  </span>
                </div>
                <h2 className="font-sans text-4xl font-bold text-cm-text-primary tracking-tight mb-2">
                  {selectedSub.trackTitle}
                </h2>
                <p className="font-sans text-xl text-cm-text-secondary font-medium">
                  {selectedSub.artistName}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedSub.genres.map(g => (
                    <span key={g} className="px-2 py-1 bg-bg-surface border border-border rounded text-xs text-cm-text-secondary uppercase">
                      {g}
                    </span>
                  ))}
                  {selectedSub.subgenres.map(g => (
                    <span key={g} className="px-2 py-1 bg-bg-surface border border-border rounded text-xs text-cm-text-secondary uppercase">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Listen Action */}
            <div className="p-5 border border-border bg-bg-surface rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-red/10 flex items-center justify-center text-accent-red">
                  <Play size={18} className="ml-1" />
                </div>
                <div>
                  <p className="font-sans font-bold text-cm-text-primary">Listen to Track</p>
                  <p className="font-sans text-sm text-cm-text-secondary truncate max-w-md">
                    {selectedSub.streamingUrl}
                  </p>
                </div>
              </div>
              <a 
                href={selectedSub.streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                Open <ExternalLink size={14} />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {selectedSub.pitch && (
                  <section>
                    <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-cm-text-muted mb-3">
                      Artist Pitch
                    </h3>
                    <div className="p-5 border border-border bg-bg-surface rounded-xl">
                      <p className="font-sans text-sm text-cm-text-primary leading-relaxed whitespace-pre-wrap">
                        {selectedSub.pitch}
                      </p>
                    </div>
                  </section>
                )}

                {/* Review Form */}
                <section>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-cm-text-muted mb-3">
                    Curator Evaluation
                  </h3>
                  
                  {selectedSub.status === "PENDING" ? (
                    <div className="p-8 border border-border bg-bg-surface rounded-xl text-center">
                      <p className="font-sans text-cm-text-primary mb-4">
                        This submission has not been assigned to you.
                      </p>
                    </div>
                  ) : (
                    <div className="p-6 border border-border bg-bg-surface rounded-xl space-y-6">
                      
                      {/* Rating */}
                      <div>
                        <label className="label mb-2">Rating *</label>
                        <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="p-2 transition-transform hover:scale-110 focus:outline-none"
                            >
                              <Star 
                                size={28} 
                                className={`${rating >= star ? "fill-accent-red text-accent-red" : "text-border"}`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="label" htmlFor="curatorNotes">Internal Notes</label>
                        <textarea
                          id="curatorNotes"
                          className="input min-h-[120px]"
                          placeholder="What did you think of the track? (These notes go to the Master Curator, the artist will not see them)"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-danger/10 text-danger border border-danger/20 rounded-md font-sans text-sm font-medium">
                          {error}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-4 pt-2 border-t border-border">
                        <button
                          onClick={() => handleAction("reject")}
                          disabled={actionLoading !== null}
                          className="flex-1 py-3 px-4 bg-bg-elevated hover:bg-danger/20 hover:text-danger border border-border hover:border-danger/30 rounded-lg transition-colors font-sans font-bold text-sm text-cm-text-secondary flex items-center justify-center gap-2"
                        >
                          {actionLoading === "reject" ? <Loader2 className="animate-spin" size={16}/> : <><XCircle size={16} /> Reject</>}
                        </button>
                        <button
                          onClick={() => handleAction("approve")}
                          disabled={actionLoading !== null}
                          className="flex-1 py-3 px-4 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-colors font-sans font-bold text-sm flex items-center justify-center gap-2"
                        >
                          {actionLoading === "approve" ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle2 size={16} /> Approve to Master</>}
                        </button>
                      </div>

                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar: Artist Info */}
              <div className="space-y-6">
                <section>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-cm-text-muted mb-3">
                    Artist Profile
                  </h3>
                  <div className="p-5 border border-border bg-bg-surface rounded-xl space-y-4">
                    <InfoRow label="Location" value={[selectedSub.user.country, selectedSub.user.city].filter(Boolean).join(", ")} />
                    <InfoRow label="Type" value={selectedSub.user.roleType} />
                    <InfoRow label="Started" value={selectedSub.user.careerStartYear?.toString()} />
                    <InfoRow label="Listeners" value={selectedSub.user.monthlyListeners?.replace(/_/g, " ")} />
                    <InfoRow label="Manager" value={selectedSub.user.hasManager ? "Yes" : "No"} />
                    
                    {selectedSub.user.bio && (
                      <div className="pt-4 mt-4 border-t border-border">
                        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary mb-2">Bio</p>
                        <p className="font-sans text-xs text-cm-text-primary line-clamp-4">{selectedSub.user.bio}</p>
                      </div>
                    )}
                  </div>
                </section>
                
                <section>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-cm-text-muted mb-3">
                    Links
                  </h3>
                  <div className="p-5 border border-border bg-bg-surface rounded-xl space-y-3">
                    {selectedSub.user.spotifyUrl && <LinkRow label="Spotify" url={selectedSub.user.spotifyUrl} />}
                    {selectedSub.user.instagram && <LinkRow label="Instagram" url={selectedSub.user.instagram} />}
                    {selectedSub.user.tiktok && <LinkRow label="TikTok" url={selectedSub.user.tiktok} />}
                    {selectedSub.user.youtube && <LinkRow label="YouTube" url={selectedSub.user.youtube} />}
                    {selectedSub.user.website && <LinkRow label="Website" url={selectedSub.user.website} />}
                    {!(selectedSub.user.spotifyUrl || selectedSub.user.instagram || selectedSub.user.tiktok || selectedSub.user.youtube || selectedSub.user.website) && (
                      <p className="font-sans text-xs text-cm-text-muted">No links provided.</p>
                    )}
                  </div>
                </section>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SubmissionItem({ 
  sub, 
  selected, 
  onClick, 
  formatDate 
}: { 
  sub: Submission; 
  selected: boolean; 
  onClick: () => void;
  formatDate: (iso: string) => string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected 
          ? "bg-accent-red/5 border-accent-red/30 ring-1 ring-accent-red/20 shadow-sm" 
          : "bg-bg-surface border-border hover:bg-bg-elevated hover:border-cm-text-muted/30"
      }`}
    >
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-md bg-bg-elevated shrink-0 overflow-hidden border border-border flex items-center justify-center">
          {sub.autoFilledCover ? (
            <img src={sub.autoFilledCover} alt="" className="w-full h-full object-cover" />
          ) : (
            <Music size={14} className="text-cm-text-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-bold text-cm-text-primary truncate">
            {sub.trackTitle}
          </p>
          <p className="font-sans text-xs text-cm-text-secondary truncate">
            {sub.artistName}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-accent-red/10 text-accent-red">
              In Review
            </span>
            <span className="font-sans text-[10px] text-cm-text-muted">
              {formatDate(sub.submittedAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center text-sm font-sans">
      <span className="text-cm-text-secondary">{label}</span>
      <span className="text-cm-text-primary font-medium text-right ml-2">{value}</span>
    </div>
  );
}

function LinkRow({ label, url }: { label: string; url: string }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex justify-between items-center text-sm font-sans text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-elevated p-1 -mx-1 rounded transition-colors"
    >
      <span>{label}</span>
      <ExternalLink size={12} />
    </a>
  );
}
