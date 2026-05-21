"use client";

import { Activity, ShieldAlert, AlertTriangle, Ghost, Copy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DashboardStats } from "../useAdminDashboard";
import { SectionHeader, CustomTooltip } from "../AdminShared";

interface Props {
  stats: DashboardStats;
  aiInsights: string[];
}

export default function AdminAlerts({ stats, aiInsights }: Props) {
  return (
    <>
      {aiInsights.length > 0 && (
        <section className="animate-reveal">
          <SectionHeader
            icon={Activity}
            title="AI_INSIGHTS"
            subtitle="Neural analysis of current vectors"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiInsights.map((insight, i) => (
              <div
                key={i}
                className="p-8 border-4 border-black bg-black text-white relative overflow-hidden group hover:bg-[#F5E000] hover:text-black transition-colors"
              >
                <span className="absolute -right-4 -top-4 text-white/5 group-hover:text-black/5 text-8xl font-black select-none">
                  0{i + 1}
                </span>
                <p className="font-sans text-lg font-black uppercase tracking-tight leading-tight relative z-10">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader
          icon={ShieldAlert}
          title="EARLY_WARNING_SIGNALS"
          subtitle="Things that need attention"
        />

        {/* Alerts text banners */}
        <div className="space-y-4 mb-8">
          {(stats.alerts?.ghostArtists || 0) > 0 && (
            <div className="p-4 border border-[#FF0000] text-[#FF0000] font-sans font-bold text-xs uppercase tracking-widest bg-[#FF0000]/10 flex items-center gap-3">
              <AlertTriangle size={16} />
              {stats.alerts.ghostArtists} registered artists who have never
              submitted anything
            </div>
          )}
          {(stats.alerts?.duplicateSubmissions || 0) > 0 && (
            <div className="p-4 border border-[#FF0000] text-[#FF0000] font-sans font-bold text-xs uppercase tracking-widest bg-[#FF0000]/10 flex items-center gap-3">
              <AlertTriangle size={16} />
              {stats.alerts.duplicateSubmissions} potential duplicate submissions
              (same artist + same title)
            </div>
          )}
        </div>

        {/* Active Queue By Curator */}
        <div className="border-4 border-white/10 p-10 bg-black mb-8">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
            ACTIVE_QUEUE_BY_CURATOR
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.alerts.queueByCurator}>
              <XAxis
                dataKey="curatorId"
                tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => (val ? val.substring(0, 8) : "Unassigned")}
              />
              <YAxis
                tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#FF0000", opacity: 0.1 }}
              />
              <Bar dataKey="count" fill="#FF0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 border-4 border-white/10 bg-black text-white flex items-center gap-6">
            <div className="p-4 bg-white/5 border border-white/10">
              <Ghost size={32} className="opacity-40" />
            </div>
            <div>
              <p className="text-4xl font-black mb-1">
                {stats.alerts?.ghostArtists || 0}
              </p>
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                GHOST_ARTISTS
              </p>
              <p className="font-sans text-[8px] font-bold uppercase tracking-widest leading-relaxed text-white/20 mt-1">
                REGISTERED_NO_SUBMISSION
              </p>
            </div>
          </div>
          <div className="p-8 border-4 border-white/10 bg-black text-white flex items-center gap-6">
            <div className="p-4 bg-white/5 border border-white/10">
              <Copy size={32} className="opacity-40" />
            </div>
            <div>
              <p className="text-4xl font-black mb-1">
                {stats.alerts?.duplicateSubmissions || 0}
              </p>
              <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
                DUPLICATE_PAIRS
              </p>
              <p className="font-sans text-[8px] font-bold uppercase tracking-widest leading-relaxed text-white/20 mt-1">
                SAME_ARTIST_SAME_TRACK
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
