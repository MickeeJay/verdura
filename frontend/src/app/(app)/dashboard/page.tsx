"use client";

import React from "react";
import Link from "next/link";
import { useWallet } from "@/hooks/useWallet";
import { useVaults } from "@/hooks/useVaults";
import { useProfile } from "@/hooks/useProfile";
import { useCurrentBlock } from "@/hooks/useCurrentBlock";
import { VaultCard } from "@/components/vaults/VaultCard";
import { formatUSDCx, formatSTX } from "@/lib/utils/format";
import { useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Plus,
  TrendingUp,
  CircleDollarSign,
  Briefcase,
  Lock,
  Loader2,
} from "lucide-react";

export default function DashboardPage() {
  const { address } = useWallet();
  const queryClient = useQueryClient();

  // Guard: Do not show wallet-specific data without address
  if (!address) {
    return null;
  }

  const { data: vaults, isLoading: vaultsLoading, isRefetching: vaultsRefetching } = useVaults();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: currentBlock, isLoading: blockLoading } = useCurrentBlock();

  const handleRefresh = async () => {
    // Call queryClient.invalidateQueries(['vaults', address])
    await queryClient.invalidateQueries({ queryKey: ["vaults", address] });
    await queryClient.invalidateQueries({ queryKey: ["profile", address] });
  };

  const isLoading = vaultsLoading || profileLoading || blockLoading;

  // Formatting values
  const totalSaved = profile?.totalSaved ?? 0n;
  const totalYieldEarned = profile?.totalYieldEarned ?? 0n;
  const vaultsCount = vaults?.length ?? 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            Savings Dashboard
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your Stacks Bitcoin commitment vaults, view real-time lock status and accumulated yield.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={vaultsRefetching}
            aria-label="Refresh Data"
            data-testid="refresh-button"
          >
            <RefreshCw
              className={`size-4 refresh-btn__icon ${vaultsRefetching ? "animate-spin" : ""}`}
            />
            {vaultsRefetching ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/vaults/create"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-emerald-500/20"
          >
            <Plus className="size-4" />
            New Vault
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {isLoading ? (
          <>
            <div className="skeleton skeleton--stat" />
            <div className="skeleton skeleton--stat" />
            <div className="skeleton skeleton--stat" />
          </>
        ) : (
          <>
            {/* Total Saved */}
            <div className="stats-card" data-testid="stat-total-saved">
              <div className="stats-card__icon text-emerald-500">
                <CircleDollarSign />
              </div>
              <span className="stats-card__label">Total Locked</span>
              <div className="stats-card__value">
                {formatUSDCx(totalSaved)} USDCx
              </div>
            </div>

            {/* Total Yield Earned */}
            <div className="stats-card" data-testid="stat-total-yield">
              <div className="stats-card__icon text-amber-500">
                <TrendingUp />
              </div>
              <span className="stats-card__label">Total Yield Earned</span>
              <div className="stats-card__value text-emerald-500">
                {formatSTX(totalYieldEarned)} STX
              </div>
            </div>

            {/* Total Vaults Count */}
            <div className="stats-card" data-testid="stat-vaults-count">
              <div className="stats-card__icon text-blue-500">
                <Briefcase />
              </div>
              <span className="stats-card__label">Active Vaults</span>
              <div className="stats-card__value">{vaultsCount}</div>
            </div>
          </>
        )}
      </div>

      {/* Vaults Grid or Empty State */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          Your Commitment Vaults
        </h2>

        {isLoading ? (
          <div className="dashboard-grid">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        ) : vaults && vaults.length > 0 ? (
          <div className="dashboard-grid" data-testid="vaults-grid">
            {vaults.map((vault) => (
              <VaultCard
                key={vault.id}
                vault={vault}
                currentBlock={currentBlock ?? 0}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-state__icon">
              <Lock className="size-8" />
            </div>
            <h3 className="empty-state__title">No Vaults Found</h3>
            <p className="empty-state__description">
              You haven't created any savings vaults yet. Start locking your tokens to earn Stacks Bitcoin yield!
            </p>
            <Link href="/vaults/create" className="empty-state__cta">
              Create Your First Vault
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
