"use client";

import React from "react";
import { Info, Trophy } from "lucide-react";

interface LeaderboardScoreProps {
  score: bigint;
  isLoading: boolean;
}

export function LeaderboardScore({ score, isLoading }: LeaderboardScoreProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border p-6 bg-card animate-pulse space-y-4" data-testid="score-loading">
        <div className="h-6 w-36 bg-muted rounded" />
        <div className="h-16 w-28 bg-muted rounded mx-auto" />
      </div>
    );
  }

  const scoreNum = Number(score);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6 bg-card transition-all duration-200 hover:shadow-lg group text-center flex flex-col items-center justify-center min-h-[180px]"
      data-testid="leaderboard-score-card"
    >
      {/* Background Icon Decoration */}
      <div className="absolute right-4 top-4 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors duration-200">
        <Trophy className="size-20" />
      </div>

      <div className="flex items-center gap-1.5 justify-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Leaderboard Score</h3>
        <div className="relative group cursor-pointer inline-flex items-center" data-testid="formula-tooltip-trigger">
          <Info className="size-4 text-muted-foreground hover:text-foreground transition-colors" />
          <div
            className="vault-tooltip"
            data-testid="score-formula-tooltip"
          >
            Your score = (vaults × 100) + (total saved ÷ 1000)
          </div>
        </div>
      </div>

      <p className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent tracking-tight mt-1" data-testid="score-value">
        {scoreNum.toLocaleString()}
      </p>
      
      <p className="text-xs text-muted-foreground mt-3 max-w-[220px]">
        Increase your score by locking more tokens and successfully completing commitment vaults.
      </p>
    </div>
  );
}

export default LeaderboardScore;
