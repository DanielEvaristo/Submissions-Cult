"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  User,
  Settings,
  Inbox
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function IndustryNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("industry"); // Assuming we have industry translations, or we can use portal/common

  const navItems = [
    {
      name: "Dashboard", // t("nav.dashboard")
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
      icon: Settings, // or send icon
    },
    {
      name: "Agency Profile",
      href: `/${locale}/industry/profile`,
      icon: User,
    },
  ];

  return (
    <div className="w-64 bg-bg-surface border-r border-border h-screen sticky top-0 flex flex-col z-10 hidden md:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href={`/${locale}/industry`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent-red flex items-center justify-center">
            <span className="font-sans font-bold text-white text-sm">CM</span>
          </div>
          <div>
            <p className="font-sans font-bold text-cm-text-primary text-sm leading-tight tracking-tight">
              Cult Machine
            </p>
            <p className="font-sans text-[10px] uppercase font-bold tracking-widest text-cm-text-secondary">
              Industry
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-muted mb-4 px-2">
          Agency Menu
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

        {/* Curator link (only visible if isCurator) */}
        {session?.user?.isCurator && (
          <>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-muted mt-6 mb-4 px-2">
              Staff
            </p>
            <Link
              href={`/${locale}/curator`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                pathname.startsWith(`/${locale}/curator`)
                  ? "bg-bg-elevated text-cm-text-primary border border-border shadow-sm"
                  : "text-cm-text-secondary hover:bg-bg-elevated/50 hover:text-cm-text-primary border border-transparent"
              }`}
            >
              <Inbox
                size={18}
                className={pathname.startsWith(`/${locale}/curator`) ? "text-accent-red" : "text-cm-text-muted group-hover:text-cm-text-secondary transition-colors"}
              />
              <span className="font-sans text-sm font-semibold">Curator Inbox</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
