import { Loader2, ShieldCheck, Send, Music, Lock, CheckCircle2 } from "lucide-react";
import { Submission, QueueItem, SubmissionItem, PriorityItem, formatDate } from "./MasterShared";

interface Props {
  activeTab: "priority" | "inbox" | "queue";
  setActiveTab: (tab: "priority" | "inbox" | "queue") => void;
  submissions: Submission[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  queue: QueueItem[];
  queueLoading: boolean;
  setPublishModalId: (id: string | null) => void;
  setPublishModalType: (type: "regular" | "interview" | "article") => void;
  setPublicationUrl: (url: string) => void;
  setPublishError: (err: string | null) => void;
}

export function MasterSidebar({
  activeTab,
  setActiveTab,
  submissions,
  loading,
  selectedId,
  setSelectedId,
  queue,
  queueLoading,
  setPublishModalId,
  setPublishModalType,
  setPublicationUrl,
  setPublishError,
}: Props) {
  const prioritySubs = submissions
    .filter((s) => s.fastTrack)
    .sort((a, b) => {
      if (a.fastTrackDeadline && b.fastTrackDeadline)
        return new Date(a.fastTrackDeadline).getTime() - new Date(b.fastTrackDeadline).getTime();
      if (a.fastTrackDeadline) return -1;
      if (b.fastTrackDeadline) return 1;
      return 0;
    });

  const regularSubs = submissions.filter((s) => !s.fastTrack);

  return (
    <div
      className={`w-full lg:w-1/3 lg:min-w-[350px] border-r-4 border-white/10 bg-black flex flex-col h-full ${
        selectedId ? "hidden lg:flex" : "flex"
      }`}
    >
      {/* Header */}
      <div className="px-8 py-6 border-b-4 border-white/10 bg-[#F5E000] text-black shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={24} className="text-black" strokeWidth={3} />
          <h1 className="font-sans text-4xl font-black uppercase tracking-tighter leading-none">
            MASTER
          </h1>
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
            activeTab === "inbox"
              ? "bg-[#F5E000] text-black"
              : "bg-black text-white/40 hover:text-white"
          }`}
        >
          INBOX ({regularSubs.length})
        </button>
        <button
          onClick={() => setActiveTab("queue")}
          className={`flex-1 py-4 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
            activeTab === "queue"
              ? "bg-[#F5E000] text-black"
              : "bg-black text-white/40 hover:text-white"
          }`}
        >
          PUB QUEUE ({queue.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* ── PRIORITY TAB ── */}
        {activeTab === "priority" &&
          (loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-[#FF0000]" strokeWidth={3} />
            </div>
          ) : prioritySubs.length === 0 ? (
            <div className="text-center py-10 text-white/20 px-4">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
              <p className="font-sans text-[10px] font-black uppercase tracking-widest">
                NO_PRIORITY_REVIEW.
              </p>
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
          ))}

        {/* ── INBOX TAB ── */}
        {activeTab === "inbox" &&
          (loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-[#F5E000]" strokeWidth={3} />
            </div>
          ) : regularSubs.length === 0 ? (
            <div className="text-center py-10 text-white/20 px-4">
              <ShieldCheck size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
              <p className="font-sans text-[10px] font-black uppercase tracking-widest">
                NO_PENDING_REVIEW.
              </p>
            </div>
          ) : (
            regularSubs.map((sub) => (
              <SubmissionItem
                key={sub.id}
                sub={sub}
                selected={selectedId === sub.id}
                onClick={() => setSelectedId(sub.id)}
              />
            ))
          ))}

        {/* ── PUBLICATION QUEUE TAB ── */}
        {activeTab === "queue" &&
          (queueLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 size={32} className="animate-spin text-[#F5E000]" strokeWidth={3} />
            </div>
          ) : queue.length === 0 ? (
            <div className="text-center py-10 text-white/20 px-4">
              <Send size={48} className="mx-auto mb-4 opacity-10" strokeWidth={3} />
              <p className="font-sans text-[10px] font-black uppercase tracking-widest">
                QUEUE IS EMPTY.
              </p>
            </div>
          ) : (
            queue.map((item) => (
              <div
                key={item.id}
                className="p-5 bg-black border-l-4 border-[#F5E000] hover:bg-white/5 transition-all"
              >
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 shrink-0 bg-white/5 overflow-hidden flex items-center justify-center">
                    {item.autoFilledCover ? (
                      <img src={item.autoFilledCover} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Music size={16} className="text-[#F5E000]" strokeWidth={3} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-black uppercase tracking-tight text-white truncate">
                      {item.trackTitle}
                    </p>
                    <p className="font-sans text-[9px] font-black uppercase tracking-widest text-white/40 truncate">
                      {item.artistName}
                    </p>
                    {item.placement && (
                      <p className="font-sans text-[9px] font-black uppercase tracking-widest text-[#F5E000] mt-1">
                        {item.placement}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {/* Regular Publication */}
                  {!item.publicationUrl && (
                    <button
                      onClick={() => {
                        setPublishModalId(item.id);
                        setPublishModalType("regular");
                        setPublicationUrl("");
                        setPublishError(null);
                      }}
                      className="w-full py-3 bg-[#F5E000] text-black font-sans font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={12} strokeWidth={3} /> PUBLISH REGULAR
                    </button>
                  )}

                  {/* Interview */}
                  {item.assignedPremiumServices?.includes("INTERVIEW") && !item.interviewUrl && (
                    item.premiumServicesPaid ? (
                      <button
                        onClick={() => {
                          setPublishModalId(item.id);
                          setPublishModalType("interview");
                          setPublicationUrl("");
                          setPublishError(null);
                        }}
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
                        onClick={() => {
                          setPublishModalId(item.id);
                          setPublishModalType("article");
                          setPublicationUrl("");
                          setPublishError(null);
                        }}
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
          ))}
      </div>
    </div>
  );
}
