import { Loader2, Music, Play, CheckCircle2, XCircle, Star, ExternalLink, ShieldCheck, MessageSquare } from "lucide-react";
import { Submission, OPP_COLORS, formatDate, InfoRow, LinkRow } from "./MasterShared";

interface Props {
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  submissions: Submission[];
  rating: number;
  setRating: (rating: number) => void;
  notes: string;
  setNotes: (notes: string) => void;
  selectedPlacements: string[];
  setSelectedPlacements: (fn: (prev: string[]) => string[]) => void;
  selectedPremium: string[];
  setSelectedPremium: (fn: (prev: string[]) => string[]) => void;
  actionLoading: "accept" | "reject" | null;
  error: string | null;
  handleAction: (action: "accept" | "reject") => void;
}

export function MasterReviewPanel({
  selectedId,
  setSelectedId,
  submissions,
  rating,
  setRating,
  notes,
  setNotes,
  selectedPlacements,
  setSelectedPlacements,
  selectedPremium,
  setSelectedPremium,
  actionLoading,
  error,
  handleAction,
}: Props) {
  const selectedSub = submissions.find((s) => s.id === selectedId);

  return (
    <div className={`flex-1 bg-black flex flex-col h-full overflow-y-auto ${selectedId ? "flex" : "hidden lg:flex"}`}>
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
                {selectedSub.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 border-2 border-white/10 text-[10px] font-black uppercase tracking-widest text-white"
                  >
                    {g}
                  </span>
                ))}
                {selectedSub.subgenres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-[#F5E000] text-black text-[10px] font-black uppercase tracking-widest"
                  >
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
                <p className="font-sans text-2xl font-black uppercase tracking-tighter text-white">
                  LISTEN TO TRACK
                </p>
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
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={18}
                        className={
                          (selectedSub.curatorRating || 0) >= star
                            ? "fill-accent-red text-accent-red"
                            : "text-cm-text-muted"
                        }
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
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">
                      Final Verdict Score *
                    </label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
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
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">
                      ASSIGN_PLACEMENTS *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["Radar", "Internet Wave", "Spotify Playlist", "Instagram Stories"].map((p) => {
                        const CHANNEL_MAP: Record<string, string> = {
                          RADAR: "Radar",
                          INTERNET_WAVE: "Internet Wave",
                          SPOTIFY_PLAYLIST: "Spotify Playlist",
                          STORIES: "Instagram Stories",
                        };
                        const isRequested = selectedSub?.channels
                          ? selectedSub.channels.map((c) => CHANNEL_MAP[c]).filter(Boolean).includes(p)
                          : false;
                        const isChecked = selectedPlacements.includes(p);

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => {
                              if (isChecked) setSelectedPlacements((prev) => prev.filter((x) => x !== p));
                              else setSelectedPlacements((prev) => [...prev, p]);
                            }}
                            className={`flex items-center justify-between gap-3 p-4 border-2 transition-all text-left ${
                              isChecked
                                ? "bg-[#F5E000] text-black border-[#F5E000]"
                                : isRequested
                                ? "bg-black text-[#F5E000] border-[#F5E000] border-dashed hover:border-solid hover:border-[#F5E000]"
                                : "bg-black text-white/40 border-white/10 hover:border-white/30"
                            }`}
                          >
                            <span className="font-sans text-[10px] font-black uppercase tracking-widest leading-tight">
                              {p}
                              {isRequested && !isChecked && (
                                <span className="block text-[8px] mt-0.5 text-[#F5E000]/70">
                                  ⚠ ARTISTA SOLICITÓ ESTO
                                </span>
                              )}
                              {isRequested && isChecked && (
                                <span className="block text-[8px] mt-0.5 opacity-50">SOLICITADO ✓</span>
                              )}
                            </span>
                            <CheckCircle2
                              size={18}
                              strokeWidth={3}
                              className={
                                isChecked
                                  ? "text-black shrink-0"
                                  : isRequested
                                  ? "text-[#F5E000]/40 shrink-0"
                                  : "text-white/10 shrink-0"
                              }
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Premium PR Selection */}
                  <div>
                    <label className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60">
                      ASSIGN_PREMIUM_PR (OPTIONAL)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {["INTERVIEW", "ARTICLE"].map((p) => {
                        const isRequested = selectedSub?.premiumServices
                          ? selectedSub.premiumServices.includes(p)
                          : false;
                        const isChecked = selectedPremium.includes(p);
                        const isDisabled = !isRequested;

                        return (
                          <button
                            key={p}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => {
                              if (isChecked) setSelectedPremium((prev) => prev.filter((x) => x !== p));
                              else setSelectedPremium((prev) => [...prev, p]);
                            }}
                            className={`flex items-center justify-between gap-3 p-4 border-2 transition-all text-left ${
                              isDisabled
                                ? "bg-black/40 text-white/20 border-white/5 cursor-not-allowed"
                                : isChecked
                                ? "bg-[#F5E000] text-black border-[#F5E000]"
                                : "bg-black text-[#F5E000] border-[#F5E000] border-dashed hover:border-solid"
                            }`}
                          >
                            <span className="font-sans text-[10px] font-black uppercase tracking-widest leading-tight">
                              {p}
                              {isRequested && isChecked && (
                                <span className="block text-[8px] mt-0.5 opacity-50">SOLICITADO ✓</span>
                              )}
                              {isRequested && !isChecked && (
                                <span className="block text-[8px] mt-0.5 text-[#F5E000]/70">
                                  ⚠ ARTISTA SOLICITÓ ESTO
                                </span>
                              )}
                              {isDisabled && (
                                <span className="block text-[8px] mt-0.5">NO SOLICITADO</span>
                              )}
                            </span>
                            <CheckCircle2
                              size={18}
                              strokeWidth={3}
                              className={
                                isChecked
                                  ? "text-black shrink-0"
                                  : isDisabled
                                  ? "text-white/10 shrink-0"
                                  : "text-[#F5E000]/40 shrink-0"
                              }
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label
                      className="block font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-white/60"
                      htmlFor="masterNotes"
                    >
                      {selectedSub.reviewRequested
                        ? "Final Review (Sent to Artist) *"
                        : "Final Editorial Thoughts (Optional)"}
                    </label>
                    {selectedSub.reviewRequested && (
                      <div className="mb-4 p-4 border border-[#F5E000]/50 bg-[#F5E000]/10 text-[#F5E000] text-[10px] font-sans uppercase tracking-widest font-bold">
                        REQUIRED: The artist paid for a detailed review. You can edit the L1 Curator's review below or
                        leave it as is. This text will be sent to the artist. (Minimum 50 characters)
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
                      {actionLoading === "reject" ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <XCircle size={18} strokeWidth={3} /> Final Reject
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction("accept")}
                      disabled={actionLoading !== null}
                      className="flex-1 py-6 bg-[#F5E000] text-black border-2 border-black font-sans font-black text-xs uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      {actionLoading === "accept" ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <CheckCircle2 size={18} strokeWidth={3} /> Accept & Assign
                        </>
                      )}
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
                  <InfoRow
                    label="Location"
                    value={[selectedSub.user.country, selectedSub.user.city].filter(Boolean).join(", ")}
                  />
                  <InfoRow label="Artist Type" value={selectedSub.user.roleType} />
                  <InfoRow label="Est." value={selectedSub.user.careerStartYear?.toString()} />
                  <InfoRow label="Listeners" value={selectedSub.user.monthlyListeners?.replace(/_/g, " ")} />
                  <InfoRow label="Manager" value={selectedSub.user.hasManager ? "YES" : "NO"} />

                  {selectedSub.user.bio && (
                    <div className="pt-6 mt-6 border-t-2 border-black/5">
                      <p className="font-sans text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">
                        BIO
                      </p>
                      <p className="font-sans text-xs font-bold uppercase tracking-tight text-white leading-relaxed">
                        {selectedSub.user.bio}
                      </p>
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
                  {!(
                    selectedSub.user.spotifyUrl ||
                    selectedSub.user.instagram ||
                    selectedSub.user.tiktok ||
                    selectedSub.user.youtube ||
                    selectedSub.user.website
                  ) && (
                    <p className="font-sans text-[10px] font-black uppercase tracking-widest text-white/40">
                      No links provided.
                    </p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
