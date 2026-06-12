"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, Star, Zap, Globe, MessageSquare, Headphones, Newspaper, Radio, Headphones as HeadphonesIcon } from 'lucide-react';

export default function LandingPage({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const t = useTranslations();
  const [isNavInverted, setIsNavInverted] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);


  // Animations and Nav Inversion logic
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll('section'));

    // 1. Observer for reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    
    sections.forEach((section) => observer.observe(section));

    // 2. Scroll listener for Nav inversion
    const handleScroll = () => {
      const triggerPoint = 97; // Just past the bottom of the 96px tall fixed nav
      let currentSection = null;

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
          currentSection = section;
          break;
        }
      }

      if (currentSection) {
        const isBlack = currentSection.classList.contains('bg-black') || currentSection.classList.contains('bg-[#0A0A0A]');
        // The user wants high contrast: Black nav over White sections, White nav over Black sections.
        setIsNavInverted(!isBlack);
      } else {
        // Fallback for top of page gap
        setIsNavInverted(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check on load
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`font-sans selection:bg-[#F5E000] selection:text-black bg-white text-black`}>

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
          <span className="font-black text-2xl tracking-tighter uppercase leading-none flex items-center gap-2">
            CULT <span className={`text-[1.2em] transition-colors ${isNavInverted ? 'text-black' : 'text-[#F5E000]'}`}>★</span> MACHINE
          </span>
        </div>
        
        <div className="hidden lg:flex flex-1 justify-center gap-12 font-black text-[10px] tracking-[0.3em] uppercase opacity-60">
          <a href="#how-it-works" className="hover:text-[#F5E000] transition-colors">{t('landing.nav.howItWorks')}</a>
          <a href="#pricing" className="hover:text-[#F5E000] transition-colors">{t('landing.nav.pricing')}</a>
          <a href="#partners" className="hover:text-[#F5E000] transition-colors">{t('landing.nav.industry')}</a>
          <a href="#faq" className="hover:text-[#F5E000] transition-colors">FAQ</a>
        </div>

        <div className="flex-1 flex justify-end gap-6 md:gap-8 items-center relative">
          
          {/* Language Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:text-[#F5E000] transition-colors"
            >
              {locale.toUpperCase()} 
              <span className="text-[8px]">{isLangOpen ? '▲' : '▼'}</span>
            </button>
            
            {isLangOpen && (
              <div className={`absolute top-[200%] right-0 border-4 p-2 flex flex-col min-w-[120px] z-50 ${
                isNavInverted 
                  ? 'bg-black border-[#F5E000] text-white shadow-[4px_4px_0px_0px_#F5E000]' 
                  : 'bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
                <a 
                  href="/en/landing" 
                  className={`font-black text-[10px] uppercase tracking-widest px-4 py-3 hover:bg-[#F5E000] hover:text-black transition-colors ${locale === 'en' ? 'text-[#F5E000]' : ''}`}
                >
                  ENGLISH
                </a>
                <a 
                  href="/es/landing" 
                  className={`font-black text-[10px] uppercase tracking-widest px-4 py-3 hover:bg-[#F5E000] hover:text-black transition-colors ${locale === 'es' ? 'text-[#F5E000]' : ''}`}
                >
                  ESPAÑOL
                </a>
                <a 
                  href="/fr/landing" 
                  className={`font-black text-[10px] uppercase tracking-widest px-4 py-3 hover:bg-[#F5E000] hover:text-black transition-colors ${locale === 'fr' ? 'text-[#F5E000]' : ''}`}
                >
                  FRANÇAIS
                </a>
              </div>
            )}
          </div>
          <Link href={`/${locale}/login`} className="font-black text-[10px] uppercase tracking-widest self-center hover:underline decoration-4">{t('landing.nav.logIn')}</Link>
          <Link 
            href={`/${locale}/role-selection`}
            className={`px-8 py-4 font-black text-[10px] uppercase tracking-[0.3em] border-2 transition-all ${
              isNavInverted 
                ? 'bg-[#F5E000] text-black border-black hover:bg-white' 
                : 'bg-black text-[#F5E000] border-[#F5E000] hover:bg-[#F5E000] hover:text-black'
            }`}
          >
            {t('landing.nav.submitNow')}
          </Link>
        </div>
      </nav>

      <main className="pt-24 overflow-hidden">
        
        {/* ── 2. HERO ── */}
        <section className="relative min-h-screen flex items-center pt-32 pb-20 px-6 md:px-10 bg-black text-white overflow-hidden">
          <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-8">
              <h1 className="text-[clamp(60px,10vw,140px)] font-black uppercase leading-[0.85] tracking-tighter">
                GET <span className="text-[#F5E000] drop-shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">HEARD</span>,<br />
                NOT BURIED.
              </h1>
              <div className="text-lg md:text-2xl font-bold max-w-2xl text-white/80 leading-tight space-y-4">
                <p>The official submissions platform of Cult Machine.</p>
                <p>Real ears. Honest curation. All submissions for free.</p>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row gap-6">
                <Link 
                  href={`/${locale}/role-selection`} 
                  className="bg-[#F5E000] text-black px-10 py-6 font-black text-sm uppercase tracking-[0.2em] border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all flex items-center justify-center gap-4"
                >
                  {t('landing.hero.ctaFree')} <ArrowRight size={20} strokeWidth={3} />
                </Link>
                <Link href={`/${locale}/login`} className="bg-black text-white px-12 py-7 font-black text-sm uppercase tracking-[0.4em] hover:bg-[#F5E000] hover:text-black transition-all border-4 border-white/20 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 text-center">
                  {t('landing.nav.logIn')}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Ticker */}
          <div className="absolute bottom-10 left-0 w-full overflow-hidden border-y-2 border-white/5 py-6">
            <div className="ticker-animate">
              {[...Array(10)].map((_, i) => (
                <span key={i} className="text-white font-black text-xl uppercase tracking-[0.5em] mx-12 opacity-10">
                  {t('landing.hero.marquee')}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3. STATS BAR ── */}
        <section className="bg-white border-y-4 border-black grid grid-cols-1 md:grid-cols-3">
          {[
            { n: "1.0M+", label: t('landing.stats.views'), desc: t('landing.stats.viewsDesc') },
            { n: "400K+", label: t('landing.stats.reached'), desc: t('landing.stats.reachedDesc') },
            { n: "2025", label: t('landing.stats.founded'), desc: t('landing.stats.foundedDesc') },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`p-12 flex flex-col justify-center border-black transition-all duration-300 group hover:bg-[#F5E000] ${i !== 2 ? 'md:border-r-4' : ''} ${i !== 0 ? 'border-t-4 md:border-t-0' : ''}`}
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
              <h2 className="text-8xl font-black uppercase tracking-tighter leading-none text-black">{t('landing.outcome.title')}</h2>
              <p className="font-black text-xs uppercase tracking-[0.4em] text-black/40 md:text-right max-w-xs">{t('landing.outcome.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-4 border-black">
              {[
                { id: "01", name: "RADAR", desc: t('landing.outcome.item1.desc'), cost: t('landing.outcome.item1.cost') },
                { id: "02", name: "INTERNET WAVE", desc: t('landing.outcome.item2.desc'), cost: t('landing.outcome.item2.cost') },
                { id: "03", name: "STORIES", desc: t('landing.outcome.item3.desc'), cost: t('landing.outcome.item3.cost') },
                { id: "04", name: "PREMIUM PR", desc: t('landing.outcome.item4.desc'), cost: t('landing.outcome.item4.cost'), disabled: true },
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
            <p className="text-right text-xs font-black uppercase tracking-[0.3em] text-black/40 mt-8">
              More coming soon...
            </p>
          </div>
        </section>

        <section className="bg-black px-10 py-40 flex flex-col lg:flex-row gap-32">
          <div className="lg:w-1/2">
            <span className="text-[#F5E000] text-[clamp(100px,20vw,280px)] font-black leading-none tracking-tighter drop-shadow-[10px_10px_0px_rgba(255,255,255,0.05)]">
              +1M
            </span>
            <div className="max-w-xl mt-16 space-y-8">
              <h3 className="text-white text-5xl font-black uppercase tracking-tighter leading-none">
                EVERY SUBMISSION<br/>GETS A RESPONSE.
              </h3>
              <p className="text-white/40 text-2xl font-bold uppercase tracking-tight leading-snug">
                We listen to everything. No ghost rejections, no black holes. If you send it, we hear it — and we'll tell you what we think.
              </p>
            </div>
          </div>
          
          <div className="lg:w-1/2 space-y-16">
            {[
              { t: "100% RESPONSE RATE", d: "Every track submitted gets reviewed and responded to. Always. No exceptions." },
              { t: "REAL PUBLICATION. REAL TEAM.", d: "We're an active music magazine with original content, real writers, and an international editorial team discovering music from every corner of the world." },
              { t: "ALL SUBMISSIONS FREE", d: "Your first submission costs nothing. No credit card, no catch. We built this for artists who are working hard, not for those with big budgets." },
              { t: "BUILT ON REAL ENGAGEMENT", d: "1.0M+ views. 400K+ accounts reached. 184K+ interactions. That's not inflated. That's organic." },
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
        <section className="bg-[#F5E000] py-32 px-10 border-b-4 border-black text-black overflow-hidden relative">
          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="flex-1 min-w-[300px]">
              <h3 className="text-6xl font-black uppercase tracking-tighter leading-none">
                {t('landing.genres.title1')}<br />{t('landing.genres.title2')}
              </h3>
            </div>
            <div className="flex-[2] flex flex-wrap gap-4">
              {[
                "INDIE ROCK",
                "INDIE POP",
                "POP PUNK",
                "PUNK",
                "ALTERNATIVE",
                "POST-PUNK",
                "SHOEGAZE",
                "ELECTRONIC",
                "HIP HOP"
              ].map((genre, i) => (
                <span 
                  key={genre}
                  className="px-8 py-4 border-4 border-black text-xs font-black uppercase tracking-[0.3em] hover:bg-black hover:text-[#F5E000] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
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
              <h2 className="text-8xl font-black uppercase tracking-tighter leading-none text-black">{t('landing.pricing.title')}</h2>
              <p className="font-black text-xs uppercase tracking-[0.4em] text-black/40 md:text-right max-w-xs">{t('landing.pricing.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 - ALL SUBMISSIONS FREE (Highlighted) */}
              <div className="p-12 md:p-16 bg-[#F5E000] flex flex-col justify-between relative border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 md:-translate-y-4 z-10">
                <div className="absolute top-0 left-0 w-full bg-black text-[#F5E000] text-center py-3 font-black text-[10px] uppercase tracking-[0.5em]">
                  CORE EXPERIENCE
                </div>
                <div className="pt-10 space-y-10">
                  <span className="inline-block px-3 py-1 bg-white text-black text-[8px] font-black uppercase tracking-[0.4em]">START HERE</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter text-black">ALL SUBMISSIONS</h3>
                  <div className="text-8xl font-black tracking-tighter text-black leading-none">FREE</div>
                </div>
                <div className="mt-24 space-y-8">
                  <ul className="space-y-6 text-xs font-black uppercase tracking-[0.2em] text-black/60">
                    <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0" /> Unlimited Submissions</li>
                    <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0" /> Direct Feedback</li>
                    <li className="flex items-center gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0" /> No Expiration</li>
                  </ul>
                </div>
                <Link href={`/${locale}/role-selection`} className="mt-16 bg-black text-white w-full py-6 font-black text-xs uppercase tracking-[0.4em] text-center hover:bg-[#F5E000] hover:text-black transition-all border-4 border-black">
                  GET STARTED
                </Link>
              </div>

              {/* Card 2 - ADD-ONS */}
              <div className="p-12 md:p-16 flex flex-col justify-between bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                <div className="space-y-10">
                  <span className="inline-block px-3 py-1 bg-black text-[#F5E000] text-[8px] font-black uppercase tracking-[0.4em]">ENHANCE YOUR EXPERIENCE</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">ADD-ONS</h3>
                  <div className="text-5xl font-black tracking-tighter text-black leading-none">
                    1 CREDIT <span className="text-sm tracking-normal text-black/40 inline-block align-middle ml-2">EACH</span>
                  </div>
                </div>
                <ul className="mt-24 space-y-6 text-xs font-black uppercase tracking-[0.2em] text-black/60">
                  <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Fast response (48 hours)</li>
                  <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Song review</li>
                  <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Apply to all channels</li>
                  <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Listen to full EP / Album</li>
                </ul>
              </div>

              {/* Card 3 - PREMIUM PR */}
              <div className="p-12 md:p-16 flex flex-col justify-between bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                <div className="space-y-10">
                  <span className="inline-block px-3 py-1 bg-black text-[#F5E000] text-[8px] font-black uppercase tracking-[0.4em]">INVITE ONLY</span>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">PREMIUM PR</h3>
                  <div className="text-xl font-black tracking-tighter text-black/40 leading-snug">FOR ELIGIBLE ARTISTS</div>
                </div>
                <div className="mt-24 space-y-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60 leading-relaxed mb-8">
                    If you meet the requirements (10k+ followers), unlock our top tier PR services.
                  </p>
                  <ul className="space-y-6 text-xs font-black uppercase tracking-[0.2em] text-black/60">
                    <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Exclusive Interviews</li>
                    <li className="flex items-start gap-3"><Zap size={14} fill="currentColor" className="text-black shrink-0 mt-1" /> Dedicated Articles</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Credit Packs */}
            <div className="mt-16 bg-white border-4 border-black p-12 md:p-16 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b-4 border-black pb-8 mb-8">
                <h3 className="text-4xl font-black uppercase tracking-tighter">CREDIT PACKS</h3>
                <span className="inline-block px-3 py-1 bg-black text-[#F5E000] text-[8px] font-black uppercase tracking-[0.4em]">DISCOUNTED RATES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
                <div className="flex justify-between items-baseline border-b-2 border-black/10 md:border-none pb-4 md:pb-0">
                  <span className="font-black text-sm uppercase tracking-widest text-black/60">5 CREDITS</span>
                  <span className="text-4xl font-black">$4</span>
                </div>
                <div className="flex justify-between items-baseline border-b-2 border-black/10 md:border-none pb-4 md:pb-0">
                  <span className="font-black text-sm uppercase tracking-widest text-black/60">10 CREDITS</span>
                  <span className="text-4xl font-black">$7</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-black text-sm uppercase tracking-widest text-black/60">20 CREDITS</span>
                  <span className="text-4xl font-black">$12</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. PARTNERS ── */}
        <section id="partners" className="bg-white border-y-4 border-black py-20 text-center overflow-hidden">
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
              display: flex;
              width: max-content;
            }
          `}} />
          <p className="text-black/40 text-[10px] font-black uppercase tracking-[0.5em] mb-16">
            TRUSTED BY
          </p>
          <div className="relative flex overflow-hidden whitespace-nowrap">
            <div className="animate-marquee flex gap-x-20 font-black text-4xl md:text-6xl tracking-tighter uppercase opacity-80 text-black">
              {[
                "RCA",
                "VIRGIN MUSIC",
                "AWAL",
                "ARTS & CRAFTS",
                "BIG LOUD",
                "PITCH PERFECT",
                "TRUCK FESTIVAL",
                "BUZZ MUSIC",
                "THE SAKAI GROUP",
                "PFR RECORDS",
                // Repeat for seamless loop
                "RCA",
                "VIRGIN MUSIC",
                "AWAL",
                "ARTS & CRAFTS",
                "BIG LOUD",
                "PITCH PERFECT",
                "TRUCK FESTIVAL",
                "BUZZ MUSIC",
                "THE SAKAI GROUP",
                "PFR RECORDS"
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-x-20">
                  <span className="hover:text-[#F5E000] hover:scale-110 transition-all cursor-default">{p}</span>
                  <span className="text-[#F5E000] opacity-30 text-3xl">★</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 10. FAQ ── */}
        <section id="faq" className="bg-[#F5E000] border-y-4 border-black px-10 py-40">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none text-black text-center mb-24">
              FREQUENTLY<br />ASKED QUESTIONS
            </h2>
            <div className="space-y-4">
              {[
                { q: "HOW LONG DOES IT TAKE TO GET A RESPONSE?", a: "With our standard free submission, we usually reply within 7-14 days. If you use the Fast Response Add-on, we guarantee a reply in under 48 hours." },
                { q: "WHAT GENRES DO YOU COVER?", a: "We focus heavily on alternative sounds that appeal to young audiences. Indie rock, indie pop, pop punk, shoegaze, electronic, and hip hop are our favorites, but if it's good, we'll listen." },
                { q: "IS IT REALLY FREE?", a: "Yes. Your first submission has zero cost. We don't believe artists should have to pay just to be heard. We charge for optional Add-ons like detailed reviews or fast tracking." },
                { q: "HOW DOES PREMIUM PR WORK?", a: "Premium PR is an invite-only tier. If you have over 10k followers on Instagram or Spotify, our team can work with you on exclusive interviews and dedicated articles to further push your releases." }
              ].map((faq, i) => (
                <div key={i} className="border-4 border-black bg-white p-8 md:p-12 transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group cursor-default">
                  <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black mb-4 transition-colors">{faq.q}</h3>
                  <p className="text-black/60 font-bold uppercase tracking-tight leading-snug">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 11. FINAL CTA ── */}
        <section className="bg-black px-10 py-60 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#F5E000]/5 pointer-events-none" />
          <h2 className="text-white text-[clamp(40px,10vw,140px)] font-black uppercase tracking-tighter leading-[0.85] mb-20 relative z-10">
            {t('landing.cta.title1')}<br/>{t('landing.cta.titleHighlight')}
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-8 relative z-10">
            <Link href={`/${locale}/role-selection`} className="inline-block bg-[#F5E000] text-black px-20 py-10 font-black text-2xl uppercase tracking-[0.4em] hover:bg-white transition-all border-8 border-[#F5E000] shadow-[20px_20px_0px_0px_rgba(245,224,0,0.1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2">
              {t('landing.cta.button')}
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
                <span className="font-black text-3xl tracking-tighter uppercase leading-none flex items-center gap-2">
                  CULT <span className="text-[#F5E000] text-[1.2em]">★</span> MACHINE
                </span>
              </div>
              <p className="text-white/40 max-w-sm text-xs font-black uppercase tracking-[0.3em] leading-loose italic">
                Global Indie Music Magazine For Fans, By Fans.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-32">
              <div className="space-y-8">
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-[#F5E000]">LEGAL</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">PRIVACY POLICY</Link></li>
                  <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">TERMS OF SERVICE</Link></li>
                  <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              <div className="space-y-8">
                <p className="font-black text-[10px] uppercase tracking-[0.5em] text-[#F5E000]">ABOUT</p>
                <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                  <li><a href="https://cult-machine.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WEB</a></li>
                  <li><a href="https://www.instagram.com/cult.machine" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">INSTA</a></li>
                  <li><a href="mailto:cultmachinemag@gmail.com" className="hover:text-white transition-colors">EMAIL</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-32 pt-20 border-t-4 border-white/10 text-center">
            <p className="text-white/10 font-black italic text-xs tracking-[0.5em] uppercase">
              "{t('landing.footer.slogan')}"
            </p>
            <p className="text-white/5 mt-4 text-[8px] font-black tracking-widest uppercase">© 2026 CULT MACHINE. ALL RIGHTS RESERVED.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
