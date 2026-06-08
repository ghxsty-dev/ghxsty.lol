"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Home,
  LayoutDashboard,
  LogOut,
  Palette,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/utils";

function getItems() {
  return [
  {
    href: "/dashboard",
    label: "Dashboard",
    Icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/themes",
    label: "Temalar",
    Icon: Palette,
  },
  {
    href: "/dashboard/avatar-decorations",
    label: "Avatar Dekorasyonları",
    Icon: Sparkles,
  },
  {
    href: "/events",
    label: "Etkinlikler",
    Icon: Calendar,
  },
  {
    href: "/dashboard/account",
    label: "Hesap Ayarları",
    Icon: Settings,
  },
  ];
}

export function DashboardSidebar({
  username,
}: {
  username?: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const items = getItems();

  return (
    <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
      <div className="flex h-full flex-col rounded-lg border border-white/10 bg-white/[0.04] p-3">
        <Link
          href="/"
          className="mb-3 flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <Home className="h-4 w-4" />
          ghxsty.lol
        </Link>

        <nav className="grid gap-1">
          {items.map(({ href, label, Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white",
                  active && "bg-white text-zinc-950 hover:bg-white hover:text-zinc-950",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2 pt-4">
          {username ? (
            <Link
              href={`/${username}`}
              className="flex min-h-10 items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
            >
              <UserRound className="h-4 w-4" />
              Profilim
            </Link>
          ) : null}
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex min-h-10 w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              Çıkış
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
