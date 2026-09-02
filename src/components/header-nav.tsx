"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOutIcon, SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/space", label: "Mi espacio" },
  { href: "/transactions", label: "Transacciones" },
  { href: "/categories", label: "Categorías" },
];

export function HeaderNav({
  userName,
  initialNotifications,
  initialUnreadCount,
}: {
  userName: string;
  initialNotifications?: {
    id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    transaction: { id: string; amount: string; type: string; category: { name: string } } | null;
  }[];
  initialUnreadCount?: number;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center gap-3 px-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2">
          <svg viewBox="0 0 64 40" className="h-6 w-9" aria-hidden={true}>
            <circle cx="22" cy="20" r="16" fill="#1F6F5C" opacity="0.85" />
            <circle cx="42" cy="20" r="16" fill="#7A3F5E" opacity="0.85" />
            <ellipse cx="32" cy="20" rx="6.5" ry="13" fill="#C9A227" />
          </svg>
          <span className="font-display text-lg font-semibold">Duofin</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-sm sm:gap-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "text-foreground rounded-lg px-3 py-1.5 font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-1.5"
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <NotificationBell
          initialNotifications={initialNotifications}
          initialUnreadCount={initialUnreadCount}
        />

        <ThemeToggle />

        <Link
          href="/settings"
          title="Configuración"
          aria-label="Configuración"
          className="text-muted-foreground hover:text-foreground"
        >
          <SettingsIcon />
        </Link>

        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })} title={`Cerrar sesión (${userName})`}>
          <LogOutIcon />
          <span className="sr-only">Cerrar sesión</span>
        </Button>
      </div>
    </header>
  );
}
