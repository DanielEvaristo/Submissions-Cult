"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Send, ListMusic, User, LayoutDashboard, Inbox } from "lucide-react";

interface Props {
  locale: string;
}

export default function PortalNav({ locale }: Props) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { href: `/${locale}/portal`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/${locale}/portal/submit`, label: t("submit"), icon: Send },
    { href: `/${locale}/portal/submissions`, label: t("mySubmissions"), icon: ListMusic },
    { href: `/${locale}/portal/profile`, label: t("profile"), icon: User },
  ];

  return (
    <aside className="w-64 border-r border-border bg-bg-surface flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href={`/${locale}/portal`} className="font-sans text-xl font-bold tracking-tight text-cm-text-primary hover:text-accent-red transition-colors flex items-center gap-2">
          Cult<span className="text-accent-red">Machine</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-sans font-bold uppercase tracking-widest text-cm-text-muted mb-2">
          General
        </p>
        
        {navLinks.map(({ href, label, icon: Icon, exact }) => {
          // If exact is true, match exactly. Otherwise, match startsWith but ensure we don't accidentally match /portal/submissions when on /portal
          const isActive = exact 
            ? pathname === href 
            : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-sans text-sm font-medium ${
                isActive
                  ? "bg-accent-red/10 text-accent-red"
                  : "text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Icon size={18} className={isActive ? "text-accent-red" : "text-cm-text-muted"} />
              {label}
            </Link>
          );
        })}
      </nav>
      
      {/* Footer info (optional) */}
      <div className="p-6 border-t border-border">
        <p className="text-[10px] font-sans text-cm-text-muted uppercase tracking-wider">
          Cult Machine © {new Date().getFullYear()}
        </p>
      </div>
    </aside>
  );
}
