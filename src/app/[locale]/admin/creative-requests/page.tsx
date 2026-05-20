"use client";

import { useEffect, useState, useCallback } from "react";
import { Camera, Pen, Palette, Video, Heart, Sparkles, Loader2, CheckCircle2, XCircle, Clock, Eye, ChevronDown, ChevronUp, Filter } from "lucide-react";

type CreativeRequest = {
  id: string;
  name: string;
  email: string;
  creativeType: string;
  portfolioUrl: string | null;
  message: string;
  status: "PENDING" | "REVIEWING" | "ACCEPTED" | "REJECTED";
  adminNotes: string | null;
  createdAt: string;
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  PHOTOGRAPHER: Camera,
  WRITER: Pen,
  DESIGNER: Palette,
  VIDEOGRAPHER: Video,
  FAN: Heart,
  OTHER: Sparkles,
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "Pending",   color: "text-white",          bg: "bg-white/10" },
  REVIEWING: { label: "Reviewing", color: "text-[#F5E000]",      bg: "bg-[#F5E000]/10" },
  ACCEPTED:  { label: "Accepted",  color: "text-[#00FF00]",      bg: "bg-[#00FF00]/10" },
  REJECTED:  { label: "Rejected",  color: "text-[#FF0000]",      bg: "bg-[#FF0000]/10" },
};

export default function AdminCreativeRequestsPage() {
  const [requests, setRequests] = useState<CreativeRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notesEdits, setNotesEdits] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `/api/creative-requests${filterStatus ? `?status=${filterStatus}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests);
        setTotal(data.total);
        setStatusCounts(data.statusCounts ?? {});
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const updateRequest = async (id: string, status?: string, adminNotes?: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/creative-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) await load();
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPending = statusCounts["PENDING"] ?? 0;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-reveal">

      {/* Header */}
      <div className="border-b-4 border-white/10 pb-8">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-2 block">
          ADMIN / CREATIVE_REQUESTS
        </span>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <h1 className="text-[clamp(32px,6vw,60px)] font-black uppercase tracking-tighter text-white leading-none">
            CREATIVE<br />REQUESTS.★
          </h1>
          {totalPending > 0 && (
            <div className="px-4 py-2 bg-[#FF0000] text-white font-black text-xs uppercase tracking-widest">
              {totalPending} PENDING REVIEW
            </div>
          )}
        </div>
      </div>

      {/* Status counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"] as const).map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
              className={`border-4 p-4 text-left transition-all ${
                filterStatus === s ? "border-[#F5E000] bg-[#F5E000]/10" : "border-white/10 hover:border-[#F5E000]/40"
              }`}
            >
              <span className={`block text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="block text-4xl font-black text-white tracking-tighter">
                {statusCounts[s] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter bar */}
      {filterStatus && (
        <div className="flex items-center gap-3">
          <Filter size={14} strokeWidth={3} className="text-[#F5E000]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F5E000]">
            Filtering: {filterStatus}
          </span>
          <button
            onClick={() => setFilterStatus("")}
            className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center gap-4 py-16 text-white">
          <Loader2 size={32} className="animate-spin text-[#F5E000]" />
          <span className="font-black uppercase tracking-widest text-sm">Loading requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <div className="border-4 border-white/10 p-16 text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-[#00FF00]" />
          <p className="font-black text-xl uppercase tracking-tighter text-white">No requests found.</p>
          <p className="text-xs font-bold uppercase tracking-widest text-white/30 mt-2">
            {filterStatus ? "Try clearing the filter." : "Creative requests will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const Icon = TYPE_ICONS[req.creativeType] ?? Sparkles;
            const cfg = STATUS_CONFIG[req.status];
            const isExpanded = expandedId === req.id;
            const isUpdating = updatingId === req.id;

            return (
              <div key={req.id} className={`border-4 transition-all ${isExpanded ? "border-[#F5E000]/40 bg-white/[0.02]" : "border-white/10 hover:border-white/20"}`}>
                {/* Row */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : req.id)}
                  className="w-full flex items-center gap-4 p-5 text-left"
                >
                  <div className="w-10 h-10 border-2 border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={16} strokeWidth={3} className="text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-sm text-white">{req.name}</span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                        {req.creativeType}
                      </span>
                    </div>
                    <p className="text-xs text-white/40 font-bold mt-0.5 truncate">{req.email}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 hidden md:block">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                    {isExpanded ? <ChevronUp size={16} strokeWidth={3} className="text-white/40" /> : <ChevronDown size={16} strokeWidth={3} className="text-white/40" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t-2 border-white/10 p-6 space-y-6">
                    {/* Message */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Message</p>
                      <p className="text-white/70 font-bold text-sm leading-relaxed whitespace-pre-wrap">{req.message}</p>
                    </div>

                    {/* Portfolio */}
                    {req.portfolioUrl && (
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Portfolio / Link</p>
                        <a
                          href={req.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[#F5E000] font-black text-xs uppercase tracking-widest hover:underline"
                        >
                          <Eye size={14} strokeWidth={3} /> {req.portfolioUrl}
                        </a>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-2">Internal Notes</p>
                      <textarea
                        rows={3}
                        placeholder="Add notes (visible only to staff)..."
                        defaultValue={req.adminNotes ?? ""}
                        onChange={(e) => setNotesEdits({ ...notesEdits, [req.id]: e.target.value })}
                        className="w-full bg-black border-2 border-white/10 p-4 text-white font-bold text-sm focus:border-[#F5E000] outline-none resize-none placeholder:text-white/20"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {(["REVIEWING", "ACCEPTED", "REJECTED"] as const).filter(s => s !== req.status).map((s) => {
                        const c = STATUS_CONFIG[s];
                        return (
                          <button
                            key={s}
                            onClick={() => updateRequest(req.id, s, notesEdits[req.id] ?? req.adminNotes ?? undefined)}
                            disabled={isUpdating}
                            className={`flex items-center gap-2 px-5 py-3 border-2 font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 ${c.bg} ${c.color} border-current hover:opacity-80`}
                          >
                            {isUpdating ? <Loader2 size={12} className="animate-spin" /> : null}
                            {s === "REVIEWING" && <Clock size={12} strokeWidth={3} />}
                            {s === "ACCEPTED" && <CheckCircle2 size={12} strokeWidth={3} />}
                            {s === "REJECTED" && <XCircle size={12} strokeWidth={3} />}
                            Mark {c.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => updateRequest(req.id, undefined, notesEdits[req.id] ?? req.adminNotes ?? undefined)}
                        disabled={isUpdating}
                        className="flex items-center gap-2 px-5 py-3 border-2 border-white/20 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all disabled:opacity-50"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <p className="text-[9px] font-black uppercase tracking-widest text-white/20 text-right pt-2">
            {total} total request{total !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
