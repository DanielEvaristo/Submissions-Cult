"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Send, ListMusic, User, LayoutDashboard, Menu, X, Coins, LogOut } from "lucide-react";

interface Props {
  locale: string;
}

export default function PortalNav({ locale }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dbCredits, setDbCredits] = useState<number | null>(null);

  const refreshBalance = async () => {
    try {
      const res = await fetch("/api/user/balance");
      if (res.ok) {
        const data = await res.json();
        setDbCredits(data.credits);
      }
    } catch (err) {
      console.error("Nav balance fetch error:", err);
    }
  };

  useEffect(() => { refreshBalance(); }, []);
  useEffect(() => { refreshBalance(); }, [pathname]);

  // Lock body scroll when menu is open on mobile
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const credits = dbCredits ?? session?.user?.credits ?? 0;

  const navLinks = [
    { href: `/${locale}/portal`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${locale}/portal/submit`, label: t("submit"), icon: Send },
    { href: `/${locale}/portal/submissions`, label: t("mySubmissions"), icon: ListMusic },
    { href: `/${locale}/portal/credits`, label: "Credits", icon: Coins },
    { href: `/${locale}/portal/profile`, label: t("profile"), icon: User },
  ];

  const bottomLinks = [
    { href: `/${locale}/portal`, label: "Home", icon: LayoutDashboard, exact: true },
    { href: `/${locale}/portal/submit`, label: "Submit", icon: Send },
    { href: `/${locale}/portal/submissions`, label: "Tracks", icon: ListMusic },
    { href: `/${locale}/portal/profile`, label: "Profile", icon: User },
  ];

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-8 border-b-4 border-white/10 bg-black text-white shrink-0">
        <Link href={`/${locale}/portal`} className="flex items-center gap-2 mb-2" onClick={() => setIsOpen(false)}>
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">CULT MACHINE</p>
        </Link>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter text-white">
          ARTIST<br />PORTAL
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-8 px-0 overflow-y-auto">
        <p className="px-6 mb-4 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Management
        </p>

        {/* Wallet */}
        <div className="px-6 mb-6">
          <div className="p-4 bg-[#F5E000] border-4 border-black shadow-[4px_4px_0px_0px_rgba(245,224,0,0.3)]">
            <p className="font-sans text-[8px] font-black uppercase tracking-widest text-black/40 mb-1">CREDITS AVAILABLE</p>
            <div className="flex items-center gap-2 text-black">
              <Coins size={16} />
              <span className="text-2xl font-black tracking-tighter">{credits}</span>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
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
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t-4 border-white/10 mt-auto shrink-0 space-y-4">
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
        <Link href={`/${locale}/portal`} className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-lg">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT PORTAL</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/${locale}/portal/credits`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5E000] text-black font-black text-[10px] uppercase tracking-widest"
          >
            <Coins size={11} strokeWidth={3} />
            {credits}
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

      {/* ── Mobile Full-Screen Overlay (animated) ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[1000] bg-black pt-14 flex flex-col transition-all duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto translate-x-0" : "opacity-0 pointer-events-none -translate-x-3"
        }`}
      >
        <NavContent />
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-black border-t-2 border-white/10 z-[999]">
        <div className="grid grid-cols-4 h-16">
          {bottomLinks.map(({ href, label, icon: Icon, exact }) => {
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
                <span className="font-sans text-[9px] font-black uppercase tracking-widest">{label}</span>
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
