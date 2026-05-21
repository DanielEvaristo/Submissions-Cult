"use client";

import Link from "next/link";
import { Loader2, RefreshCw, Activity } from "lucide-react";
import { useAdminDashboard } from "@/components/admin/useAdminDashboard";
import OverviewTab from "@/components/admin/tabs/OverviewTab";
import SubmissionsTab from "@/components/admin/tabs/SubmissionsTab";
import ArtistsTab from "@/components/admin/tabs/ArtistsTab";
import ClaimAccountsTab from "@/components/admin/tabs/ClaimAccountsTab";
import AdminAlerts from "@/components/admin/tabs/AdminAlerts";

export default function AdminDashboard() {
  const {
    stats,
    loading,
    period,
    setPeriod,
    activeTab,
    setActiveTab,
    claimAccounts,
    claimTotal,
    claimLoading,
    claimSearch,
    setClaimSearch,
    claimPage,
    setClaimPage,
    claimLimit,
    approvedResult,
    setApprovedResult,
    processingId,
    artistFilter,
    setArtistFilter,
    lastUpdated,
    aiInsights,
    analyzing,
    load,
    runAiAnalysis,
    handleClaimAction,
  } = useAdminDashboard();

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-16 animate-reveal">
      {/* ── Header ── */}
      <div className="border-b-4 border-black pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">
            CONTROL_CENTER_V2.5
          </span>
          <h1 className="font-sans text-[clamp(40px,10vw,80px)] font-black text-white tracking-tighter uppercase leading-[0.85]">
            ANALYTICS<br />
            CORE.
          </h1>

          {/* Timeframe Selector */}
          <div className="mt-10 flex gap-2">
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p as any);
                  load(p);
                }}
                className={`px-6 py-2 border-2 border-white/10 font-sans font-black text-[10px] uppercase tracking-widest transition-all ${
                  period === p
                    ? "bg-[#F5E000] text-black"
                    : "bg-black text-white hover:bg-white hover:text-black"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-4 w-full md:w-auto">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-left md:text-right">
            {lastUpdated
              ? `LAST_SYNC: ${lastUpdated.toLocaleTimeString()}`
              : "SYSTEM_READY"}
          </p>
          <div className="flex gap-4 w-full md:w-auto">
            <button
              onClick={() => load()}
              disabled={loading}
              className="flex-1 md:flex-none px-6 py-4 bg-black text-white font-sans font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 border-4 border-white/10"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
                strokeWidth={3}
              />
              SYNC
            </button>
            <button
              onClick={runAiAnalysis}
              disabled={analyzing || !stats}
              className="flex-1 md:flex-none px-6 py-4 bg-black text-white font-sans font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#F5E000] hover:text-black transition-all flex items-center justify-center gap-3 border-4 border-white/10 shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none"
            >
              {analyzing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Activity size={14} />
              )}
              AI_ANALYZE
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-wrap">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${
            activeTab === "overview"
              ? "bg-black text-white translate-y-1"
              : "bg-black text-white opacity-20 hover:opacity-100"
          }`}
        >
          OVERVIEW
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${
            activeTab === "submissions"
              ? "bg-[#F5E000] text-black translate-y-1"
              : "bg-black text-white opacity-20 hover:opacity-100"
          }`}
        >
          SUBMISSIONS TRACKER
        </button>
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${
            activeTab === "artists"
              ? "bg-[#00FF00] text-black translate-y-1"
              : "bg-black text-white opacity-20 hover:opacity-100"
          }`}
        >
          ARTIST INTELLIGENCE
        </button>
        <button
          onClick={() => setActiveTab("claim_accounts")}
          className={`relative px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${
            activeTab === "claim_accounts"
              ? "bg-[#F5E000] text-black translate-y-1"
              : "bg-black text-white opacity-20 hover:opacity-100"
          }`}
        >
          CLAIM ACCOUNTS
          {claimTotal > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FF0000] text-white text-[9px] font-black flex items-center justify-center rounded-full">
              {claimTotal > 9 ? "9+" : claimTotal}
            </span>
          )}
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-32 text-white">
          <Loader2 size={48} className="animate-spin mr-6" strokeWidth={3} />
          <span className="font-sans text-xl font-black uppercase tracking-tighter">
            SYNCHRONIZING...
          </span>
        </div>
      )}

      {/* ── Active Tab Content ── */}
      {stats && activeTab === "overview" && <OverviewTab stats={stats} />}
      {stats && activeTab === "submissions" && <SubmissionsTab stats={stats} />}
      {stats && activeTab === "artists" && (
        <ArtistsTab
          stats={stats}
          artistFilter={artistFilter}
          setArtistFilter={setArtistFilter}
        />
      )}
      {activeTab === "claim_accounts" && (
        <ClaimAccountsTab
          claimAccounts={claimAccounts}
          claimTotal={claimTotal}
          claimLoading={claimLoading}
          claimSearch={claimSearch}
          setClaimSearch={setClaimSearch}
          claimPage={claimPage}
          setClaimPage={setClaimPage}
          claimLimit={claimLimit}
          approvedResult={approvedResult}
          setApprovedResult={setApprovedResult}
          processingId={processingId}
          handleClaimAction={handleClaimAction}
        />
      )}

      {/* ── Shared Alerts / AI Section (Visible across tabs if stats exist) ── */}
      {stats && activeTab !== "claim_accounts" && (
        <>
          <AdminAlerts stats={stats} aiInsights={aiInsights} />

          <div className="border-t-4 border-white/10 pt-12 flex flex-wrap gap-8">
            <Link
              href="industry?status=PENDING_VERIFICATION"
              className="px-10 py-6 bg-[#FF0000] text-white border-4 border-[#FF0000] font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]"
              id="admin-review-pending-btn"
            >
              REVIEW_PENDING_APPLICATIONS
            </Link>
            <Link
              href="submissions"
              className="px-10 py-6 bg-black text-white border-4 border-white/10 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              id="admin-view-submissions-btn"
            >
              VIEW_ALL_SUBMISSIONS
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
