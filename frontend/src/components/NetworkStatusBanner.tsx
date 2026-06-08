"use client";

import React from "react";
import { WifiOff, AlertTriangle } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="bg-amber-500 text-amber-950 text-xs font-semibold py-2 px-4 w-full flex items-center justify-center gap-2 transition-all duration-300 border-b border-amber-600/30 shadow-sm animate-pulse"
      data-testid="network-status-banner"
      role="alert"
    >
      <WifiOff className="size-4 flex-shrink-0" />
      <span>
        Hiro API is currently unreachable. Some on-chain operations and metrics may not load properly.
      </span>
    </div>
  );
}
export default NetworkStatusBanner;
