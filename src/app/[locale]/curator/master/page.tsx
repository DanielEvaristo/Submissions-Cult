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
  ShieldCheck,
  MessageSquare,
  Send,
  Link2,
  Lock
} from "lucide-react";

type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";

type Status = 
  | "MASTER_REVIEW"
  | "ACCEPTED"
  | "PUBLISHED"
  | "REJECTED";

interface QueueItem {
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

interface ArtistData {
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

interface Submission {
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
  submittedAt: string;
  curatorNotes: string | null;
  curatorRating: number | null;
  curatorReviewedAt: string | null;
  user: ArtistData;
}

const OPP_COLORS: Record<Opportunity, string> = {
  WEEKLY: "bg-black text-white px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  SPOTIFY: "bg-[#F5E000] text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  WEBRADIO: "border-2 border-black text-black px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
  ALBUM_STORY: "bg-black text-[#F5E000] px-2.5 py-1 font-sans text-[10px] font-black uppercase tracking-widest",
};

export default function MasterCuratorDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"priority" | "inbox" | "queue">("priority");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Publication queue state
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [queueLoading, setQueueLoading] = useState(false);
  const [publishModalId, setPublishModalId] = useState<string | null>(null);
  const [publishModalType, setPublishModalType] = useState<"regular" | "interview" | "article">("regular");
  const [publicationUrl, setPublicationUrl] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  
  // Review form state
  const [rating, setRating] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [selectedPremium, setSelectedPremium] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/master/submissions");
      if (res.ok) setSubmissions(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    try {
      const res = await fetch("/api/master/publications");
      if (res.ok) setQueue(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);
  useEffect(() => { if (activeTab === "queue") fetchQueue(); }, [activeTab, fetchQueue]);

  const handlePublish = async () => {
    if (!publishModalId || !publicationUrl) return;
    setPublishLoading(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/master/submissions/${publishModalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", publicationUrl, publishType: publishModalType }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to publish");
      }

      // Update the queue item locally with the new URL instead of removing it
      setQueue(prev => prev.map(q => {
        if (q.id !== publishModalId) return q;

        // Apply the new URL to the correct field
        const updated = { ...q };
        if (publishModalType === "interview") updated.interviewUrl = publicationUrl;
        else if (publishModalType === "article") updated.articleUrl = publicationUrl;
        else updated.publicationUrl = publicationUrl;

        // Check if ALL pending publish actions are now complete
        const regularDone = !!updated.publicationUrl;
        const interviewDone = !updated.assignedPremiumServices?.includes("INTERVIEW") || !!updated.interviewUrl;
        const articleDone = !updated.assignedPremiumServices?.includes("ARTICLE") || !!updated.articleUrl;

        // Return null if all done (we'll filter below), else return updated item
        return (regularDone && interviewDone && articleDone) ? null : updated;
      }).filter(Boolean) as QueueItem[]);

      setPublishModalId(null);
      setPublicationUrl("");
    } catch (err: any) {
      setPublishError(err.message);
    } finally {
      setPublishLoading(false);
    }
  };

  // Reset form when selection changes
  useEffect(() => {
    const sub = submissions.find((s) => s.id === selectedId);
    setRating(sub?.curatorRating || 0);
    setNotes(sub?.curatorNotes || "");
    
    // Always start deselected when loading the submission so the curator can explicitly select what to accept/assign
    setSelectedPlacements([]);
    setSelectedPremium([]);
    
    setError(null);
  }, [selectedId, submissions]);

  const selectedSub = submissions.find((s) => s.id === selectedId);

  const prioritySubs = submissions.filter((s) => s.fastTrack)
    .sort((a, b) => {
      if (a.fastTrackDeadline && b.fastTrackDeadline) return new Date(a.fastTrackDeadline).getTime() - new Date(b.fastTrackDeadline).getTime();
      if (a.fastTrackDeadline) return -1;
      if (b.fastTrackDeadline) return 1;
      return 0;
    });
  const regularSubs = submissions.filter((s) => !s.fastTrack);

  const handleAction = async (action: "accept" | "reject") => {
    if (!selectedSub) return;
    
    if (rating === 0) {
      setError("Please provide a rating from 1 to 5 stars.");
      return;
    }

    if (selectedSub.reviewRequested && notes.trim().length < 50) {
      setError("A detailed written review (at least 50 characters) is required for this paid review submission.");
      return;
    }

    if (action === "accept" && selectedPlacements.length === 0) {
      setError("Please select at least one placement to accept.");
      return;
    }

    setActionLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/master/submissions/${selectedSub.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action, 
          notes, 
          rating, 
          placements: selectedPlacements,
          assignedPremiumServices: selectedPremium,
          status: action === "accept" ? "ACCEPTED" : "REJECTED"
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process action");
      }

      // Success
      setSubmissions(prev => prev.filter(s => s.id !== selectedSub.id));
      setSelectedId(null);
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
    <div className="h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row overflow-hidden relative">
      
      {/* ── Left Column: Tabs ── */}
      <div className={`w-full lg:w-1/3 lg:min-w-[350px] border-r-4 border-white/10 bg-black flex flex-col h-full ${selectedId ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className="px-8 py-6 border-b-4 border-white/10 bg-[#F5E000] text-black shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <ShieldCheck size={24} className="text-black" strokeWidth={3} />
            <h1 className="font-sans text-4xl font-black uppercase tracking-tighter leading-none">MASTER</h1>
          </div>
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
            onClick={() => setActiveTab("queue")}
            className={`flex-1 py-4 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === "queue" ? "bg-[#F5E000] text-black" : "bg-black text-white/40 hover:text-white"
            }`}
          >
            PUB QUEUE ({queue.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* ── PRIORITY TAB ── */}
          {activeTab === "priority" && (
            loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#FF0000]" strokeWidth={3} />
              </div>
            ) : prioritySubs.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">NO_PRIORITY_REVIEW.</p>
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

          {/* ── INBOX TAB ── */}
          {activeTab === "inbox" && (
            loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#F5E000]" strokeWidth={3} />
              </div>
            ) : regularSubs.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">NO_PENDING_REVIEW.</p>
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

          {/* ── PUBLICATION QUEUE TAB ── */}
          {activeTab === "queue" && (
            queueLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={32} className="animate-spin text-[#F5E000]" strokeWidth={3} />
              </div>
            ) : queue.length === 0 ? (
              <div className="text-center py-10 text-white/20 px-4">
                <Send size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
                <p className="font-sans text-[10px] font-black uppercase tracking-widest">QUEUE IS EMPTY.</p>
              </div>
            ) : (
              queue.map((item) => (
                <div key={item.id} className="p-5 bg-black border-l-4 border-[#F5E000] hover:bg-white/5 transition-all">
                  <div className="flex gap-4 items-start">
                    <div className="w-12 h-12 shrink-0 bg-white/5 overflow-hidden flex items-center justify-center">
                      {item.autoFilledCover
                        ? <img src={item.autoFilledCover} alt="" className="w-full h-full object-cover" />
                        : <Music size={16} className="text-[#F5E000]" strokeWidth={3} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-sm font-black uppercase tracking-tight text-white truncate">{item.trackTitle}</p>
                      <p className="font-sans text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{item.artistName}</p>
                      {item.placement && (
                        <p className="font-sans text-[9px] font-black uppercase tracking-widest text-[#F5E000] mt-1">{item.placement}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {/* Regular Publication */}
                    {!item.publicationUrl && (
                      <button
                        onClick={() => { setPublishModalId(item.id); setPublishModalType("regular"); setPublicationUrl(""); setPublishError(null); }}
                        className="w-full py-3 bg-[#F5E000] text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                      >
                        <Send size={12} strokeWidth={3} /> PUBLISH REGULAR
                      </button>
                    )}

                    {/* Interview */}
                    {item.assignedPremiumServices?.includes("INTERVIEW") && !item.interviewUrl && (
                      item.premiumServicesPaid ? (
                        <button
                          onClick={() => { setPublishModalId(item.id); setPublishModalType("interview"); setPublicationUrl(""); setPublishError(null); }}
                          className="w-full py-3 bg-white text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-[#F5E000] transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={12} strokeWidth={3} /> PUBLISH INTERVIEW
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-sans font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Lock size={12} strokeWidth={3} /> INTERVIEW PENDING PAYMENT
                        </div>
                      )
                    )}

                    {/* Article */}
                    {item.assignedPremiumServices?.includes("ARTICLE") && !item.articleUrl && (
                      item.premiumServicesPaid ? (
                        <button
                          onClick={() => { setPublishModalId(item.id); setPublishModalType("article"); setPublicationUrl(""); setPublishError(null); }}
                          className="w-full py-3 bg-white text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-[#F5E000] transition-all flex items-center justify-center gap-2"
                        >
                          <Send size={12} strokeWidth={3} /> PUBLISH ARTICLE
                        </button>
                      ) : (
                        <div className="w-full py-3 bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 font-sans font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                          <Lock size={12} strokeWidth={3} /> ARTICLE PENDING PAYMENT
                        </div>
                      )
                    )}

                    {/* If all published */}
                    {item.publicationUrl && 
                     (!item.assignedPremiumServices?.includes("INTERVIEW") || item.interviewUrl) &&
                     (!item.assignedPremiumServices?.includes("ARTICLE") || item.articleUrl) && (
                      <div className="w-full py-3 bg-green-400/10 text-green-400 border border-green-400/20 font-sans font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                        <CheckCircle2 size={12} strokeWidth={3} /> ALL PUBLISHED
                      </div>
                    )}
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* ── Right Column: Review Panel ── */}
      <div className={`flex-1 bg-black flex flex-col h-full overflow-y-auto ${selectedId ? 'flex' : 'hidden lg:flex'}`}>
        {selectedId && (
          <button 
            onClick={() => setSelectedId(null)}
            className="lg:hidden sticky top-0 z-50 bg-black text-[#F5E000] p-4 flex items-center gap-3 font-sans font-black text-xs uppercase tracking-widest border-b-2 border-[#F5E000]/20"
          >
            ← BACK_TO_INBOX
          </button>
        )}
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
              <div className="w-48 h-48 shrink-0 bg-black border-4 border-white/10 overflow-hidden flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
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
                    <span key={g} className="px-3 py-1 border-2 border-white/10 text-[10px] font-black uppercase tracking-widest text-white">
                      {g}
                    </span>
                  ))}
                  {selectedSub.subgenres.map(g => (
                    <span key={g} className="px-3 py-1 bg-[#F5E000] text-black text-[10px] font-black uppercase tracking-widest">
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
                  <p className="font-sans text-xs font-bold text-white/40 uppercase tracking-widest truncate max-w-md">
                    {selectedSub.streamingUrl}
                  </p>
                </div>
              </div>
              <a 
                href={selectedSub.streamingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] hover:bg-[#F5E000] hover:text-black transition-all flex items-center gap-3"
              >
                OPEN <ExternalLink size={16} strokeWidth={3} />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* L1 Curator Feedback */}
                <section>
                  <h3 className="font-sans text-sm font-bold uppercase tracking-wider text-accent-red mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} /> Level 1 Curator Verdict
                  </h3>
                  <div className="p-5 border border-accent-red/20 bg-accent-red/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      {[1,2,3,4,5].map(star => (
                        <Star 
                          key={star}
                          size={18} 
                          className={((selectedSub.curatorRating || 0) >= star) ? "fill-accent-red text-accent-red" : "text-cm-text-muted"} 
                        />
                      ))}
                      <span className="font-sans text-xs text-cm-text-muted ml-2">
                        {selectedSub.curatorReviewedAt ? formatDate(selectedSub.curatorReviewedAt) : ""}
                      </span>
                    </div>
                    {selectedSub.curatorNotes ? (
                      <div className="flex gap-3 text-cm-text-primary">
                        <MessageSquare size={16} className="mt-1 shrink-0 text-accent-red" />
                        <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap italic">
                          "{selectedSub.curatorNotes}"
                        </p>
                      </div>
                    ) : (
                      <p className="font-sans text-sm text-cm-text-muted italic">No internal notes provided.</p>
                    )}
                  </div>
                </section>

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

                {/* Master Review Form */}
                <section>
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">
                    MASTER EVALUATION
                  </h3>
                  
                  <div className="p-10 border-4 border-white/10 bg-black space-y-10 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
                    
                    {/* Rating */}
                    <div>
                      <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">Final Verdict Score *</label>
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

                    {/* Multi-Placement Selection */}
                    <div>
                      <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">ASSIGN_PLACEMENTS *</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["Radar", "Internet Wave", "Spotify Playlist", "Instagram Stories"].map(p => {
                          const CHANNEL_MAP: Record<string, string> = {
                            "RADAR": "Radar",
                            "INTERNET_WAVE": "Internet Wave",
                            "SPOTIFY_PLAYLIST": "Spotify Playlist",
                            "STORIES": "Instagram Stories"
                          };
                          const isRequested = selectedSub?.channels
                            ? selectedSub.channels.map(c => CHANNEL_MAP[c]).filter(Boolean).includes(p)
                            : false;
                          const isChecked = selectedPlacements.includes(p);

                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                if (isChecked) setSelectedPlacements(prev => prev.filter(x => x !== p));
                                else setSelectedPlacements(prev => [...prev, p]);
                              }}
                              className={`flex items-center justify-between gap-3 p-4 border-2 transition-all text-left ${
                                isChecked
                                  ? 'bg-[#F5E000] text-black border-[#F5E000]'
                                  : isRequested
                                  ? 'bg-black text-[#F5E000] border-[#F5E000] border-dashed hover:border-solid hover:border-[#F5E000]'
                                  : 'bg-black text-white/40 border-white/10 hover:border-white/30'
                              }`}
                            >
                              <span className="font-sans text-[10px] font-black uppercase tracking-widest leading-tight">
                                {p}
                                {isRequested && !isChecked && (
                                  <span className="block text-[8px] mt-0.5 text-[#F5E000]/70">⚠ ARTISTA SOLICITÓ ESTO</span>
                                )}
                                {isRequested && isChecked && (
                                  <span className="block text-[8px] mt-0.5 opacity-50">SOLICITADO ✓</span>
                                )}
                              </span>
                              <CheckCircle2
                                size={18}
                                strokeWidth={3}
                                className={isChecked ? 'text-black shrink-0' : isRequested ? 'text-[#F5E000]/40 shrink-0' : 'text-white/10 shrink-0'}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Premium PR Selection */}
                    <div>
                      <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">ASSIGN_PREMIUM_PR (OPTIONAL)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {["INTERVIEW", "ARTICLE"].map(p => {
                          const isRequested = selectedSub?.premiumServices
                            ? selectedSub.premiumServices.includes(p)
                            : false;
                          const isChecked = selectedPremium.includes(p);
                          // Master can only assign what the artist requested
                          const isDisabled = !isRequested;

                          return (
                            <button
                              key={p}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                if (isChecked) setSelectedPremium(prev => prev.filter(x => x !== p));
                                else setSelectedPremium(prev => [...prev, p]);
                              }}
                              className={`flex items-center justify-between gap-3 p-4 border-2 transition-all text-left ${
                                isDisabled
                                  ? 'bg-black/40 text-white/20 border-white/5 cursor-not-allowed'
                                  : isChecked
                                  ? 'bg-[#F5E000] text-black border-[#F5E000]'
                                  : 'bg-black text-[#F5E000] border-[#F5E000] border-dashed hover:border-solid'
                              }`}
                            >
                              <span className="font-sans text-[10px] font-black uppercase tracking-widest leading-tight">
                                {p}
                                {isRequested && isChecked && <span className="block text-[8px] mt-0.5 opacity-50">SOLICITADO ✓</span>}
                                {isRequested && !isChecked && <span className="block text-[8px] mt-0.5 text-[#F5E000]/70">⚠ ARTISTA SOLICITÓ ESTO</span>}
                                {isDisabled && <span className="block text-[8px] mt-0.5">NO SOLICITADO</span>}
                              </span>
                              <CheckCircle2
                                size={18}
                                strokeWidth={3}
                                className={isChecked ? 'text-black shrink-0' : isDisabled ? 'text-white/10 shrink-0' : 'text-[#F5E000]/40 shrink-0'}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60" htmlFor="masterNotes">
                        {selectedSub.reviewRequested ? "Final Review (Sent to Artist) *" : "Final Editorial Thoughts (Optional)"}
                      </label>
                      {selectedSub.reviewRequested && (
                        <div className="mb-4 p-4 border border-[#F5E000]/50 bg-[#F5E000]/10 text-[#F5E000] text-[10px] font-sans uppercase tracking-widest font-bold">
                          REQUIRED: The artist paid for a detailed review. You can edit the L1 Curator's review below or leave it as is. This text will be sent to the artist. (Minimum 50 characters)
                        </div>
                      )}
                      <textarea
                        id="masterNotes"
                        className="w-full p-6 bg-white/5 border-2 border-white/10 focus:border-[#F5E000] focus:outline-none font-sans text-sm font-bold uppercase tracking-tight min-h-[120px] transition-all text-white"
                        placeholder="FINAL FEEDBACK..."
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
                        {actionLoading === "reject" ? <Loader2 className="animate-spin" size={16}/> : <><XCircle size={18} strokeWidth={3} /> Final Reject</>}
                      </button>
                      <button
                        onClick={() => handleAction("accept")}
                        disabled={actionLoading !== null}
                        className="flex-1 py-6 bg-[#F5E000] text-black border-2 border-black font-sans font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                      >
                        {actionLoading === "accept" ? <Loader2 className="animate-spin" size={16}/> : <><CheckCircle2 size={18} strokeWidth={3} /> Accept & Assign</>}
                      </button>
                    </div>

                  </div>
                </section>
              </div>

              {/* Sidebar: Artist Info */}
              <div className="space-y-10">
                <section>
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">
                    ARTIST PROFILE
                  </h3>
                  <div className="p-8 border-4 border-white/10 bg-black space-y-6">
                    <InfoRow label="Location" value={[selectedSub.user.country, selectedSub.user.city].filter(Boolean).join(", ")} />
                    <InfoRow label="Artist Type" value={selectedSub.user.roleType} />
                    <InfoRow label="Est." value={selectedSub.user.careerStartYear?.toString()} />
                    <InfoRow label="Listeners" value={selectedSub.user.monthlyListeners?.replace(/_/g, " ")} />
                    <InfoRow label="Manager" value={selectedSub.user.hasManager ? "YES" : "NO"} />
                    
                    {selectedSub.user.bio && (
                      <div className="pt-6 mt-6 border-t-2 border-black/5">
                        <p className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">BIO</p>
                        <p className="font-sans text-xs font-bold uppercase tracking-tight text-white leading-relaxed">{selectedSub.user.bio}</p>
                      </div>
                    )}
                  </div>
                </section>
                
                <section>
                  <h3 className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-6">
                    CONNECTED LINKS
                  </h3>
                  <div className="p-8 border-4 border-white/10 bg-black text-white space-y-4 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)]">
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

      {/* ── Publish Modal ── */}
      {publishModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-black border-4 border-[#F5E000] p-10 w-full max-w-md shadow-[12px_12px_0px_0px_rgba(245,224,0,0.2)]">
            <h2 className="font-sans text-2xl font-black uppercase tracking-tighter text-white mb-2">MARK AS PUBLISHED</h2>
            <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40 mb-8">
              Enter the publication link (Instagram post, Spotify playlist, etc.)
            </p>
            <div className="flex items-center gap-3 bg-white/5 border-2 border-white/10 focus-within:border-[#F5E000] transition-all mb-4">
              <Link2 size={16} className="ml-4 text-white/40 shrink-0" strokeWidth={2.5} />
              <input
                type="url"
                value={publicationUrl}
                onChange={(e) => setPublicationUrl(e.target.value)}
                placeholder="https://instagram.com/p/..."
                className="w-full p-4 bg-transparent font-sans text-sm font-bold text-white placeholder:text-white/20 focus:outline-none"
                autoFocus
              />
            </div>
            {publishError && (
              <p className="font-sans text-[10px] font-black uppercase tracking-widest text-[#FF0000] mb-4">{publishError}</p>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => { setPublishModalId(null); setPublicationUrl(""); }}
                className="flex-1 py-4 bg-white/10 text-white font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handlePublish}
                disabled={!publicationUrl || publishLoading}
                className="flex-1 py-4 bg-[#F5E000] text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {publishLoading ? <Loader2 size={14} className="animate-spin" /> : <><Send size={14} strokeWidth={3} /> CONFIRM</>}
              </button>
            </div>
          </div>
        </div>
      )}
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
