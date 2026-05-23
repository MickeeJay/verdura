"use client";

import React from "react";
import { Flame } from "lucide-react";

interface SavingsStreakProps {
  streak: bigint;
  isLoading: boolean;
}

export function SavingsStreak({ streak, isLoading }: SavingsStreakProps) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border p-6 bg-card animate-pulse space-y-4" data-testid="streak-loading">
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="h-8 w-16 bg-muted rounded" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="size-10 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const streakCount = Number(streak);
  const activeCount = Math.min(streakCount, 7);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6 bg-card transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5 group"
      data-testid="savings-streak"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Savings Streak</h3>
          <p className="text-2xl font-extrabold text-card-foreground mt-1 flex items-center gap-2">
            <Flame className={`size-6 ${streakCount > 0 ? "text-orange-500 fill-orange-500 animate-bounce" : "text-muted-foreground"}`} />
            {streakCount} Vault{streakCount !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-xs text-muted-foreground text-right">
          {streakCount > 0 ? (
            <span className="text-emerald-500 font-semibold">Streak Active!</span>
          ) : (
            <span>No active streak</span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const isActive = i < activeCount;
            return (
              <div
                key={i}
                data-testid={`streak-block-${i}`}
                className={`size-10 rounded-xl flex items-center justify-center border transition-all duration-300 relative ${
                  isActive
                    ? "bg-gradient-to-br from-orange-400 to-red-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-105"
                    : "bg-muted/50 border-border text-muted-foreground"
                }`}
              >
                <Flame className={`size-5 ${isActive ? "opacity-100" : "opacity-30"}`} />
                <span className="absolute bottom-0.5 right-1 text-[8px] opacity-50 font-bold">
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground max-w-[200px] mt-2 sm:mt-0">
          Complete vaults within 4,320 blocks (approx. 30 days) of each other to maintain your streak.
        </p>
      </div>
    </div>
  );
}

export default SavingsStreak;
