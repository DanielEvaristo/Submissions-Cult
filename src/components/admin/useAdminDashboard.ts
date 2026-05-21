"use client";

import { useState, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DashboardStats {
  period: string;
  business: {
    totalArtists: number;
    newArtists: number;
    prevNewArtists: number;
    growthArtists: number;
    totalIndustry: number;
    pendingVerification: number;
    retainedArtists: number;
    artistsWithCredits: number;
  };
  editorial: {
    totalSubmissions: number;
    submissionsPeriod: number;
    prevSubmissionsPeriod: number;
    growthSubmissions: number;
    byOpportunity: { name: string; count: number }[];
    byStatus: { name: string; count: number }[];
    slaBreaches: number;
    avgResponseHours: number | null;
  };
  product: {
    byCountry: { country: string; count: number }[];
    topGenres: { genre: string; count: number }[];
    profileCompletion: number;
    roleDistribution: { name: string; count: number }[];
    funnel: {
      step1: number;
      step2: number;
      step3: number;
      completed: number;
    };
  };
  alerts: {
    queueByCurator: { curatorId: string | null; count: number }[];
    slaBreaches: number;
    ghostArtists: number;
    duplicateSubmissions: number;
  };
}

export type Period = "week" | "month" | "year";
export type Tab = "overview" | "submissions" | "artists" | "claim_accounts";

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("week");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Claim accounts state
  const [claimAccounts, setClaimAccounts] = useState<any[]>([]);
  const [claimTotal, setClaimTotal] = useState(0);
  const [claimLoading, setClaimLoading] = useState(false);
  const [claimSearch, setClaimSearch] = useState("");
  const [claimPage, setClaimPage] = useState(1);
  const [claimLimit] = useState(10);
  const [approvedResult, setApprovedResult] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filters for Artist section
  const [artistFilter, setArtistFilter] = useState({
    genre: "",
    country: "",
    relevance: "ALL",
  });

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // ── Stats loader ────────────────────────────────────────────────────────
  const load = useCallback(
    (p?: string) => {
      const targetPeriod = p || period;
      setLoading(true);
      fetch(`/api/admin/stats?period=${targetPeriod}&t=${Date.now()}`)
        .then(async (r) => {
          if (!r.ok) return;
          const data = await r.json();
          setStats(data);
          setLastUpdated(new Date());
        })
        .finally(() => setLoading(false));
    },
    [period]
  );

  useEffect(() => {
    load();
  }, [load]);

  // ── AI Analysis ──────────────────────────────────────────────────────────
  const runAiAnalysis = async () => {
    if (!stats) return;
    setAnalyzing(true);
    try {
      const res = await fetch("/api/admin/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stats }),
      });
      const data = await res.json();
      if (data.insights) setAiInsights(data.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Claim accounts loader ──────────────────────────────────────────────────
  const loadClaimAccounts = useCallback(async () => {
    setClaimLoading(true);
    try {
      const res = await fetch(
        `/api/admin/claim-accounts?limit=${claimLimit}&page=${claimPage}&search=${encodeURIComponent(
          claimSearch
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        setClaimAccounts(data.users ?? []);
        setClaimTotal(data.total ?? 0);
      }
    } finally {
      setClaimLoading(false);
    }
  }, [claimPage, claimLimit, claimSearch]);

  useEffect(() => {
    if (activeTab === "claim_accounts") {
      const timeout = setTimeout(() => {
        loadClaimAccounts();
      }, 500); // Debounce search
      return () => clearTimeout(timeout);
    }
  }, [activeTab, loadClaimAccounts, claimSearch, claimPage]);

  const handleClaimAction = async (userId: string, action: "APPROVE" | "REJECT") => {
    setProcessingId(userId);
    try {
      const res = await fetch("/api/admin/claim-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === "APPROVE" && data.tempPassword) {
          setApprovedResult({ email: data.email, tempPassword: data.tempPassword });
        }
        await loadClaimAccounts();
      }
    } finally {
      setProcessingId(null);
    }
  };

  return {
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
  };
}
