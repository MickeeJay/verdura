"use client";

import React from "react";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

export function NetworkBadge() {
  const { network } = useWallet();

  const isMainnet = network === "mainnet";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200",
        isMainnet
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          : "bg-orange-500/10 text-orange-500 border-orange-500/20"
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full animate-pulse",
          isMainnet ? "bg-emerald-500" : "bg-orange-500"
        )}
      />
      <span className="capitalize">{network}</span>
    </div>
  );
}
