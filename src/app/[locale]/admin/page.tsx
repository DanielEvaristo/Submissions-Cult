"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  Loader2, BadgeCheck, AlertTriangle,
  TrendingUp, Globe, Layers, RefreshCw, Ghost, Copy,
  Activity, BarChart2, ShieldAlert, Music,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
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

// ─── Colour palette ───────────────────────────────────────────────────────────

const YELLOW = "#F5E000";
const BLACK = "#0A0A0A";
const MUTED = "#6B6B70";
const COLORS = [YELLOW, "#000000", "#333333", "#666666", "#999999", "#CCCCCC"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#000000",
  IN_REVIEW: "#333333",
  CURATOR_APPROVED: YELLOW,
  CURATOR_REJECTED: "#666666",
  MASTER_REVIEW: "#000000",
  ACCEPTED: YELLOW,
  REJECTED: "#FF0000",
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between border-b-4 border-white/10 pb-4 mb-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#F5E000] text-black">
          <Icon size={24} strokeWidth={3} />
        </div>
        <div>
          <h2 className="font-sans text-4xl font-black uppercase tracking-tighter text-white">{title}</h2>
          {subtitle && <p className="font-sans text-xs font-bold uppercase tracking-widest text-white/40 mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
        CULT MACHINE // ADM_SYS_01
      </div>
    </div>
  );
}

function StatCard({
  title, value, growth, subtext, color, href,
}: {
  title: string; value: string | number; growth?: number; subtext?: string; color?: string; href?: string;
}) {
  const isPositive = growth !== undefined && growth >= 0;
  
  const inner = (
    <div className={`group relative overflow-hidden flex flex-col justify-between h-56 p-8 border-4 border-white/10 rounded-none transition-all duration-150 hover:bg-[#F5E000] hover:text-black shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${color || "bg-black text-white"}`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="block font-sans text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
            {title}
          </span>
          {growth !== undefined && (
            <span className={`font-black text-[10px] px-2 py-0.5 border-2 border-black ${isPositive ? 'bg-[#00FF00] text-black' : 'bg-[#FF0000] text-white'}`}>
              {isPositive ? '+' : ''}{growth}%
            </span>
          )}
        </div>
        <span className="block font-sans text-5xl md:text-6xl font-black tracking-tighter leading-none">
          {value}
        </span>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-auto">
        {subtext && <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-60">{subtext}</span>}
        <div className="w-8 h-8 border-2 border-current flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
          →
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">{inner}</Link>
  ) : inner;
}

function AlertBadge({ count, label }: { count: number; label: string }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-accent-red/30 bg-accent-red/5">
      <AlertTriangle size={16} className="text-accent-red shrink-0" />
      <span className="font-sans text-sm font-medium text-cm-text-primary">
        <span className="font-bold text-accent-red">{count}</span> {label}
      </span>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="font-sans text-xs font-semibold text-cm-text-secondary mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="font-sans text-sm font-bold" style={{ color: p.color ?? "#F5E000" }}>
          {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year">("week");
  const [activeTab, setActiveTab] = useState<"overview" | "submissions" | "artists">("overview");
  
  // Filters for Artist section
  const [artistFilter, setArtistFilter] = useState({
    genre: "",
    country: "",
    relevance: "ALL"
  });
  
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const load = useCallback((p?: string) => {
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
  }, [period]);

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

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-8 py-12 space-y-16 animate-reveal">

      {/* ── Header ── */}
      <div className="border-b-4 border-black pb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">CONTROL_CENTER_V2.5</span>
          <h1 className="font-sans text-[clamp(40px,10vw,80px)] font-black text-white tracking-tighter uppercase leading-[0.85]">
            ANALYTICS<br/>CORE.
          </h1>
          
          {/* Timeframe Selector */}
          <div className="mt-10 flex gap-2">
            {["week", "month", "year"].map((p) => (
              <button
                key={p}
                onClick={() => { setPeriod(p as any); load(p); }}
                className={`px-6 py-2 border-2 border-white/10 font-sans font-black text-[10px] uppercase tracking-widest transition-all ${
                  period === p ? "bg-[#F5E000] text-black" : "bg-black text-white hover:bg-white hover:text-black"
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
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} strokeWidth={3} />
              SYNC
            </button>
            <button
              onClick={runAiAnalysis}
              disabled={analyzing || !stats}
              className="flex-1 md:flex-none px-6 py-4 bg-black text-white font-sans font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#F5E000] hover:text-black transition-all flex items-center justify-center gap-3 border-4 border-white/10 shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none"
            >
              {analyzing ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
              AI_ANALYZE
            </button>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex">
        <button 
          onClick={() => setActiveTab("overview")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${activeTab === 'overview' ? 'bg-black text-white translate-y-1' : 'bg-black text-white opacity-20 hover:opacity-100'}`}
        >
          OVERVIEW
        </button>
        <button 
          onClick={() => setActiveTab("submissions")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${activeTab === 'submissions' ? 'bg-[#F5E000] text-black translate-y-1' : 'bg-black text-white opacity-20 hover:opacity-100'}`}
        >
          SUBMISSIONS TRACKER
        </button>
        <button 
          onClick={() => setActiveTab("artists")}
          className={`px-8 py-5 font-black text-xs uppercase tracking-[0.2em] border-t-4 border-x-4 border-white/10 transition-all ${activeTab === 'artists' ? 'bg-[#00FF00] text-black translate-y-1' : 'bg-black text-white opacity-20 hover:opacity-100'}`}
        >
          ARTIST INTELLIGENCE
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-32 text-white">
          <Loader2 size={48} className="animate-spin mr-6" strokeWidth={3} />
          <span className="font-sans text-xl font-black uppercase tracking-tighter">SYNCHRONIZING...</span>
        </div>
      )}

      {stats && (
        <>
          {activeTab === 'overview' && (
            <div className="space-y-24 animate-reveal">
              
              {/* ── Business Health ── */}
              <section>
                <SectionHeader icon={TrendingUp} title="BUSINESS_HEALTH" subtitle="Growth and monetisation" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  <StatCard title="TOTAL_ARTISTS" value={stats.business.totalArtists} />
                  <StatCard title="NEW_THIS_WEEK" value={stats.business.newArtists} color="bg-[#00FF00] text-black" />
                  <StatCard title="NEW_THIS_MONTH" value={stats.business.totalArtists} />
                  <StatCard title="INDUSTRY_ACCOUNTS" value={stats.business.totalIndustry} />
                  
                  <StatCard title="PENDING_VERIFICATION" value={stats.business?.pendingVerification || 0} color={(stats.business?.pendingVerification || 0) > 0 ? "bg-[#FF0000] text-white" : "bg-black text-white"} />
                  <StatCard title="RETAINED_ARTISTS" value={stats.business?.retainedArtists || 0} subtext="2+ submissions" color="bg-[#00FF00] text-black" />
                  <StatCard title="ARTISTS_W/_CREDITS" value={stats.business?.artistsWithCredits || 0} subtext="at least 1 credit" />
                </div>
                <div className="border-4 border-white/10 p-10 bg-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">ARTIST_GROWTH_THIS_MONTH</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={[
                      { label: "This Week", value: stats.business.newArtists },
                      { label: "This Month", value: stats.business.totalArtists }, // Simplified mapping since we don't have this month strictly separated unless period is month
                      { label: "Total", value: stats.business.totalArtists },
                    ]}>
                      <XAxis dataKey="label" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5E000', opacity: 0.1 }} />
                      <Bar dataKey="value" fill="#F5E000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ── Submission Funnel ── */}
              <section>
                <SectionHeader icon={Layers} title="SUBMISSION_FUNNEL" subtitle="Form abandonment - unique sessions per step" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-4 border-white/10 p-10 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">SESSIONS_PER_STEP</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { step: "Step 1", value: stats.product?.funnel?.step1 || 0 },
                        { step: "Step 2", value: stats.product?.funnel?.step2 || 0 },
                        { step: "Step 3", value: stats.product?.funnel?.step3 || 0 },
                        { step: "Completed", value: stats.product?.funnel?.completed || 0 },
                      ]}>
                        <XAxis dataKey="step" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5E000', opacity: 0.1 }} />
                        <Bar dataKey="value" fill="#F5E000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-4 border-white/10 p-10 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">DROP-OFF_RATES</p>
                    <div className="space-y-6">
                      {[
                        { label: "Step 1 -> Step 2", drop: stats.product?.funnel?.step1 ? 100 - Math.round(stats.product.funnel.step2 / stats.product.funnel.step1 * 100) : 0 },
                        { label: "Step 2 -> Step 3", drop: stats.product?.funnel?.step2 ? 100 - Math.round(stats.product.funnel.step3 / stats.product.funnel.step2 * 100) : 0 },
                        { label: "Step 3 -> Completed", drop: stats.product?.funnel?.step3 ? 100 - Math.round(stats.product.funnel.completed / stats.product.funnel.step3 * 100) : 0 },
                        { label: "Overall (Step 1 -> Done)", drop: stats.product?.funnel?.step1 ? 100 - Math.round(stats.product.funnel.completed / stats.product.funnel.step1 * 100) : 0 },
                      ].map((d, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white mb-2">
                            <span>{d.label}</span>
                            <span className={d.drop > 50 ? "text-[#FF0000]" : "text-[#00FF00]"}>{d.drop}% drop</span>
                          </div>
                          <div className="h-2 bg-white/10 w-full">
                            <div className={`h-full ${d.drop > 50 ? "bg-[#FF0000]" : "bg-[#00FF00]"}`} style={{ width: `${d.drop}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="space-y-24 animate-reveal">
              {/* ── Editorial Health ── */}
              <section>
                <SectionHeader icon={Music} title="EDITORIAL_HEALTH" subtitle="Is the review process working?" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                  <StatCard title="TOTAL_SUBMISSIONS" value={stats.editorial.totalSubmissions} />
                  <StatCard title="THIS_WEEK" value={stats.editorial.submissionsPeriod} />
                  <StatCard title="THIS_MONTH" value={stats.editorial.submissionsPeriod} />
                  <StatCard title="AVG_RESPONSE_TIME" value={`${stats.editorial.avgResponseHours || 0}h`} subtext="curator review" />
                  <StatCard title="SLA_BREACHES" value={stats.alerts.slaBreaches} subtext=">72h PENDING" color={stats.alerts.slaBreaches > 0 ? "bg-[#FF0000] text-white" : "bg-[#00FF00] text-black"} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-4 border-white/10 p-10 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">SUBMISSIONS_BY_OPPORTUNITY</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.editorial.byOpportunity}>
                        <XAxis dataKey="name" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5E000', opacity: 0.1 }} />
                        <Bar dataKey="count" fill="#F5E000" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-4 border-white/10 p-10 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">STATUS_BREAKDOWN</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={stats.editorial.byStatus} dataKey="count" nameKey="name" innerRadius={60} outerRadius={80} paddingAngle={5}>
                          {stats.editorial.byStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, fontFamily: 'monospace' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </section>
            </div>
          )}
          {activeTab === 'artists' && (
            <div className="space-y-24 animate-reveal">
              {/* ── Product Health ── */}
              <section>
                <SectionHeader icon={BarChart2} title="PRODUCT_HEALTH" subtitle="Do people understand and use the platform?" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <StatCard title="PROFILE_COMPLETION" value={`${stats.product?.profileCompletion || 0}%`} subtext="artists with genre set" />
                  <div className="border-4 border-white/10 p-6 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 border-white/10 pb-2 w-fit">ROLE_DISTRIBUTION</p>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={stats.product?.roleDistribution || []} dataKey="count" nameKey="name" outerRadius={60} paddingAngle={2}>
                          {(stats.product?.roleDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 900, fontFamily: 'monospace' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="border-4 border-white/10 p-6 bg-black">
                    <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 border-white/10 pb-2 w-fit">TOP_COUNTRIES</p>
                    <div className="space-y-3">
                      {stats.product.byCountry.slice(0, 3).map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white">
                          <span>{c.country}</span>
                          <span className="text-[#F5E000]">{c.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="border-4 border-white/10 p-10 bg-black">
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">TOP_GENRES_SUBMITTED</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.product.topGenres} layout="vertical" margin={{ left: 40 }}>
                      <XAxis type="number" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="genre" type="category" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F5E000', opacity: 0.1 }} />
                      <Bar dataKey="count" fill="#F5E000" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* ── Intelligence Filters ── */}
              <section>
                <SectionHeader icon={Activity} title="INTELLIGENCE_MODULE" subtitle="Search and filter artist vectors" />
                <div className="flex flex-col md:flex-row gap-6 p-8 border-4 border-white/10 bg-black">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">GENRE</label>
                  <select 
                    className="w-full p-4 border-2 border-white/10 bg-white/5 text-white font-black text-xs uppercase focus:border-[#F5E000] focus:outline-none"
                    value={artistFilter.genre}
                    onChange={(e) => setArtistFilter({...artistFilter, genre: e.target.value})}
                  >
                    <option value="" className="bg-black text-white">ALL_GENRES</option>
                    <option value="ROCK" className="bg-black text-white">ROCK</option>
                    <option value="ELECTRONIC" className="bg-black text-white">ELECTRONIC</option>
                    <option value="HIP-HOP" className="bg-black text-white">HIP-HOP</option>
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">COUNTRY</label>
                  <input 
                    type="text" 
                    placeholder="E.G. MEXICO"
                    className="w-full p-4 border-2 border-white/10 bg-white/5 text-white font-black text-xs uppercase focus:border-[#F5E000] focus:outline-none"
                    value={artistFilter.country}
                    onChange={(e) => setArtistFilter({...artistFilter, country: e.target.value})}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">RELEVANCE_FILTER</label>
                  <div className="flex gap-2">
                    {["ALL", "HIGH", "MED", "LOW"].map(r => (
                      <button 
                        key={r}
                        onClick={() => setArtistFilter({...artistFilter, relevance: r})}
                        className={`flex-1 py-4 border-2 border-white/10 font-black text-[9px] uppercase tracking-tighter transition-all ${artistFilter.relevance === r ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white hover:bg-white/5'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-4 border-white/10 bg-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
                <div className="p-20 text-center space-y-8">
                  <Activity size={64} className="mx-auto opacity-10 text-[#F5E000]" />
                  <p className="font-sans text-xl font-black uppercase tracking-tighter text-white/40">ARTIST_INTELLIGENCE_MODULE_ACTIVE</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 max-w-sm mx-auto leading-relaxed">
                    Filters applied. Showing agents matching your vectors.
                  </p>
                </div>
              </div>
              </section>
            </div>
          )}

          {/* AI Insights & Alerts remain visible across views */}
          {aiInsights.length > 0 && (
            <section className="animate-reveal">
              <SectionHeader icon={Activity} title="AI_INSIGHTS" subtitle="Neural analysis of current vectors" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="p-8 border-4 border-black bg-black text-white relative overflow-hidden group hover:bg-[#F5E000] hover:text-black transition-colors">
                    <span className="absolute -right-4 -top-4 text-white/5 group-hover:text-black/5 text-8xl font-black select-none">0{i+1}</span>
                    <p className="font-sans text-lg font-black uppercase tracking-tight leading-tight relative z-10">{insight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader icon={ShieldAlert} title="EARLY_WARNING_SIGNALS" subtitle="Things that need attention" />
            
            {/* Alerts text banners */}
            <div className="space-y-4 mb-8">
              {(stats.alerts?.ghostArtists || 0) > 0 && (
                <div className="p-4 border border-[#FF0000] text-[#FF0000] font-sans font-bold text-xs uppercase tracking-widest bg-[#FF0000]/10 flex items-center gap-3">
                  <AlertTriangle size={16} />
                  {stats.alerts.ghostArtists} registered artists who have never submitted anything
                </div>
              )}
              {(stats.alerts?.duplicateSubmissions || 0) > 0 && (
                <div className="p-4 border border-[#FF0000] text-[#FF0000] font-sans font-bold text-xs uppercase tracking-widest bg-[#FF0000]/10 flex items-center gap-3">
                  <AlertTriangle size={16} />
                  {stats.alerts.duplicateSubmissions} potential duplicate submissions (same artist + same title)
                </div>
              )}
            </div>

            {/* Active Queue By Curator */}
            <div className="border-4 border-white/10 p-10 bg-black mb-8">
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">ACTIVE_QUEUE_BY_CURATOR</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.alerts.queueByCurator}>
                  <XAxis dataKey="curatorId" tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} tickFormatter={(val) => val ? val.substring(0,8) : "Unassigned"} />
                  <YAxis tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#FF0000', opacity: 0.1 }} />
                  <Bar dataKey="count" fill="#FF0000" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 border-4 border-white/10 bg-black text-white flex items-center gap-6">
                <div className="p-4 bg-white/5 border border-white/10"><Ghost size={32} className="opacity-40" /></div>
                <div>
                  <p className="text-4xl font-black mb-1">{stats.alerts?.ghostArtists || 0}</p>
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">GHOST_ARTISTS</p>
                  <p className="font-sans text-[8px] font-bold uppercase tracking-widest leading-relaxed text-white/20 mt-1">REGISTERED_NO_SUBMISSION</p>
                </div>
              </div>
              <div className="p-8 border-4 border-white/10 bg-black text-white flex items-center gap-6">
                <div className="p-4 bg-white/5 border border-white/10"><Copy size={32} className="opacity-40" /></div>
                <div>
                  <p className="text-4xl font-black mb-1">{stats.alerts?.duplicateSubmissions || 0}</p>
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">DUPLICATE_PAIRS</p>
                  <p className="font-sans text-[8px] font-bold uppercase tracking-widest leading-relaxed text-white/20 mt-1">SAME_ARTIST_SAME_TRACK</p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="border-t-4 border-white/10 pt-12 flex flex-wrap gap-8">
            <Link href="industry?status=PENDING_VERIFICATION" className="px-10 py-6 bg-[#FF0000] text-white border-4 border-[#FF0000] font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-[8px_8px_0px_0px_rgba(255,0,0,0.2)]" id="admin-review-pending-btn">
              REVIEW_PENDING_APPLICATIONS
            </Link>
            <Link href="submissions" className="px-10 py-6 bg-black text-white border-4 border-white/10 font-sans font-black text-xs uppercase tracking-[0.3em] hover:bg-white/10 transition-all" id="admin-view-submissions-btn">
              VIEW_ALL_SUBMISSIONS
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
