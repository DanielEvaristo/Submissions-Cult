"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Send, ListMusic, User, LayoutDashboard, Menu, X, Coins } from "lucide-react";

interface Props {
  locale: string;
}

export default function PortalNav({ locale }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [dbCredits, setDbCredits] = useState<number | null>(null);

  // Sync balance with DB
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

  useEffect(() => {
    refreshBalance();
  }, []);

  // Re-fetch when pathname changes (user navigated)
  useEffect(() => {
    refreshBalance();
  }, [pathname]);

  const navLinks = [
    { href: `/${locale}/portal`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${locale}/portal/submit`, label: t("submit"), icon: Send },
    { href: `/${locale}/portal/submissions`, label: t("mySubmissions"), icon: ListMusic },
    { href: `/${locale}/portal/credits`, label: "Credits", icon: Coins },
    { href: `/${locale}/portal/profile`, label: t("profile"), icon: User },
  ];

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-10 border-b-4 border-white/10 bg-black text-white shrink-0">
        <Link href={`/${locale}/portal`} className="flex items-center gap-2 mb-2">
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">
            CULT MACHINE
          </p>
        </Link>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter text-white">
          ARTIST<br/>PORTAL
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-10 px-0 overflow-y-auto">
        <p className="px-6 mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Management
        </p>
        
        {/* Wallet Display */}
        <div className="px-6 mb-8">
          <div className="p-4 bg-[#F5E000] border-4 border-black shadow-[4px_4px_0px_0px_rgba(245,224,0,0.3)]">
            <p className="font-sans text-[8px] font-black uppercase tracking-widest text-black/40 mb-1">CREDITS AVAILABLE</p>
            <div className="flex items-center gap-2 text-black">
              <Coins size={16} />
              <span className="text-2xl font-black tracking-tighter">{dbCredits ?? session?.user?.credits ?? 0}</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-0">
          {navLinks.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact 
              ? pathname === href 
              : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 transition-all font-sans text-xs font-black uppercase tracking-widest border-b-2 border-white/5 last:border-b-0 ${
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
      
      {/* Footer info */}
      <div className="p-6 border-t-4 border-white/10 mt-auto shrink-0">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
          "FOR FANS, BY FANS."
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-black border-b-2 border-[#F5E000]/20 flex items-center justify-between px-6 z-[1001]">
        <div className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-xl">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT PORTAL</span>
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
      <aside className="hidden lg:flex w-64 bg-black border-r-4 border-white/10 flex flex-col h-screen sticky top-0 shrink-0 transition-all">
        <NavContent />
      </aside>
    </>
  );
}
