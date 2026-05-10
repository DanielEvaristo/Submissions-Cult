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
  business: {
    totalArtists: number;
    newArtistsWeek: number;
    newArtistsMonth: number;
    totalIndustry: number;
    pendingVerification: number;
    retentionArtists: number;
    artistsWithCredits: number;
  };
  editorial: {
    totalSubmissions: number;
    submissionsWeek: number;
    submissionsMonth: number;
    byOpportunity: { name: string; count: number }[];
    byStatus: { name: string; count: number }[];
    slaBreaches: number;
    avgResponseHours: number | null;
  };
  product: {
    byRole: { role: string; count: number }[];
    byCountry: { country: string; count: number }[];
    profileCompletePct: number;
    topGenres: { genre: string; count: number }[];
  };
  alerts: {
    queueByCurator: { curatorId: string | null; count: number }[];
    ghostArtists: number;
    duplicateSubmissions: number;
    slaBreaches: number;
  };
  funnel: {
    step1: number;
    step2: number;
    step3: number;
    completed: number;
  };
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const RED = "#E8341C";
const MUTED = "#6B6B70";
const COLORS = ["#E8341C", "#FF6B4A", "#FF9B87", "#FFCDC7", "#C0392B", "#922B21", "#7B241C", "#641E16"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  IN_REVIEW: "#3B82F6",
  CURATOR_APPROVED: "#8B5CF6",
  CURATOR_REJECTED: "#EF4444",
  MASTER_REVIEW: "#6366F1",
  ACCEPTED: "#10B981",
  REJECTED: "#EF4444",
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-lg bg-accent-red/10 border border-accent-red/20">
        <Icon size={16} className="text-accent-red" />
      </div>
      <div>
        <h2 className="font-sans text-base font-bold text-cm-text-primary">{title}</h2>
        {subtitle && <p className="font-sans text-xs text-cm-text-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function KpiCard({
  label, value, sub, accent, href,
}: {
  label: string; value: string | number; sub?: string; accent?: "red" | "green" | "yellow"; href?: string;
}) {
  const accentCls =
    accent === "red"
      ? "border-accent-red/40 ring-1 ring-accent-red/10"
      : accent === "green"
      ? "border-ok/40 ring-1 ring-ok/10"
      : accent === "yellow"
      ? "border-warn/40 ring-1 ring-warn/10"
      : "border-border";

  const inner = (
    <div className={`card flex flex-col gap-1 ${accentCls}`}>
      <span className={`font-sans text-3xl font-bold tracking-tight ${accent === "red" ? "text-accent-red" : accent === "green" ? "text-ok" : accent === "yellow" ? "text-warn" : "text-cm-text-primary"}`}>
        {value}
      </span>
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-cm-text-secondary">{label}</span>
      {sub && <span className="font-sans text-[11px] text-cm-text-muted">{sub}</span>}
    </div>
  );

  return href ? (
    <Link href={href} className="block hover:-translate-y-0.5 transition-transform duration-200">{inner}</Link>
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
        <p key={i} className="font-sans text-sm font-bold" style={{ color: p.color ?? RED }}>
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
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    // ?t= busts the browser GET cache so Refresh always hits the server fresh
    fetch(`/api/admin/stats?t=${Date.now()}`)
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (data?.business) {
          setStats(data);
          setLastUpdated(new Date());
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">Dashboard</h1>
          <p className="font-sans text-sm text-cm-text-muted mt-1">
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Cult Machine submission portal"}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-ghost flex items-center gap-2 disabled:opacity-50"
          id="admin-refresh-btn"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Loading ── */}
      {loading && !stats && (
        <div className="flex items-center justify-center py-32 text-cm-text-muted">
          <Loader2 size={24} className="animate-spin mr-3" />
          <span className="font-sans text-sm">Loading analytics…</span>
        </div>
      )}

      {stats && (
        <>
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1 — Business Health                                   */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={TrendingUp} title="Business Health" subtitle="Growth and monetisation" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Total Artists" value={stats.business.totalArtists} href="/en/admin/artists" />
              <KpiCard label="New This Week" value={stats.business.newArtistsWeek} accent="green" />
              <KpiCard label="New This Month" value={stats.business.newArtistsMonth} />
              <KpiCard label="Industry Accounts" value={stats.business.totalIndustry} href="/en/admin/industry" />
              <KpiCard
                label="Pending Verification"
                value={stats.business.pendingVerification}
                accent={stats.business.pendingVerification > 0 ? "red" : undefined}
                href="/en/admin/industry?status=PENDING_VERIFICATION"
              />
              <KpiCard
                label="Retained Artists"
                value={stats.business.retentionArtists}
                sub="2+ submissions"
                accent="green"
              />
              <KpiCard
                label="Artists w/ Credits"
                value={stats.business.artistsWithCredits}
                sub="at least 1 credit"
              />
            </div>

            {/* Artist growth bar */}
            <div className="card">
              <p className="section-label mb-4">Artist growth this month</p>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart
                  data={[
                    { label: "This Week", value: stats.business.newArtistsWeek },
                    { label: "This Month", value: stats.business.newArtistsMonth },
                    { label: "Total", value: stats.business.totalArtists },
                  ]}
                  margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                >
                  <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill={RED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 2 — Editorial Health                                  */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={Music} title="Editorial Health" subtitle="Is the review process working?" />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Total Submissions" value={stats.editorial.totalSubmissions} href="/en/admin/submissions" />
              <KpiCard label="This Week" value={stats.editorial.submissionsWeek} />
              <KpiCard label="This Month" value={stats.editorial.submissionsMonth} />
              <KpiCard
                label="Avg. Response Time"
                value={stats.editorial.avgResponseHours !== null ? `${stats.editorial.avgResponseHours}h` : "—"}
                sub="curator review"
              />
              <KpiCard
                label="SLA Breaches"
                value={stats.editorial.slaBreaches}
                sub=">72h PENDING"
                accent={stats.editorial.slaBreaches > 0 ? "red" : "green"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* By Opportunity */}
              <div className="card">
                <p className="section-label mb-4">Submissions by opportunity</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={stats.editorial.byOpportunity.map((d) => ({ name: d.name, count: d.count }))}
                    margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                  >
                    <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={RED} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* By Status — Pie */}
              <div className="card">
                <p className="section-label mb-4">Status breakdown</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.editorial.byStatus.map((d) => ({ name: d.name, value: d.count }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {stats.editorial.byStatus.map((entry, i) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] ?? COLORS[i % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, color: MUTED }}
                      formatter={(v) => v.replace(/_/g, " ")}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 3 — Product Health                                    */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={BarChart2} title="Product Health" subtitle="Do people understand and use the platform?" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <KpiCard
                label="Profile Completion"
                value={`${stats.product.profileCompletePct}%`}
                sub="artists with genre set"
                accent={stats.product.profileCompletePct >= 70 ? "green" : "yellow"}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* By Role */}
              <div className="card">
                <p className="section-label mb-4">Role distribution</p>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.product.byRole.map((d) => ({ name: d.role, value: d.count }))}
                      cx="50%"
                      cy="45%"
                      outerRadius={70}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {stats.product.byRole.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11, color: MUTED }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Genres */}
              <div className="card">
                <p className="section-label mb-4">Top genres submitted</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    layout="vertical"
                    data={stats.product.topGenres}
                    margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                  >
                    <XAxis type="number" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="genre"
                      width={90}
                      tick={{ fill: MUTED, fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={RED} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Countries */}
              <div className="card">
                <p className="section-label mb-4">Top countries</p>
                <div className="space-y-2 mt-1">
                  {stats.product.byCountry.slice(0, 8).map((c, i) => {
                    const max = stats.product.byCountry[0]?.count ?? 1;
                    const pct = Math.round((c.count / max) * 100);
                    return (
                      <div key={c.country} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs font-medium text-cm-text-secondary">{c.country || "Unknown"}</span>
                          <span className="font-sans text-xs font-bold text-cm-text-primary">{c.count}</span>
                        </div>
                        <div className="h-1 rounded-full bg-border">
                          <div
                            className="h-1 rounded-full bg-accent-red transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {stats.product.byCountry.length === 0 && (
                    <p className="font-sans text-xs text-cm-text-muted">No country data yet</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 4 — Funnel (Form Abandonment)                         */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={Layers} title="Submission Funnel" subtitle="Form abandonment — unique sessions per step" />

            {stats.funnel.step1 === 0 ? (
              <div className="card flex items-center gap-3 text-cm-text-muted">
                <Activity size={16} />
                <span className="font-sans text-sm">No funnel data yet — it will populate as users interact with the submission form.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                  <p className="section-label mb-4">Sessions per step</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={[
                        { name: "Step 1\nTrack Details", sessions: stats.funnel.step1 },
                        { name: "Step 2\nOpportunity", sessions: stats.funnel.step2 },
                        { name: "Step 3\nConfirm", sessions: stats.funnel.step3 },
                        { name: "Completed", sessions: stats.funnel.completed },
                      ]}
                      margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                    >
                      <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sessions" fill={RED} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="card space-y-4">
                  <p className="section-label">Drop-off rates</p>
                  {[
                    { from: "Step 1 → Step 2", a: stats.funnel.step1, b: stats.funnel.step2 },
                    { from: "Step 2 → Step 3", a: stats.funnel.step2, b: stats.funnel.step3 },
                    { from: "Step 3 → Completed", a: stats.funnel.step3, b: stats.funnel.completed },
                    { from: "Overall (Step 1 → Done)", a: stats.funnel.step1, b: stats.funnel.completed },
                  ].map(({ from, a, b }) => {
                    const drop = a === 0 ? 0 : Math.round(((a - b) / a) * 100);
                    const keep = 100 - drop;
                    return (
                      <div key={from} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-xs text-cm-text-secondary">{from}</span>
                          <span className={`font-sans text-xs font-bold ${drop > 50 ? "text-accent-red" : "text-ok"}`}>
                            {drop}% drop
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className="h-1.5 rounded-full bg-ok transition-all duration-500"
                            style={{ width: `${keep}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* SECTION 5 — Early Alerts                                      */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section>
            <SectionHeader icon={ShieldAlert} title="Early Warning Signals" subtitle="Things that need attention" />

            <div className="space-y-3 mb-6">
              <AlertBadge count={stats.alerts.slaBreaches} label="submissions pending for more than 72h (SLA breach)" />
              <AlertBadge count={stats.alerts.ghostArtists} label="registered artists who have never submitted anything" />
              <AlertBadge count={stats.alerts.duplicateSubmissions} label="potential duplicate submissions (same artist + same title)" />
              {stats.alerts.queueByCurator.some((c) => c.count >= 30) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-warn/30 bg-warn/5">
                  <AlertTriangle size={16} className="text-warn shrink-0" />
                  <span className="font-sans text-sm text-cm-text-primary">
                    At least one curator has{" "}
                    <span className="font-bold text-warn">
                      {Math.max(...stats.alerts.queueByCurator.map((c) => c.count))}
                    </span>{" "}
                    submissions in their queue — check workload balance.
                  </span>
                </div>
              )}
              {stats.alerts.slaBreaches === 0 &&
                stats.alerts.ghostArtists === 0 &&
                stats.alerts.duplicateSubmissions === 0 &&
                !stats.alerts.queueByCurator.some((c) => c.count >= 30) && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-ok/30 bg-ok/5">
                  <BadgeCheck size={16} className="text-ok shrink-0" />
                  <span className="font-sans text-sm font-medium text-ok">All clear — no alerts at this time.</span>
                </div>
              )}
            </div>

            {/* Curator queue */}
            {stats.alerts.queueByCurator.length > 0 && (
              <div className="card">
                <p className="section-label mb-4">Active queue by curator</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart
                    data={stats.alerts.queueByCurator.map((c, i) => ({
                      name: `Curator ${i + 1}`,
                      queue: c.count,
                    }))}
                    margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
                  >
                    <XAxis dataKey="name" tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="queue"
                      radius={[4, 4, 0, 0]}
                      fill={RED}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Ghost artists & duplicate stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="card flex items-center gap-4">
                <div className="p-3 rounded-xl bg-bg-elevated border border-border">
                  <Ghost size={22} className="text-cm-text-muted" />
                </div>
                <div>
                  <p className="font-sans text-2xl font-bold text-cm-text-primary">{stats.alerts.ghostArtists}</p>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-cm-text-secondary">Ghost Artists</p>
                  <p className="font-sans text-[11px] text-cm-text-muted">Registered but never submitted</p>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="p-3 rounded-xl bg-bg-elevated border border-border">
                  <Copy size={22} className="text-cm-text-muted" />
                </div>
                <div>
                  <p className="font-sans text-2xl font-bold text-cm-text-primary">{stats.alerts.duplicateSubmissions}</p>
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-cm-text-secondary">Duplicate Pairs</p>
                  <p className="font-sans text-[11px] text-cm-text-muted">Same artist + same track title</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Quick Actions ── */}
          <div className="border-t border-border pt-8 flex flex-wrap gap-4">
            <Link href="industry?status=PENDING_VERIFICATION" className="btn-primary" id="admin-review-pending-btn">
              Review Pending Applications
            </Link>
            <Link href="submissions" className="btn-secondary" id="admin-view-submissions-btn">
              View All Submissions
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
