"use client";

import React from "react";
import { ProfileData } from "@/lib/contracts/savings-profile";
import { formatUSDCx, formatSTX } from "@/lib/utils/format";
import { blockToApproximateDate } from "@/lib/utils/blocks";
import { CircleDollarSign, Briefcase, TrendingUp, Calendar } from "lucide-react";

interface SavingsStatsProps {
  profile: ProfileData | null;
  currentBlock: number | undefined;
  isLoading: boolean;
}

export function SavingsStats({ profile, currentBlock, isLoading }: SavingsStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="stats-loading">
        <div className="skeleton skeleton--stat" />
        <div className="skeleton skeleton--stat" />
        <div className="skeleton skeleton--stat" />
        <div className="skeleton skeleton--stat" />
      </div>
    );
  }

  const totalSaved = profile?.totalSaved ?? 0n;
  const totalVaultsCompleted = profile?.totalVaultsCompleted ?? 0n;
  const totalYieldEarned = profile?.totalYieldEarned ?? 0n;
  const memberSinceBlock = profile?.memberSince ?? 0n;

  // Calculate approximate date for member since
  let memberSinceStr = "N/A";
  if (memberSinceBlock > 0n && currentBlock !== undefined) {
    const approxDate = blockToApproximateDate(Number(memberSinceBlock), currentBlock);
    memberSinceStr = approxDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" data-testid="savings-stats">
      {/* Total Saved */}
      <div className="stats-card" data-testid="stat-total-saved">
        <div className="stats-card__icon text-emerald-500">
          <CircleDollarSign className="size-16" />
        </div>
        <span className="stats-card__label">Total Saved</span>
        <div className="stats-card__value">
          {formatUSDCx(totalSaved)} USDCx
        </div>
      </div>

      {/* Vaults Completed */}
      <div className="stats-card" data-testid="stat-vaults-completed">
        <div className="stats-card__icon text-blue-500">
          <Briefcase className="size-16" />
        </div>
        <span className="stats-card__label">Vaults Completed</span>
        <div className="stats-card__value">
          {totalVaultsCompleted.toString()}
        </div>
      </div>

      {/* Total Yield Earned */}
      <div className="stats-card" data-testid="stat-total-yield">
        <div className="stats-card__icon text-amber-500">
          <TrendingUp className="size-16" />
        </div>
        <span className="stats-card__label">Total Yield Earned</span>
        <div className="stats-card__value text-emerald-500">
          {formatSTX(totalYieldEarned)} STX
        </div>
      </div>

      {/* Member Since (Approximate Block to Date) */}
      <div className="stats-card" data-testid="stat-member-since">
        <div className="stats-card__icon text-teal-500">
          <Calendar className="size-16" />
        </div>
        <span className="stats-card__label">Member Since</span>
        <div className="stats-card__value text-sm md:text-base font-semibold mt-1">
          {memberSinceStr}
          {memberSinceBlock > 0n && (
            <span className="block text-[10px] text-muted-foreground font-normal">
              (approx. from block #{memberSinceBlock.toString()})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavingsStats;
