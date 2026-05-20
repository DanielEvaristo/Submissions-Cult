"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Inbox, User, ShieldCheck, Palette, Menu, X, AlertTriangle } from "lucide-react";

export default function CuratorNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: any[] = [];

  if (!session?.user?.isMasterCurator) {
    navItems.push({
      name: "Curator Inbox",
      href: `/${locale}/curator`,
      icon: Inbox,
      exact: true,
    });
  }

  if (session?.user?.isMasterCurator) {
    navItems.push({
      name: "Master Inbox",
      href: `/${locale}/curator/master`,
      icon: ShieldCheck,
      exact: false,
    });
  }

  navItems.push({
    name: "Profile Settings",
    href: `/${locale}/curator/profile`,
    icon: User,
    exact: false,
  });

  // Creatives visible to master curators and admins
  if (session?.user?.isMasterCurator) {
    navItems.push({
      name: "Creatives",
      href: `/${locale}/curator/creative-requests`,
      icon: Palette,
      exact: false,
    });
  }

  const NavContent = () => (
    <>
      {/* Brand */}
      <div className="px-6 py-10 border-b-4 border-black bg-black text-white shrink-0">
        <Link href={`/${locale}/curator`} className="flex items-center gap-2 mb-2">
          <span className="text-xl text-[#F5E000]">★</span>
          <p className="font-sans text-xs font-black uppercase tracking-[0.3em]">
            CULT MACHINE
          </p>
        </Link>
        <p className="font-sans text-2xl font-black uppercase leading-none tracking-tighter">
          STAFF<br/>OS
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-10 px-0 overflow-y-auto">
        <p className="px-6 mb-6 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#999999]">
          Curation Tools
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
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t-4 border-black mt-auto shrink-0 space-y-4">
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
        <p className="text-[10px] font-black text-black uppercase tracking-[0.2em] italic opacity-40 mb-4">
          "FOR FANS, BY FANS."
        </p>
        <div className="bg-white/5 p-4 border-2 border-white/10">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Session</p>
          <p className="text-[10px] font-black text-white/60 truncate uppercase">{session?.user?.email}</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-black border-b-2 border-[#F5E000]/20 flex items-center justify-between px-6 z-[1001]">
        <div className="flex items-center gap-2">
          <span className="text-[#F5E000] font-black text-xl">★</span>
          <span className="text-white font-black text-xs uppercase tracking-widest">CULT STAFF</span>
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
