"use client";

import React, { useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Vault, PlusCircle, User, LucideIcon } from "lucide-react";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly hash?: string;
}

const navItems: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard", label: "Vaults", icon: Vault, hash: "#vaults" },
  { href: "/vaults/create", label: "Create Vault", icon: PlusCircle },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLUListElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLUListElement>) => {
      const items = navRef.current?.querySelectorAll<HTMLAnchorElement>(
        '[role="menuitem"]'
      );
      if (!items || items.length === 0) return;

      const currentIndex = Array.from(items).findIndex(
        (item) => item === document.activeElement
      );

      let nextIndex = currentIndex;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = items.length - 1;
      }

      items[nextIndex]?.focus();
    },
    []
  );

  return (
    <aside
      className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card/50 min-h-[calc(100vh-4rem)]"
      aria-label="Main navigation"
    >
      <nav className="flex-1 py-6 px-3">
        <ul
          ref={navRef}
          role="menu"
          className="space-y-1"
          onKeyDown={handleKeyDown}
        >
          {navItems.map((item) => {
            const isActive =
              item.hash
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <li key={item.label} role="none">
                <Link
                  href={item.hash ? `${item.href}${item.hash}` : item.href}
                  role="menuitem"
                  tabIndex={0}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
