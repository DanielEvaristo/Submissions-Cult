"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Music } from "lucide-react";
import { DashboardStats } from "../useAdminDashboard";
import { SectionHeader, StatCard, CustomTooltip, COLORS } from "../AdminShared";

interface Props {
  stats: DashboardStats;
}

export default function SubmissionsTab({ stats }: Props) {
  return (
    <div className="space-y-24 animate-reveal">
      {/* ── Editorial Health ── */}
      <section>
        <SectionHeader
          icon={Music}
          title="EDITORIAL_HEALTH"
          subtitle="Is the review process working?"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <StatCard title="TOTAL_SUBMISSIONS" value={stats.editorial.totalSubmissions} />
          <StatCard title="THIS_WEEK" value={stats.editorial.submissionsPeriod} />
          <StatCard title="THIS_MONTH" value={stats.editorial.submissionsPeriod} />
          <StatCard
            title="AVG_RESPONSE_TIME"
            value={`${stats.editorial.avgResponseHours || 0}h`}
            subtext="curator review"
          />
          <StatCard
            title="SLA_BREACHES"
            value={stats.alerts.slaBreaches}
            subtext=">72h PENDING"
            color={
              stats.alerts.slaBreaches > 0
                ? "bg-[#FF0000] text-white"
                : "bg-[#00FF00] text-black"
            }
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-4 border-white/10 p-10 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
              SUBMISSIONS_BY_OPPORTUNITY
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.editorial.byOpportunity}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F5E000", opacity: 0.1 }}
                />
                <Bar dataKey="count" fill="#F5E000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border-4 border-white/10 p-10 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
              STATUS_BREAKDOWN
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.editorial.byStatus}
                  dataKey="count"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                >
                  {stats.editorial.byStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: "10px",
                    fontWeight: 900,
                    fontFamily: "monospace",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
