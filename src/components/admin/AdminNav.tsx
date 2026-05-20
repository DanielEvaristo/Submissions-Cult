"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BadgeCheck,
  Users,
  Music,
  LogOut,
  UserCheck,
  Palette,
  Bug,
  Menu,
  X,
  AlertTriangle
} from "lucide-react";

interface Props {
  locale: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/industry", label: "Industry Apps", icon: BadgeCheck, exact: false },
  { href: "/admin/artists", label: "Artists", icon: Users, exact: false },
  { href: "/admin/submissions", label: "Submissions", icon: Music, exact: false },
  { href: "/admin/staff", label: "Staff", icon: UserCheck, exact: false },
  { href: "/admin/creative-requests", label: "Creatives", icon: Palette, exact: false },
  { href: "/admin/bugs", label: "Bug Reports", icon: Bug, exact: false },
];

const LOCALES = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇲🇽" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

export default function AdminNav({ locale }: Props) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    const full = `/${locale}${href}`;
    return exact ? pathname === full : pathname.startsWith(full);
  };

  const switchLocale = (newLocale: string) => {
    const segments = window.location.pathname.split("/");
    segments[1] = newLocale;
    window.location.href = segments.join("/");
  };

  const currentLang = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-10 border-b-4 border-white/10 bg-black text-white shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">
            CULT MACHINE
          </p>
        </div>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter">
          ADMIN<br/>PANEL
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-10 px-0 overflow-y-auto">
        <p className="px-6 mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Management
        </p>
        <div className="space-y-0">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={`/${locale}${href}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 transition-all duration-150 font-sans text-sm font-black uppercase tracking-widest border-b-2 border-white/5 last:border-b-0 ${
                  active
                    ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3"
                    : "text-white/60 hover:bg-white/5 hover:text-[#F5E000]"
                }`}
              >
                <Icon size={18} className="shrink-0" strokeWidth={3} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Language Switcher */}
        <div className="lg:hidden mt-10 px-6">
          <p className="mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
            System Language
          </p>
          <div className="flex flex-wrap gap-2">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => switchLocale(l.code)}
                className={`px-4 py-2 border-2 border-white/10 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
                  locale === l.code ? "bg-[#F5E000] text-black" : "bg-black text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-0 py-0 border-t-4 border-white/10 mt-auto shrink-0 flex flex-col">
        <button
          onClick={() => {
            window.dispatchEvent(new Event("open-bug-report"));
            setIsOpen(false);
          }}
          className="w-full flex items-center gap-4 px-6 py-4 font-sans text-sm font-black uppercase tracking-widest text-white/40 hover:bg-red-500 hover:text-white transition-all duration-150 border-b-2 border-white/5"
        >
          <AlertTriangle size={18} className="shrink-0" strokeWidth={3} />
          Report a Bug
        </button>
        <button
          id="admin-signout-btn"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="w-full flex items-center gap-4 px-6 py-6 font-sans text-sm font-black uppercase tracking-widest text-white/40 hover:bg-[#F5E000] hover:text-black transition-all duration-150"
        >
          <LogOut size={18} className="shrink-0" strokeWidth={3} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-black border-b-2 border-[#F5E000]/20 flex items-center justify-between px-6 z-[1001]">
        <div className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-xl">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT ADMIN</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-[#F5E000]">
          {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[1000] bg-black pt-16 flex flex-col">
          <NavContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 border-r-4 border-white/10 bg-black min-h-screen flex-col sticky top-0 h-screen">
        <NavContent />
      </aside>
    </>
  );
}
