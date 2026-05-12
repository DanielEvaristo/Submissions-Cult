"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  Inbox,
  Menu,
  X,
  CreditCard
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function IndustryNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: "Dashboard",
      href: `/${locale}/industry`,
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "My Artists",
      href: `/${locale}/industry/artists`,
      icon: Users,
    },
    {
      name: "Submissions",
      href: `/${locale}/industry/submissions`,
      icon: Settings,
    },
    {
      name: "Agency Profile",
      href: `/${locale}/industry/profile`,
      icon: User,
    },
    {
      name: "Credits",
      href: `/${locale}/industry/credits`,
      icon: CreditCard,
    },
  ];

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-10 border-b-4 border-white/10 bg-black text-white shrink-0">
        <Link href={`/${locale}/industry`} className="flex items-center gap-2 mb-2">
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">
            CULT MACHINE
          </p>
        </Link>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter">
          AGENCY<br/>DASH
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-10 px-0 overflow-y-auto">
        <p className="px-6 mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Agency Menu
        </p>
        
        <div className="space-y-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 transition-all font-sans text-xs font-black uppercase tracking-widest border-b-2 border-white/5 last:border-b-0 ${
                  isActive
                    ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3"
                    : "text-white/60 hover:bg-white/5 hover:text-[#F5E000]"
                }`}
              >
                <Icon size={18} strokeWidth={3} />
                <span className="font-sans">{item.name}</span>
              </Link>
            );
          })}

          {/* Curator link (only visible if isCurator) */}
          {session?.user?.isCurator && (
            <>
              <p className="px-6 mt-10 mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
                Staff
              </p>
              <Link
                href={`/${locale}/curator`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 transition-all font-sans text-xs font-black uppercase tracking-widest border-b-2 border-white/5 ${
                  pathname.startsWith(`/${locale}/curator`)
                    ? "bg-[#F5E000] text-black border-l-[12px] border-l-black pl-3"
                    : "text-white/60 hover:bg-white/5 hover:text-[#F5E000]"
                }`}
              >
                <Inbox size={18} strokeWidth={3} />
                <span className="font-sans text-xs font-black uppercase tracking-widest">Curator Inbox</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 w-full h-16 bg-black border-b-2 border-[#F5E000]/20 flex items-center justify-between px-6 z-[1001]">
        <div className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-xl">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT AGENCY</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-[#F5E000]">
          {isOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-[1000] bg-black pt-16 flex flex-col">
          <NavContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-black border-r-4 border-white/10 h-screen sticky top-0 flex-col z-10 shrink-0 transition-all">
        <NavContent />
      </div>
    </>
  );
}
