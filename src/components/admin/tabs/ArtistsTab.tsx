"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { BarChart2, Activity } from "lucide-react";
import { DashboardStats } from "../useAdminDashboard";
import { SectionHeader, StatCard, CustomTooltip, COLORS } from "../AdminShared";

interface Props {
  stats: DashboardStats;
  artistFilter: { genre: string; country: string; relevance: string };
  setArtistFilter: (filter: { genre: string; country: string; relevance: string }) => void;
}

export default function ArtistsTab({ stats, artistFilter, setArtistFilter }: Props) {
  return (
    <div className="space-y-24 animate-reveal">
      {/* ── Product Health ── */}
      <section>
        <SectionHeader
          icon={BarChart2}
          title="PRODUCT HEALTH"
          subtitle="Do people understand and use the platform?"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <StatCard
            title="PROFILE COMPLETION"
            value={`${stats.product?.profileCompletion || 0}%`}
            subtext="artists with genre set"
          />
          <div className="border-4 border-white/10 p-6 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 border-white/10 pb-2 w-fit">
              ROLE DISTRIBUTION
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={stats.product?.roleDistribution || []}
                  dataKey="count"
                  nameKey="name"
                  outerRadius={60}
                  paddingAngle={2}
                >
                  {(stats.product?.roleDistribution || []).map((entry, index) => (
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
          <div className="border-4 border-white/10 p-6 bg-black">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-4 border-b-2 border-white/10 pb-2 w-fit">
              TOP COUNTRIES
            </p>
            <div className="space-y-3">
              {stats.product.byCountry.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white"
                >
                  <span>{c.country}</span>
                  <span className="text-[#F5E000]">{c.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="border-4 border-white/10 p-10 bg-black">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.3em] mb-8 border-b-2 border-white/10 pb-2 w-fit">
            TOP GENRES SUBMITTED
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={stats.product.topGenres}
              layout="vertical"
              margin={{ left: 40 }}
            >
              <XAxis
                type="number"
                tick={{ fill: "#FFF", fontSize: 10, fontWeight: 900 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="genre"
                type="category"
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
      </section>

      {/* ── Intelligence Filters ── */}
      <section>
        <SectionHeader
          icon={Activity}
          title="INTELLIGENCE MODULE"
          subtitle="Search and filter artist vectors"
        />
        <div className="flex flex-col md:flex-row gap-6 p-8 border-4 border-white/10 bg-black">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
              GENRE
            </label>
            <select
              className="w-full p-4 border-2 border-white/10 bg-white/5 text-white font-black text-xs uppercase focus:border-[#F5E000] focus:outline-none"
              value={artistFilter.genre}
              onChange={(e) =>
                setArtistFilter({ ...artistFilter, genre: e.target.value })
              }
            >
              <option value="" className="bg-black text-white">
                ALL GENRES
              </option>
              <option value="ROCK" className="bg-black text-white">
                ROCK
              </option>
              <option value="ELECTRONIC" className="bg-black text-white">
                ELECTRONIC
              </option>
              <option value="HIP-HOP" className="bg-black text-white">
                HIP-HOP
              </option>
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
              COUNTRY
            </label>
            <input
              type="text"
              placeholder="E.G. MEXICO"
              className="w-full p-4 border-2 border-white/10 bg-white/5 text-white font-black text-xs uppercase focus:border-[#F5E000] focus:outline-none"
              value={artistFilter.country}
              onChange={(e) =>
                setArtistFilter({ ...artistFilter, country: e.target.value })
              }
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-40">
              RELEVANCE FILTER
            </label>
            <div className="flex gap-2">
              {["ALL", "HIGH", "MED", "LOW"].map((r) => (
                <button
                  key={r}
                  onClick={() =>
                    setArtistFilter({ ...artistFilter, relevance: r })
                  }
                  className={`flex-1 py-4 border-2 border-white/10 font-black text-[9px] uppercase tracking-tighter transition-all ${
                    artistFilter.relevance === r
                      ? "bg-[#F5E000] text-black border-[#F5E000]"
                      : "bg-black text-white hover:bg-white/5"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-4 border-white/10 bg-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)] mt-8">
          <div className="p-20 text-center space-y-8">
            <Activity size={64} className="mx-auto opacity-10 text-[#F5E000]" />
            <p className="font-sans text-xl font-black uppercase tracking-tighter text-white/40">
              ARTIST INTELLIGENCE MODULE ACTIVE
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 max-w-sm mx-auto leading-relaxed">
              Filters applied. Showing agents matching your vectors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
