"use client";

import React from "react";
import Link from "next/link";
import { WalletConnectButton } from "./wallet/WalletConnectButton";
import { NetworkBadge } from "./wallet/NetworkBadge";

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-emerald-500"
            >
              <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1" />
              <path
                d="M16 6C10.4772 6 6 10.4772 6 16C6 21.5228 10.4772 26 16 26C21.5228 26 26 21.5228 26 16C26 10.4772 21.5228 6 16 6ZM14.5 19H12.5V17.5H11V15.5H12.5V14H11V12H12.5V9.5H14.5V12H16V9.5H18V12H19.5V14H18V15.5H19.5V17.5H18V19H19.5V21H18V22.5H16V21H14.5V22.5H12.5V21H14.5V19ZM14.5 14H16V15.5H14.5V14ZM14.5 17H16V18.5H14.5V17ZM16 14H17.5V15.5H16V14ZM16 17H17.5V18.5H16V17Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Verdura
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Savings Vaults
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Yield Router
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <NetworkBadge />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
export default TopBar;
