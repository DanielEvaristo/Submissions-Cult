"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Inbox, User, ShieldCheck } from "lucide-react";

export default function CuratorNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [];

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
    name: "Profile",
    href: `/${locale}/curator/profile`,
    icon: User,
    exact: false,
  });

  return (
    <div className="w-64 bg-bg-surface border-r border-border h-screen sticky top-0 flex flex-col z-10 hidden md:flex shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href={`/${locale}/curator`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <span className="font-sans font-bold text-white text-sm">CM</span>
          </div>
          <div>
            <p className="font-sans font-bold text-cm-text-primary text-sm leading-tight tracking-tight">
              Cult Machine
            </p>
            <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-cm-text-secondary">
              Curator
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-muted mb-4 px-2">
          Staff Menu
        </p>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-bg-elevated text-cm-text-primary border border-border shadow-sm"
                  : "text-cm-text-secondary hover:bg-bg-elevated/50 hover:text-cm-text-primary border border-transparent"
              }`}
            >
              <Icon
                size={18}
                className={isActive ? "text-accent-red" : "text-cm-text-muted group-hover:text-cm-text-secondary transition-colors"}
              />
              <span className="font-sans text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
