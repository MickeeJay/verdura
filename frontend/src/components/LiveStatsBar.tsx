"use client";

import React from "react";

export function LiveStatsBar() {
  return (
    <div className="w-full bg-emerald-500/10 border-y border-emerald-500/20 py-3 text-center">
      <div className="container mx-auto px-4 text-sm font-medium text-emerald-400 animate-pulse">
        Live Stats: Loading vault information...
      </div>
    </div>
  );
}
export default LiveStatsBar;
