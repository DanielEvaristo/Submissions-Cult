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
  fastTrack: boolean;
  fastTrackDeadline: string | null;
  reviewRequested: boolean;
  isMultiChannel: boolean;
  submittedAt: string;
  curatorNotes: string | null;
  curatorRating: number | null;
  user: ArtistData;
}

const OPP_COLORS: Record<Opportunity, string> = {
  WEEKLY: "bg-black text-white px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  SPOTIFY: "bg-[#F5E000] text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  WEBRADIO: "border-2 border-black text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  ALBUM_STORY: "bg-black text-[#F5E000] px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
};

export default function CuratorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"priority" | "inbox" | "history">("priority");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<Submission[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<"claim" | "approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/curator/submissions");
      if (res.ok) setSubmissions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/curator/history");
      if (res.ok) setHistory(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => { if (activeTab === "history") fetchHistory(); }, [activeTab, fetchHistory]);

  // Reset form when selection changes
  useEffect(() => {
    setRating(0);
    setNotes("");
    setError(null);
  }, [selectedId]);

  const selectedSub = submissions.find((s) => s.id === selectedId);

  // Since it's auto-assigned, we only care about submissions assigned to us
  const myQueueSubs = submissions.filter((s) => s.status === "IN_REVIEW" && s.curatorId === session?.user?.id);
  const prioritySubs = myQueueSubs.filter((s) => s.fastTrack)
    .sort((a, b) => {
      // Fast track with deadline first, sorted by deadline
      if (a.fastTrackDeadline && b.fastTrackDeadline) return new Date(a.fastTrackDeadline).getTime() - new Date(b.fastTrackDeadline).getTime();
      if (a.fastTrackDeadline) return -1;
      if (b.fastTrackDeadline) return 1;
      return 0;
    });
  const regularSubs = myQueueSubs.filter((s) => !s.fastTrack);

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
      
      {/* ── Left Column: Inbox + History Tabs ── */}
      <div className="w-1/3 min-w-[350px] border-r-4 border-white/10 bg-black flex flex-col h-full">
        {/* Header */}
        <div className="px-8 py-6 border-b-4 border-white/10 bg-black text-white shrink-0">
          <h1 className="font-sans text-4xl font-black uppercase tracking-tighter leading-none">CURATOR</h1>
        </div>
        {/* Tabs */}
        <div className="flex border-b-4 border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("priority")}
            className={`flex-1 py-4 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "priority"
                ? "bg-[#FF0000] text-white"
                : prioritySubs.length > 0
                ? "bg-[#FF0000]/20 text-[#FF0000] hover:bg-[#FF0000]/30"
                : "bg-black text-white/40 hover:text-white"
            }`}
          >
            PRIORITY ({prioritySubs.length})
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`flex-1 py-4 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "inbox" ? "bg-[#F5E000] text-black" : "bg-black text-white/40 hover:text-white"
            }`}
          >
            INBOX ({regularSubs.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "history" ? "bg-[#F5E000] text-black" : "bg-black text-white/40 hover:text-white"
            }`}
          >
            HISTORY
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* PRIORITY TAB */}
          {activeTab === "priority" && (
            loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-cm-text-muted" />
              </div>
            ) : prioritySubs.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <Inbox size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">NO PRIORITY QUEUE.</p>
              </div>
            ) : (
              prioritySubs.map((sub) => (
                <PriorityItem
                  key={sub.id}
                  sub={sub}
                  selected={selectedId === sub.id}
                  onClick={() => setSelectedId(sub.id)}
                />
              ))
            )
          )}

          {/* INBOX TAB */}
          {activeTab === "inbox" && (
            loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-cm-text-muted" />
              </div>
            ) : regularSubs.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <Inbox size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">INBOX_ZERO.</p>
              </div>
            ) : (
              regularSubs.map((sub) => (
                <SubmissionItem
                  key={sub.id}
                  sub={sub}
                  selected={selectedId === sub.id}
                  onClick={() => setSelectedId(sub.id)}
                  formatDate={formatDate}
                />
              ))
            )
          )}

          {/* HISTORY TAB */}
          {activeTab === "history" && (
            historyLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-cm-text-muted" />
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <Inbox size={48} className="mx-auto mb-4 opacity-10" />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">NO HISTORY YET.</p>
              </div>
            ) : (
              history.map((sub) => (
                <div key={sub.id} className={`p-4 border-l-4 ${
                  sub.status === "CURATOR_APPROVED" ? "border-[#F5E000] bg-[#F5E000]/5" : "border-[#FF0000] bg-[#FF0000]/5"
                }`}>
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 shrink-0 bg-white/5 overflow-hidden flex items-center justify-center">
                      {sub.autoFilledCover
                        ? <img src={sub.autoFilledCover} alt="" className="w-full h-full object-cover" />
                        : <Music size={14} className="text-[#F5E000]" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs font-black uppercase tracking-tight text-white truncate">{sub.trackTitle}</p>
                      <p className="font-sans text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{sub.artistName}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${
                          sub.status === "CURATOR_APPROVED"
                            ? "bg-[#F5E000] text-black"
                            : "bg-[#FF0000] text-white"
                        }`}>
                          {sub.status === "CURATOR_APPROVED" ? "APPROVED" : "REJECTED"}
                        </span>
                        {sub.curatorRating && (
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={8} className={s <= (sub.curatorRating || 0) ? "fill-[#F5E000] text-[#F5E000]" : "text-white/20"} strokeWidth={0} />
                            ))}
                          </div>
                        )}
                      </div>
                      {sub.curatorNotes && (
                        <p className="font-sans text-[9px] text-white/40 mt-1 italic truncate">"{sub.curatorNotes}"</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
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
            <div className="flex flex-col md:flex-row gap-8 items-start border-b-4 border-white/10 pb-10">
              <div className="w-48 h-48 shrink-0 bg-black border-4 border-white/20 overflow-hidden flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
                {selectedSub.autoFilledCover ? (
                  <img src={selectedSub.autoFilledCover} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <Music size={48} className="text-[#F5E000]" strokeWidth={3} />
                )}
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-4 mb-4">
                  <span className={OPP_COLORS[selectedSub.opportunity]}>
                    {selectedSub.opportunity ? selectedSub.opportunity.replace(/_/g, " ") : "GENERAL SUBMISSION"}
                  </span>
                  <span className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                    SUBMITTED {formatDate(selectedSub.submittedAt)}
                  </span>
                </div>
                <h2 className="font-sans text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase mb-4">
                  {selectedSub.trackTitle}
                </h2>
                <p className="font-sans text-2xl text-white font-black uppercase tracking-tight opacity-40">
                  {selectedSub.artistName}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {selectedSub.genres.map(g => (
                    <span key={g} className="px-3 py-1 border-2 border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60">
                      {g}
                    </span>
                  ))}
                  {selectedSub.subgenres.map(g => (
                    <span key={g} className="px-3 py-1 bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/10">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Listen Action */}
            <div className="p-8 border-4 border-white/10 bg-black flex items-center justify-between shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-[#F5E000] flex items-center justify-center text-black">
                  <Play size={32} className="ml-1" strokeWidth={3} />
                </div>
                <div>
                  <p className="font-sans text-2xl font-black uppercase tracking-tighter text-white">LISTEN TO TRACK</p>
                  <p className="font-sans text-xs font-bold text-white/20 uppercase tracking-widest truncate max-w-md">
                    {selectedSub.streamingUrl}
                  </p>
                </div>
              </div>
              <a 
                href={selectedSub.streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#F5E000] text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-white transition-all flex items-center gap-3 border-2 border-[#F5E000]"
              >
                OPEN <ExternalLink size={16} strokeWidth={3} />
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
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-6">
                    CURATOR EVALUATION
                  </h3>
                  
                  {selectedSub.status === "PENDING" ? (
                    <div className="p-12 border-4 border-white/10 bg-black text-center">
                      <p className="font-sans text-xs font-black uppercase tracking-widest text-white/20">
                        This submission has not been assigned to you.
                      </p>
                    </div>
                  ) : (
                    <div className="p-10 border-4 border-white/10 bg-black space-y-10 shadow-[12px_12px_0px_0px_rgba(245,224,0,0.05)]">
                      
                      {/* Rating */}
                      <div>
                        <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4">Quality Score *</label>
                        <div className="flex gap-4">
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className="p-1 transition-transform hover:scale-110 focus:outline-none"
                            >
                              <Star 
                                size={40} 
                                className={`${rating >= star ? "fill-[#F5E000] text-[#F5E000]" : "text-white/10"}`} 
                                strokeWidth={2.5}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4" htmlFor="curatorNotes">Internal Editorial Notes</label>
                        <textarea
                          id="curatorNotes"
                          className="w-full p-6 bg-[#F5F5F5] border-2 border-black focus:bg-white focus:outline-none font-sans text-sm font-bold uppercase tracking-tight min-h-[160px] transition-all text-black placeholder:text-black/30"
                          placeholder="WRITE YOUR FEEDBACK HERE..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-[#FF0000] text-white font-sans text-[10px] font-black uppercase tracking-[0.2em]">
                          {error}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-6 pt-6 border-t-2 border-black/5">
                        <button
                          onClick={() => handleAction("reject")}
                          disabled={actionLoading !== null}
                          className="flex-1 py-6 bg-white text-black border-2 border-black font-sans font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          {actionLoading === "reject" ? <Loader2 className="animate-spin" size={16}/> : <><XCircle size={18} strokeWidth={3} /> Reject</>}
                        </button>
                        <button
                          onClick={() => handleAction("approve")}
                          disabled={actionLoading !== null}
                          className="flex-1 py-6 bg-[#F5E000] text-black border-2 border-black font-sans font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          {actionLoading === "approve" ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle2 size={18} strokeWidth={3} /> Approve to Master</>}
                        </button>
                      </div>

                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar: Artist Info */}
              <div className="space-y-10">
                <section>
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-6">
                    ARTIST PROFILE
                  </h3>
                  <div className="p-8 border-4 border-white/10 bg-black space-y-6">
                    <InfoRow label="Location" value={[selectedSub.user.country, selectedSub.user.city].filter(Boolean).join(", ")} />
                    <InfoRow label="Artist Type" value={selectedSub.user.roleType} />
                    <InfoRow label="Est." value={selectedSub.user.careerStartYear?.toString()} />
                    <InfoRow label="Listeners" value={selectedSub.user.monthlyListeners?.replace(/_/g, " ")} />
                    <InfoRow label="IG Followers" value={selectedSub.user.instagramFollowers?.toLocaleString()} />
                    <InfoRow label="Manager" value={selectedSub.user.hasManager ? "YES" : "NO"} />
                    
                    {selectedSub.user.bio && (
                      <div className="pt-6 mt-6 border-t-2 border-black/5">
                        <p className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-black/40 mb-3">BIO</p>
                        <p className="font-sans text-xs font-bold uppercase tracking-tight text-black leading-relaxed">{selectedSub.user.bio}</p>
                      </div>
                    )}
                  </div>
                </section>
                
                <section>
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-black/40 mb-6">
                    CONNECTED LINKS
                  </h3>
                  <div className="p-8 border-4 border-black bg-black text-white space-y-4 shadow-[8px_8px_0px_0px_rgba(245,224,0,1)]">
                    {selectedSub.user.spotifyUrl && <LinkRow label="Spotify" url={selectedSub.user.spotifyUrl} />}
                    {selectedSub.user.instagram && <LinkRow label="Instagram" url={selectedSub.user.instagram} />}
                    {selectedSub.user.tiktok && <LinkRow label="TikTok" url={selectedSub.user.tiktok} />}
                    {selectedSub.user.youtube && <LinkRow label="YouTube" url={selectedSub.user.youtube} />}
                    {selectedSub.user.website && <LinkRow label="Website" url={selectedSub.user.website} />}
                    {!(selectedSub.user.spotifyUrl || selectedSub.user.instagram || selectedSub.user.tiktok || selectedSub.user.youtube || selectedSub.user.website) && (
                      <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40">No links provided.</p>
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
      className={`w-full text-left p-6 transition-all border-l-[12px] relative overflow-hidden ${
        selected 
          ? "bg-[#F5E000] text-black border-l-black" 
          : "bg-black text-white border-l-transparent hover:bg-white/5 hover:text-[#F5E000]"
      }`}
    >
      {sub.fastTrack && (
        <div className="absolute top-0 right-0 bg-[#FF0000] text-white text-[8px] font-black uppercase px-2 py-1 tracking-tighter">
          FAST RESPONSE
        </div>
      )}
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
          <div className="flex items-center gap-2 mt-3">
            {sub.reviewRequested && (
              <span className="text-[8px] font-black uppercase border border-black px-1 py-0.5 bg-white text-black">
                REVIEW REQUIRED
              </span>
            )}
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border ${selected ? 'bg-black text-[#F5E000] border-black' : 'bg-[#F5E000] text-black border-black'}`}>
              IN REVIEW
            </span>
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest opacity-40">
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

// ─── PriorityItem — Fast Track countdown card ─────────────────────────────────

function useCountdown(deadline: string | null) {
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

function PriorityItem({
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

