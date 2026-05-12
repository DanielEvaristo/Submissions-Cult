"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Zap, Globe, MessageSquare, Headphones, Newspaper, Radio, Headphones as HeadphonesIcon } from 'lucide-react';

export default function LandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const [isNavInverted, setIsNavInverted] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for Nav Inversion & Animations
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px 0px 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // If the section has bg-black, invert nav
          if (entry.target.classList.contains('bg-black') || entry.target.classList.contains('bg-[#0A0A0A]')) {
            setIsNavInverted(true);
          } else {
            setIsNavInverted(false);
          }
          // Simple reveal animation
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // Custom Cursor
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };
    window.addEventListener('mousemove', moveCursor);

    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  return (
    <div className={`font-sans selection:bg-[#F5E000] selection:text-black cursor-none bg-white`}>
      {/* ── Custom Cursor ── */}
      <div 
        ref={cursorRef}
        className={`fixed top-0 left-0 w-5 h-5 rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-75 ease-out scale-100 bg-white`}
        style={{ margin: '-10px 0 0 -10px' }}
      />

      <style jsx global>{`
        section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Ticker Animation */
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .ticker-animate {
          display: flex;
          white-space: nowrap;
          animation: ticker 40s linear infinite;
        }

        /* Hover effects */
        .btn-hover:hover {
          background-color: #0A0A0A;
          color: #F5E000;
        }

        .card-hover:hover {
          background-color: #F5F5F5;
          border-left: 8px solid #F5E000 !important;
        }
      `}</style>

      {/* ── 1. FIXED NAV ── */}
      <nav 
        className={`fixed top-0 w-full z-[1000] transition-all duration-500 border-b-4 h-24 flex items-center px-10 ${
          isNavInverted 
            ? 'bg-black border-white/10 text-white' 
            : 'bg-white border-black text-black'
        }`}
      >
        <div className="flex-1 flex items-center gap-3">
          <div className={`w-10 h-10 flex items-center justify-center font-black border-2 transition-colors ${isNavInverted ? 'bg-[#F5E000] text-black border-black' : 'bg-black text-[#F5E000] border-white/10'}`}>★</div>
          <span className="font-black text-2xl tracking-tighter uppercase leading-none">CULT MACHINE</span>
        </div>
        
        <div className="hidden lg:flex flex-1 justify-center gap-12 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">
          <a href="#how-it-works" className="hover:text-[#F5E000] transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-[#F5E000] transition-colors">Pricing</a>
          <a href="#partners" className="hover:text-[#F5E000] transition-colors">Industry</a>
        </div>

        <div className="flex-1 flex justify-end gap-8">
          <Link href={`/${locale}/login`} className="font-black text-[10px] uppercase tracking-widest self-center hover:underline decoration-4">Log In</Link>
          <Link 
            href={`/${locale}/submit-now`}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] border-2 transition-all ${
              isNavInverted 
                ? 'bg-[#F5E000] text-black border-black hover:bg-white' 
                : 'bg-black text-[#F5E000] border-[#F5E000] hover:bg-[#F5E000] hover:text-black'
            }`}
          >
            SUBMIT NOW
          </Link>
        </div>
      </nav>

      <main className="pt-24 overflow-hidden">
        
        {/* ── 2. HERO ── */}
        <section className="bg-black min-h-[95vh] flex flex-col justify-center relative overflow-hidden px-10">
          <div className="max-w-7xl mx-auto w-full relative z-10">
            <h1 className="text-white text-[clamp(60px,12vw,160px)] font-black uppercase leading-[0.88] tracking-tighter">
              GET <span className="text-[#F5E000] drop-shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">HEARD.</span><br />
              NOT<br />
              BURIED.
            </h1>
            
            <div className="mt-16 max-w-2xl space-y-12">
              <p className="text-white/40 text-2xl font-bold uppercase tracking-tight leading-snug">
                Your music belongs in the underground, but it shouldn't stay there. 
                Real editorial reach. Get response in 48h.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href={`/${locale}/submit-now`} className="bg-[#F5E000] text-black px-12 py-7 font-black text-sm uppercase tracking-[0.4em] hover:bg-white transition-all border-4 border-[#F5E000] shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1">
                  SUBMIT NOW — FREE
                </Link>
                <Link href={`/${locale}/login`} className="bg-black text-white px-12 py-7 font-black text-sm uppercase tracking-[0.4em] hover:bg-[#F5E000] hover:text-black transition-all border-4 border-white/20 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 text-center">
                  LOG IN
                </Link>
              </div>
            </div>
          </div>

          {/* Ticker */}
          <div className="absolute bottom-10 left-0 w-full overflow-hidden border-y-2 border-white/5 py-6">
            <div className="ticker-animate">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-white font-black text-xl uppercase tracking-[0.5em] mx-12 opacity-10">
                  ★ FREE SUBMISSIONS ★ REAL FEEDBACK ★ FAST RESPONSE ★ PRESS ARTICLES ★ INTERVIEWS ★
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. STATS BAR ── */}
        <section className="bg-white border-y-4 border-black grid grid-cols-1 md:grid-cols-4">
          {[
            { n: "1.7M+", label: "VIEWS", desc: "Last 30 days on IG" },
            { n: "623K+", label: "REACHED", desc: "Organic accounts" },
            { n: "92.8%", label: "NEW FANS", desc: "Non-follower reach" },
            { n: "2025", label: "FOUNDED", desc: "Independent editorial" },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`p-12 flex flex-col justify-center border-black transition-all duration-300 group hover:bg-[#F5E000] ${i !== 3 ? 'md:border-r-4' : ''} ${i !== 0 ? 'border-t-4 md:border-t-0' : ''}`}
            >
              <span className="text-6xl font-black tracking-tighter text-black mb-2 group-hover:scale-110 transition-transform origin-left">{stat.n}</span>
              <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] group-hover:text-black">{stat.label}</span>
              <span className="text-[10px] font-black text-black/20 uppercase tracking-tighter group-hover:text-black/60">{stat.desc}</span>
            </div>
          ))}
        </section>

        {/* ── 4. OPORTUNIDADES ── */}
        <section id="how-it-works" className="bg-white px-10 py-40 border-b-4 border-black">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-4 border-black pb-12">
              <h2 className="text-8xl font-black uppercase tracking-tighter leading-none text-black">THE OUTCOME</h2>
              <p className="font-black text-xs uppercase tracking-[0.4em] text-black/40 md:text-right max-w-xs">WHERE YOUR MUSIC ACTUALLY GOES.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black">
              {[
                { id: "01", name: "Weekly Recommendation", desc: "Featured in our curated highlights across all social channels and main site.", cost: "FREE" },
                { id: "02", name: "Spotify Playlist", desc: "Direct placement into our genre-specific 'Cult Sounds' playlists with active rotation.", cost: "ADD-ON" },
                { id: "03", name: "Web Radio", desc: "Track placement and shoutout in our weekly underground radio show.", cost: "ADD-ON" },
                { id: "04", name: "Album Story", desc: "Agency accounts only. Deep dive into your release's creative process and visuals.", cost: "PRO", disabled: true },
              ].map((opp, i) => (
                <div 
                  key={i} 
                  className={`p-16 border-black card-hover transition-all relative group ${i % 2 === 0 ? 'md:border-r-4' : ''} ${i < 2 ? 'border-b-4' : ''} ${opp.disabled ? 'opacity-40 grayscale' : ''}`}
                >
                  <span className="text-[120px] font-black text-black/5 absolute top-4 right-12 select-none group-hover:text-black/10 transition-colors leading-none">{opp.id}</span>
                  <div className="relative z-10">
                    <span className="inline-block px-4 py-1 border-2 border-black text-[10px] font-black uppercase mb-8 tracking-[0.3em] group-hover:bg-black group-hover:text-[#F5E000] transition-colors">
                      {opp.cost}
                    </span>
                    <h3 className="text-4xl font-black text-black uppercase tracking-tighter mb-6">{opp.name}</h3>
                    <p className="text-black/60 text-xl font-bold uppercase tracking-tight leading-snug max-w-sm">
                      {opp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 5. WHY CULT MACHINE ── */}
        <section className="bg-black px-10 py-40 flex flex-col lg:flex-row gap-32">
          <div className="lg:w-1/2">
            <span className="text-[#F5E000] text-[clamp(100px,20vw,280px)] font-black leading-none tracking-tighter drop-shadow-[10px_10px_0px_rgba(255,255,255,0.05)]">
              92.8%
            </span>
            <div className="max-w-xl mt-16 space-y-8">
              <h3 className="text-white text-5xl font-black uppercase tracking-tighter leading-none">OUTSIDE THE<br/>ECHO CHAMBER.</h3>
              <p className="text-white/40 text-2xl font-bold uppercase tracking-tight leading-snug">
                Most platforms reach the same people. Our reach is viral and organic. 
                Nearly all our views come from people who don't follow us yet. 
                That's how you get discovered.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-16">
            {[
              { t: "Editorial Identity", d: "We aren't a generic aggregator. We are a music magazine with a defined aesthetic and a loyal following." },
              { t: "Honest Curation", d: "We only accept 10-15% of submissions. If we pick you, it's because we actually love the track." },
              { t: "Fair Pricing", d: "No $50 submission packages. $1 per credit. High impact, low barrier to entry." },
              { t: "Real Partners", d: "We talk to labels and PR firms like RCA and Virgin. We bridge the gap." },
            ].map((item, i) => (
              <div key={i} className="flex gap-10 group">
                <span className="text-[#F5E000] text-5xl font-black italic opacity-20 group-hover:opacity-100 transition-opacity">0{i + 1}</span>
                <div className="space-y-4">
                  <h4 className="text-white text-3xl font-black uppercase tracking-tighter group-hover:text-[#F5E000] transition-colors">
                    {item.t}
                  </h4>
                  <p className="text-white/40 text-lg font-bold uppercase tracking-tight leading-snug">
                    {item.d}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 6. GÉNEROS ── */}
        <section className="bg-white px-10 py-40 border-y-4 border-black">
          <div className="max-w-7xl mx-auto space-y-24">
            <h2 className="text-black text-8xl font-black uppercase tracking-tighter leading-none">
              WE SPEAK YOUR<br />LANGUAGE.
            </h2>
            
            <div className="flex flex-wrap gap-4">
              {[
                "Post-Punk", "Darkwave", "Coldwave", "Minimal Synth", "New Wave", "Indie Rock", 
                "Alternative Rock", "Shoegaze", "Dream Pop", "Garage Rock", "Britpop", "Grunge", 
                "Synthwave", "Indie Electronic", "Electroclash", "Indie RnB", "Alt-Pop", 
                "Experimental Pop", "Lo-fi Indie", "Punk", "Noise Pop", "Art Rock"
              ].map((genre) => (
                <span 
                  key={genre}
                  className="px-8 py-4 border-4 border-black text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-[#F5E000] transition-all cursor-crosshair shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 7. PRICING ── */}
        <section id="pricing" className="bg-white px-10 py-40">
          <div className="max-w-7xl mx-auto space-y-32">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-4 border-black pb-12">
              <h2 className="text-8xl font-black uppercase tracking-tighter leading-none text-black">PRICING</h2>
              <p className="font-black text-xs uppercase tracking-[0.4em] text-black/40 md:text-right max-w-xs">FAIR ACCESS FOR EVERY ARTIST.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-4 border-black divide-x-0 md:divide-x-4 divide-y-4 md:divide-y-0 divide-black">
              {/* Card 1 */}
              <div className="p-16 flex flex-col justify-between hover:bg-[#F5F5F5] transition-colors">
                <div className="space-y-10">
                  <span className="inline-block px-3 py-1 bg-black text-[#F5E000] text-[8px] font-black uppercase tracking-[0.4em]">INITIAL STEP</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">First Track</h3>
                  <div className="text-8xl font-black tracking-tighter text-black leading-none">FREE</div>
                </div>
                <ul className="mt-24 space-y-6 text-xs font-black uppercase tracking-[0.2em] text-black/40">
                  <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" /> 1 Credit included</li>
                  <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" /> No expiration</li>
                  <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" /> Direct feedback</li>
                </ul>
              </div>

              {/* Card 2 - Highlight */}
              <div className="p-16 bg-[#F5E000] flex flex-col justify-between relative group shadow-[inset_0px_0px_60px_rgba(0,0,0,0.05)]">
                <div className="absolute top-0 left-0 w-full bg-black text-[#F5E000] text-center py-3 font-black text-[10px] uppercase tracking-[0.5em]">
                  MOST FAIR
                </div>
                <div className="pt-10 space-y-10">
                  <span className="inline-block px-3 py-1 border-2 border-black text-[8px] font-black uppercase tracking-[0.4em]">STANDARD RATE</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Single Credit</h3>
                  <div className="text-9xl font-black tracking-tighter text-black leading-none">$1</div>
                </div>
                <ul className="mt-24 space-y-6 text-xs font-black uppercase tracking-[0.2em] text-black">
                  <li className="flex items-center gap-3"><ArrowRight size={14} strokeWidth={4} /> 1 Submission</li>
                  <li className="flex items-center gap-3"><ArrowRight size={14} strokeWidth={4} /> Priority queue</li>
                  <li className="flex items-center gap-3"><ArrowRight size={14} strokeWidth={4} /> Playlist eval</li>
                </ul>
                <Link href={`/${locale}/submit-now`} className="mt-16 bg-black text-white w-full py-6 font-black text-xs uppercase tracking-[0.4em] text-center hover:bg-white hover:text-black transition-all border-4 border-black">
                  GET STARTED
                </Link>
              </div>

              {/* Card 3 */}
              <div className="p-16 flex flex-col justify-between hover:bg-[#F5F5F5] transition-colors">
                <div className="space-y-10">
                  <span className="inline-block px-3 py-1 bg-black text-[#F5E000] text-[8px] font-black uppercase tracking-[0.4em]">VOLUME PACKS</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Artist Packs</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between items-baseline border-b-2 border-black/10 pb-4">
                      <span className="font-black text-xs uppercase tracking-widest">5 Credits</span>
                      <span className="text-5xl font-black">$4</span>
                    </div>
                    <div className="flex justify-between items-baseline border-b-2 border-black/10 pb-4">
                      <span className="font-black text-xs uppercase tracking-widest">10 Credits</span>
                      <span className="text-5xl font-black">$7</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="font-black text-xs uppercase tracking-widest">20 Credits</span>
                      <span className="text-5xl font-black">$12</span>
                    </div>
                  </div>
                </div>
                <p className="mt-24 text-[10px] font-black uppercase tracking-[0.2em] italic text-black/20">
                  Credits never expire. No subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. TESTIMONIALS ── */}
        <section className="bg-black px-10 py-40 border-t-4 border-white/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { q: "Finally a platform that doesn't feel like a predatory ATM. They actually listened and gave real feedback.", a: "KALT", g: "POST-PUNK" },
              { q: "The reach on their Instagram is insane. My track got more streams from one story than three paid campaigns.", a: "LUNA PHASE", g: "SHOEGAZE" },
              { q: "Honest curation. I got rejected twice before being accepted, and that's why their feed is actually good.", a: "CYBERP0P", g: "MINIMAL SYNTH" },
            ].map((t, i) => (
              <div key={i} className="border-4 border-white/10 p-12 relative group hover:border-[#F5E000] transition-colors">
                <div className="absolute left-0 top-12 w-2 h-24 bg-[#F5E000] group-hover:h-full transition-all duration-500"></div>
                <p className="text-white text-2xl font-bold uppercase tracking-tight leading-snug mb-12">
                  "{t.q}"
                </p>
                <div className="pt-8 border-t-2 border-white/10">
                  <p className="text-white font-black text-sm uppercase tracking-[0.3em] group-hover:text-[#F5E000] transition-colors">{t.a}</p>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mt-2">{t.g}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 9. PARTNERS ── */}
        <section id="partners" className="bg-white border-y-4 border-black px-10 py-32 text-center">
          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.5em] mb-16">
            TRUSTED BY ARTISTS WORKING WITH
          </p>
          <div className="flex flex-wrap justify-center gap-x-20 gap-y-12 text-black font-black text-3xl md:text-5xl tracking-tighter uppercase opacity-80">
            <span className="hover:opacity-100 hover:text-[#F5E000] transition-all cursor-default">VIRGIN MUSIC</span>
            <span className="text-[#F5E000] opacity-20">/</span>
            <span className="hover:opacity-100 hover:text-[#F5E000] transition-all cursor-default">RCA</span>
            <span className="text-[#F5E000] opacity-20">/</span>
            <span className="hover:opacity-100 hover:text-[#F5E000] transition-all cursor-default">A&C RECORDS</span>
            <span className="text-[#F5E000] opacity-20">/</span>
            <span className="hover:opacity-100 hover:text-[#F5E000] transition-all cursor-default">BIG LOUD</span>
            <span className="text-[#F5E000] opacity-20">/</span>
            <span className="hover:opacity-100 hover:text-[#F5E000] transition-all cursor-default">PITCH PERFECT PR</span>
          </div>
        </section>

        {/* ── 10. FINAL CTA ── */}
        <section className="bg-black px-10 py-60 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F5E000]/5 pointer-events-none" />
          <h2 className="text-white text-[clamp(40px,10vw,140px)] font-black uppercase tracking-tighter leading-[0.85] mb-20 relative z-10">
            YOUR MUSIC DESERVES<br/>TO BE <span className="text-[#F5E000]">HEARD.</span>
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10">
            <Link href={`/${locale}/submit-now`} className="inline-block bg-[#F5E000] text-black px-20 py-10 font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all border-8 border-[#F5E000] shadow-[20px_20px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2">
              START NOW
            </Link>
          </div>
          <p className="text-white/20 mt-16 text-xs font-black uppercase tracking-[0.4em]">
            No credit card required for your first submission.
          </p>
        </section>

        {/* ── 11. FOOTER ── */}
        <footer className="bg-black border-t-4 border-white/10 px-10 py-24">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-32">
            <div className="space-y-10">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 bg-[#F5E000] text-black flex items-center justify-center font-black border-2 border-black text-xl">★</div>
                <span className="font-black text-3xl tracking-tighter uppercase leading-none">CULT MACHINE</span>
              </div>
              <p className="text-white/40 max-w-sm text-xs font-black uppercase tracking-[0.3em] leading-loose italic">
                INDIE EDITORIAL PLATFORM. FOR THE UNDERGROUND, BY THE UNDERGROUND.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-32">
              <div className="space-y-8">
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-[#F5E000]">LEGAL</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Guidelines</a></li>
                </ul>
              </div>

              <div className="space-y-8">
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-[#F5E000]">SOCIAL</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Email</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-32 pt-20 border-t-4 border-white/10 text-center">
            <p className="text-white/10 font-black italic text-xs tracking-[0.5em] uppercase">
              "The Only Cult You're Apart Of."
            </p>
            <p className="text-white/5 mt-4 text-[8px] font-black tracking-widest uppercase">© 2025 CULT MACHINE WORLDWIDE. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
