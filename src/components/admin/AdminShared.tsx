"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

// ─── Colour palette ───────────────────────────────────────────────────────────

export const YELLOW = "#F5E000";
export const BLACK = "#0A0A0A";
export const MUTED = "#6B6B70";
export const COLORS = [YELLOW, "#000000", "#333333", "#666666", "#999999", "#CCCCCC"];

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "#000000",
  IN_REVIEW: "#333333",
  CURATOR_APPROVED: YELLOW,
  CURATOR_REJECTED: "#666666",
  MASTER_REVIEW: "#000000",
  ACCEPTED: YELLOW,
  REJECTED: "#FF0000",
};

// ─── Shared Components ────────────────────────────────────────────────────────

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-end justify-between border-b-4 border-white/10 pb-4 mb-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#F5E000] text-black">
          <Icon size={24} strokeWidth={3} />
        </div>
        <div>
          <h2 className="font-sans text-4xl font-black uppercase tracking-tighter text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-white/60 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="hidden md:block text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
        CULT MACHINE // ADM SYS 01
      </div>
    </div>
  );
}

export function StatCard({
  title,
  value,
  growth,
  subtext,
  color,
  href,
}: {
  title: string;
  value: string | number;
  growth?: number;
  subtext?: string;
  color?: string;
  href?: string;
}) {
  const isPositive = growth !== undefined && growth >= 0;

  const inner = (
    <div
      className={`group relative overflow-hidden flex flex-col justify-between h-56 p-8 border-4 border-white/10 rounded-none transition-all duration-150 hover:bg-[#F5E000] hover:text-black shadow-[8px_8px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 ${
        color || "bg-black text-white"
      }`}
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <span className="block font-sans text-[12px] font-black uppercase tracking-[0.2em] opacity-80">
            {title}
          </span>
          {growth !== undefined && (
            <span
              className={`font-black text-[10px] px-2 py-0.5 border-2 border-black ${
                isPositive ? "bg-[#00FF00] text-black" : "bg-[#FF0000] text-white"
              }`}
            >
              {isPositive ? "+" : ""}
              {growth}%
            </span>
          )}
        </div>
        <span className="block font-sans text-5xl md:text-6xl font-black tracking-tighter leading-none">
          {value}
        </span>
      </div>
      <div className="relative z-10 flex items-end justify-between mt-auto">
        {subtext && (
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-80">
            {subtext}
          </span>
        )}
        <div className="w-8 h-8 border-2 border-current flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity">
          →
        </div>
      </div>
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export function AlertBadge({ count, label }: { count: number; label: string }) {
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

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-bg-elevated border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="font-sans text-xs font-semibold text-cm-text-secondary mb-1">
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <p
          key={i}
          className="font-sans text-sm font-bold"
          style={{ color: p.color ?? "#F5E000" }}
        >
          {p.value}
        </p>
      ))}
    </div>
  );
};
