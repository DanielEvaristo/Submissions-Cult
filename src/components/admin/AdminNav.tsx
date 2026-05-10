"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BadgeCheck,
  Users,
  Music,
  LogOut,
} from "lucide-react";

interface Props {
  locale: string;
}

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/industry", label: "Industry Apps", icon: BadgeCheck, exact: false },
  { href: "/admin/artists", label: "Artists", icon: Users, exact: false },
  { href: "/admin/submissions", label: "Submissions", icon: Music, exact: false },
];

export default function AdminNav({ locale }: Props) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) => {
    const full = `/${locale}${href}`;
    return exact ? pathname === full : pathname.startsWith(full);
  };

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-bg min-h-screen flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-border">
        <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary">
          Cult Machine
        </p>
        <p className="font-sans text-sm font-semibold text-accent-red mt-1">
          Admin Panel
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-6 space-y-1.5 px-4">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={`/${locale}${href}`}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-sans text-sm font-medium ${
                active
                  ? "bg-accent-red/10 text-accent-red"
                  : "text-cm-text-secondary hover:text-cm-text-primary hover:bg-bg-elevated"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-4 py-6 border-t border-border">
        <button
          id="admin-signout-btn"
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-sans text-sm font-medium text-cm-text-secondary hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut size={18} className="shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
