"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Layers } from "lucide-react";
import { DashboardStats } from "../useAdminDashboard";
import { SectionHeader, StatCard, CustomTooltip } from "../AdminShared";

interface Props {
  stats: DashboardStats;
}

export default function OverviewTab({ stats }: Props) {
  return (
    <div className="space-y-24 animate-reveal">
      {/* ── Business Health ── */}
      <section>
        <SectionHeader
          icon={TrendingUp}
          title="BUSINESS_HEALTH"
          subtitle="Growth and monetisation"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <StatCard title="TOTAL_ARTISTS" value={stats.business.totalArtists} />
          <StatCard
            title="NEW_THIS_WEEK"
            value={stats.business.newArtists}
            color="bg-[#00FF00] text-black"
          />
          <StatCard title="NEW_THIS_MONTH" value={stats.business.totalArtists} />
          <StatCard title="INDUSTRY_ACCOUNTS" value={stats.business.totalIndustry} />

          <StatCard
            title="PENDING_VERIFICATION"
            value={stats.business?.pendingVerification || 0}
            color={
              (stats.business?.pendingVerification || 0) > 0
                ? "bg-[#FF0000] text-white"
                : "bg-black text-white"
            }
          />
          <StatCard
            title="RETAINED_ARTISTS"
            value={stats.business?.retainedArtists || 0}
            subtext="2+ submissions"
            color="bg-[#00FF00] text-black"
          />
          <StatCard
            title="ARTISTS_W/_CREDITS"
            value={stats.business?.artistsWithCredits || 0}
            subtext="at least 1 credit"
          />
        </div>
        <div className="border-4 border-white/10 p-10 bg-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
            ARTIST_GROWTH_THIS_MONTH
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={[
                { label: "This Week", value: stats.business.newArtists },
                { label: "This Month", value: stats.business.totalArtists }, // Simplified mapping
                { label: "Total", value: stats.business.totalArtists },
              ]}
            >
              <XAxis
                dataKey="label"
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
              <Bar dataKey="value" fill="#F5E000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Submission Funnel ── */}
      <section>
        <SectionHeader
          icon={Layers}
          title="SUBMISSION_FUNNEL"
          subtitle="Form abandonment - unique sessions per step"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border-4 border-white/10 p-10 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
              SESSIONS_PER_STEP
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { step: "Step 1", value: stats.product?.funnel?.step1 || 0 },
                  { step: "Step 2", value: stats.product?.funnel?.step2 || 0 },
                  { step: "Step 3", value: stats.product?.funnel?.step3 || 0 },
                  { step: "Completed", value: stats.product?.funnel?.completed || 0 },
                ]}
              >
                <XAxis
                  dataKey="step"
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
                <Bar dataKey="value" fill="#F5E000" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="border-4 border-white/10 p-10 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
              DROP-OFF_RATES
            </p>
            <div className="space-y-6">
              {[
                {
                  label: "Step 1 -> Step 2",
                  drop: stats.product?.funnel?.step1
                    ? 100 -
                      Math.round(
                        (stats.product.funnel.step2 / stats.product.funnel.step1) * 100
                      )
                    : 0,
                },
                {
                  label: "Step 2 -> Step 3",
                  drop: stats.product?.funnel?.step2
                    ? 100 -
                      Math.round(
                        (stats.product.funnel.step3 / stats.product.funnel.step2) * 100
                      )
                    : 0,
                },
                {
                  label: "Step 3 -> Completed",
                  drop: stats.product?.funnel?.step3
                    ? 100 -
                      Math.round(
                        (stats.product.funnel.completed / stats.product.funnel.step3) *
                          100
                      )
                    : 0,
                },
                {
                  label: "Overall (Step 1 -> Done)",
                  drop: stats.product?.funnel?.step1
                    ? 100 -
                      Math.round(
                        (stats.product.funnel.completed / stats.product.funnel.step1) *
                          100
                      )
                    : 0,
                },
              ].map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white mb-2">
                    <span>{d.label}</span>
                    <span
                      className={d.drop > 50 ? "text-[#FF0000]" : "text-[#00FF00]"}
                    >
                      {d.drop}% drop
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 w-full">
                    <div
                      className={`h-full ${
                        d.drop > 50 ? "bg-[#FF0000]" : "bg-[#00FF00]"
                      }`}
                      style={{ width: `${d.drop}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
