"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users, BadgeCheck, Music, Clock } from "lucide-react";

interface Stats {
  totalArtists: number;
  totalIndustry: number;
  pendingVerification: number;
  totalSubmissions: number;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string;
  value: number | null;
  icon: React.ElementType;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group block bg-bg-surface border p-6 rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${
        accent
          ? "border-accent-red/40 hover:border-accent-red ring-1 ring-accent-red/10"
          : "border-border hover:border-border-hover"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon
          size={18}
          className={accent ? "text-accent-red" : "text-cm-text-muted"}
        />
        <span
          className={`font-sans text-3xl font-bold tracking-tight ${
            accent ? "text-accent-red" : "text-cm-text-primary"
          }`}
        >
          {value ?? "—"}
        </span>
      </div>
      <p className="font-sans text-xs font-semibold uppercase tracking-wider text-cm-text-secondary">
        {label}
      </p>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
          Dashboard
        </h1>
        <p className="font-sans text-base text-cm-text-secondary mt-2">
          Overview of the Cult Machine submission portal.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-cm-text-muted">
          <Loader2 size={20} className="animate-spin" />
        </div>
      )}

      {/* Stat cards */}
      {!loading && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <StatCard
            label="Total Artists"
            value={stats.totalArtists}
            icon={Users}
            href="artists"
          />
          <StatCard
            label="Industry Accounts"
            value={stats.totalIndustry}
            icon={BadgeCheck}
            href="industry"
          />
          <StatCard
            label="Pending Verification"
            value={stats.pendingVerification}
            icon={Clock}
            href="industry?status=PENDING_VERIFICATION"
            accent={stats.pendingVerification > 0}
          />
          <StatCard
            label="Total Submissions"
            value={stats.totalSubmissions}
            icon={Music}
            href="submissions"
          />
        </div>
      )}

      {/* Quick links */}
      <div className="border-t border-border mt-4 pt-8">
        <p className="section-label mb-5">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="industry?status=PENDING_VERIFICATION"
            className="btn-primary"
            id="admin-review-pending-btn"
          >
            Review Pending Applications
          </Link>
          <Link
            href="submissions"
            className="btn-secondary"
            id="admin-view-submissions-btn"
          >
            View All Submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
