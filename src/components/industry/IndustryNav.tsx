"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  User,
  Inbox,
  Menu,
  X,
  CreditCard,
  Send,
  LogOut,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function IndustryNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/balance")
      .then((r) => r.json())
      .then((d) => setCredits(d.credits))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const navItems = [
    { name: "Dashboard",      href: `/${locale}/industry`,             icon: LayoutDashboard, exact: true },
    { name: "My Artists",     href: `/${locale}/industry/artists`,     icon: Users },
    { name: "Submit Track",   href: `/${locale}/industry/submit`,      icon: Send },
    { name: "Submissions",    href: `/${locale}/industry/submissions`,  icon: Inbox },
    { name: "Agency Profile", href: `/${locale}/industry/profile`,     icon: User },
    { name: "Credits",        href: `/${locale}/industry/credits`,     icon: CreditCard },
  ];

  const bottomLinks = [
    { name: "Home",      href: `/${locale}/industry`,            icon: LayoutDashboard, exact: true },
    { name: "Artists",   href: `/${locale}/industry/artists`,    icon: Users },
    { name: "Submit",    href: `/${locale}/industry/submit`,     icon: Send },
    { name: "Activity",  href: `/${locale}/industry/submissions`, icon: Inbox },
  ];

  const displayCredits = credits ?? session?.user?.credits ?? 0;

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-8 border-b-4 border-white/10 bg-black text-white shrink-0">
        <Link href={`/${locale}/industry`} className="flex items-center gap-2 mb-2" onClick={() => setIsOpen(false)}>
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">CULT MACHINE</p>
        </Link>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter text-white">
          AGENCY<br />DASH
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-8 px-0 overflow-y-auto">
        <p className="px-6 mb-4 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Agency Menu
        </p>

        {/* Credits widget */}
        <div className="px-6 mb-6">
          <div className="p-4 bg-[#F5E000] border-4 border-black shadow-[4px_4px_0px_0px_rgba(245,224,0,0.3)]">
            <p className="font-sans text-[8px] font-black uppercase tracking-widest text-black/40 mb-1">CREDITS AVAILABLE</p>
            <div className="flex items-center gap-2 text-black">
              <Zap size={16} strokeWidth={3} />
              <span className="text-2xl font-black tracking-tighter">{displayCredits}</span>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {navItems.map(({ name, href, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-5 transition-all font-sans text-xs font-black uppercase tracking-widest border-b-2 border-white/5 last:border-b-0 ${
                  isActive
                    ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3"
                    : "text-white/60 hover:bg-white/5 hover:text-[#F5E000]"
                }`}
              >
                <Icon size={18} strokeWidth={3} />
                {name}
              </Link>
            );
          })}

          {/* Curator inbox if staff */}
          {session?.user?.isCurator && (
            <>
              <p className="px-6 pt-8 pb-4 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
                Staff
              </p>
              <Link
                href={`/${locale}/curator`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-5 transition-all font-sans text-xs font-black uppercase tracking-widest border-b-2 border-white/5 ${
                  pathname.startsWith(`/${locale}/curator`)
                    ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3"
                    : "text-white/60 hover:bg-white/5 hover:text-[#F5E000]"
                }`}
              >
                <Inbox size={18} strokeWidth={3} />
                Curator Inbox
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t-4 border-white/10 mt-auto shrink-0 space-y-4">
        <button
          onClick={() => {
            window.dispatchEvent(new Event("open-bug-report"));
            setIsOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 border-2 border-white/10 text-white/40 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-sans text-[10px] font-black uppercase tracking-widest"
        >
          <AlertTriangle size={14} strokeWidth={3} />
          Report a Bug
        </button>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="w-full flex items-center gap-3 px-4 py-3 border-2 border-white/10 text-white/40 hover:bg-[#F5E000] hover:text-black hover:border-[#F5E000] transition-all font-sans text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} strokeWidth={3} />
          Sign Out
        </button>
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic text-center">
          "FOR FANS, BY FANS."
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile Top Bar ── */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-14 bg-black border-b-2 border-[#F5E000]/20 flex items-center justify-between px-4 z-[1001]">
        <Link href={`/${locale}/industry`} className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-lg">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT AGENCY</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/industry/credits`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5E000] text-black font-black text-[10px] uppercase tracking-widest"
          >
            <Zap size={11} strokeWidth={3} />
            {displayCredits}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-9 h-9 flex items-center justify-center border-2 border-white/20 text-[#F5E000] hover:bg-[#F5E000] hover:text-black transition-all"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={18} strokeWidth={3} /> : <Menu size={18} strokeWidth={3} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Overlay (animated) ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[1000] bg-black pt-14 flex flex-col transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto translate-x-0" : "opacity-0 pointer-events-none -translate-x-3"
        }`}
      >
        <NavContent />
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black border-t-2 border-white/10 z-[999]">
        <div className="grid grid-cols-4 h-16">
          {bottomLinks.map(({ name, href, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? "bg-[#F5E000] text-black" : "text-white/30 hover:text-white"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                <span className="font-sans text-[9px] font-black uppercase tracking-widest">{name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 bg-black border-r-4 border-white/10 flex-col h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>
    </>
  );
}
