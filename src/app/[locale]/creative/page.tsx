"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Camera, Pen, Palette, Video, Heart, Sparkles, ArrowRight, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

const CREATIVE_TYPES = [
  { value: "PHOTOGRAPHER", label: "Photographer", icon: Camera, description: "Concert shots, editorial portraits, visual stories" },
  { value: "WRITER", label: "Writer", icon: Pen, description: "Reviews, interviews, blog posts, articles" },
  { value: "DESIGNER", label: "Designer", icon: Palette, description: "Graphics, artwork, visual identity pieces" },
  { value: "VIDEOGRAPHER", label: "Videographer", icon: Video, description: "Short films, clips, live session coverage" },
  { value: "FAN", label: "Fan / Community", icon: Heart, description: "Content creator, playlist curator, scene supporter" },
  { value: "OTHER", label: "Other Creative", icon: Sparkles, description: "Something else entirely — tell us about it" },
];

export default function CreativePage() {
  const locale = useLocale();
  const [form, setForm] = useState({
    name: "",
    email: "",
    creativeType: "",
    portfolioUrl: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.creativeType) {
      setError("Please select what kind of creative you are.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/creative-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <div className="max-w-lg w-full text-center space-y-8 animate-reveal">
          <div className="w-20 h-20 bg-[#F5E000] flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} strokeWidth={3} className="text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#F5E000] mb-4">REQUEST RECEIVED</p>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-6">
              WE GOT<br />YOUR WORK.★
            </h1>
            <p className="text-white/40 font-bold text-sm uppercase tracking-tight leading-relaxed">
              We'll review your submission and get back to you at <span className="text-white">{form.email}</span> if there's a match with our editorial needs.
            </p>
          </div>
          <Link
            href={`/${locale}/login`}
            className="inline-flex items-center gap-3 px-8 py-4 border-4 border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] hover:bg-[#F5E000] hover:text-black hover:border-[#F5E000] transition-all"
          >
            Back to Portal <ArrowRight size={14} strokeWidth={3} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* ── Top nav strip ─────────────────────────────────────────── */}
      <div className="border-b-2 border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}/login`} className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-lg">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT MACHINE</span>
        </Link>
        <Link
          href={`/${locale}/login`}
          className="text-white/40 hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors"
        >
          ← Back to Login
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10 animate-reveal">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <div className="border-b-4 border-white/10 pb-10">
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 mb-3 block">
            CREATIVE_COLLABORATIONS / OPEN_CALL
          </span>
          <h1 className="text-[clamp(36px,8vw,80px)] font-black uppercase leading-[0.85] tracking-tighter text-white mb-4">
            I'M A<br /><span className="text-[#F5E000]">CREATIVE.</span>★
          </h1>
          <p className="text-white/50 font-bold text-sm md:text-base uppercase tracking-tight max-w-xl leading-relaxed">
            Photographers, writers, designers, videographers, fans — if you want to contribute to Cult Machine's editorial content, this is your space.
          </p>
        </div>

        {/* ── Disclaimer ────────────────────────────────────────────── */}
        <div className="border-4 border-[#F5E000] bg-[#F5E000]/5 p-6 md:p-8">
          <div className="flex gap-4 items-start">
            <div className="shrink-0 w-10 h-10 bg-[#F5E000] flex items-center justify-center">
              <AlertTriangle size={20} strokeWidth={3} className="text-black" />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-[0.3em] text-[#F5E000] mb-3">
                PLEASE READ BEFORE SUBMITTING
              </p>
              <p className="text-white/80 font-bold text-sm leading-relaxed mb-2">
                Cult Machine is <span className="text-[#F5E000]">not hiring or paying</span> for this work. This is entirely voluntary.
              </p>
              <p className="text-white/50 font-bold text-xs uppercase tracking-tight leading-relaxed">
                We are opening this space to support each other as a community. At this time, Cult Machine cannot cover external work costs or take on contracted collaborators. By submitting, you understand that any collaboration would be on a volunteer, community-driven basis.
              </p>
            </div>
          </div>
        </div>

        {/* ── Form ──────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Creative type selection */}
          <div>
            <label className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-4 block">
              What kind of creative are you? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {CREATIVE_TYPES.map(({ value, label, icon: Icon, description }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, creativeType: value })}
                  className={`flex flex-col items-start p-5 border-4 text-left transition-all group ${
                    form.creativeType === value
                      ? "border-[#F5E000] bg-[#F5E000]/10"
                      : "border-white/10 hover:border-[#F5E000]/40 hover:bg-white/5"
                  }`}
                >
                  <div className={`w-8 h-8 flex items-center justify-center mb-3 transition-colors ${
                    form.creativeType === value ? "bg-[#F5E000] text-black" : "bg-white/10 text-white/40 group-hover:bg-[#F5E000]/20 group-hover:text-white"
                  }`}>
                    <Icon size={16} strokeWidth={3} />
                  </div>
                  <span className={`font-black text-xs uppercase tracking-widest mb-1 ${
                    form.creativeType === value ? "text-[#F5E000]" : "text-white"
                  }`}>{label}</span>
                  <span className="text-white/30 font-bold text-[9px] uppercase tracking-tight leading-tight">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="creative-name" className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 block">
                Full Name *
              </label>
              <input
                id="creative-name"
                type="text"
                required
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black border-2 border-white/10 p-5 font-sans text-base font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none placeholder:text-white/20"
              />
            </div>
            <div>
              <label htmlFor="creative-email" className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 block">
                Email Address *
              </label>
              <input
                id="creative-email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-black border-2 border-white/10 p-5 font-sans text-base font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Portfolio URL */}
          <div>
            <label htmlFor="creative-portfolio" className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 block">
              Portfolio / Instagram / Behance URL <span className="text-white/20">(optional)</span>
            </label>
            <input
              id="creative-portfolio"
              type="url"
              placeholder="https://instagram.com/yourhandle"
              value={form.portfolioUrl}
              onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
              className="w-full bg-black border-2 border-white/10 p-5 font-sans text-base font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none placeholder:text-white/20"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="creative-message" className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-3 block">
              What do you want to collaborate on? *
            </label>
            <textarea
              id="creative-message"
              required
              rows={6}
              maxLength={1000}
              placeholder="Tell us about your vision, the kind of content you create, and how you'd like to contribute to the Cult Machine editorial space..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full bg-black border-2 border-white/10 p-5 font-sans text-base font-black tracking-tight text-white focus:border-[#F5E000] focus:bg-[#F5E000]/5 transition-all outline-none placeholder:text-white/20 resize-none"
            />
            <p className="text-right text-[9px] font-black uppercase tracking-widest text-white/20 mt-1">
              {form.message.length}/1000
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-5 border-4 border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000] font-black uppercase text-[10px] tracking-[0.2em]">
              ERROR: {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#F5E000] text-black border-4 border-[#F5E000] font-sans font-black text-sm uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" strokeWidth={3} /> SENDING...</>
            ) : (
              <>SEND MY REQUEST <ArrowRight size={18} strokeWidth={3} /></>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="pt-4 border-t-2 border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">
            "FOR FANS, BY FANS." — Cult Machine is a community, not a corporation.
          </p>
        </div>
      </div>
    </div>
  );
}
