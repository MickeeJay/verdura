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
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { useTx } from "@/hooks/useTx";
import { isTerminalStatus, HiroTxStatus } from "@/lib/types/hiro-types";
import {
  RefreshCw,
  Plus,
  TrendingUp,
  CircleDollarSign,
  Briefcase,
  Lock,
  AlertTriangle,
  Calendar,
  Percent,
} from "lucide-react";

function DashboardPageContent() {
  const { address } = useWallet();
  const queryClient = useQueryClient();
  const { transactions } = useTx();

  const {
    data: vaults,
    isLoading: vaultsLoading,
    isRefetching: vaultsRefetching,
    isError: vaultsError,
    error: vaultsErrorObj,
  } = useVaults();

  const {
    data: profile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObj,
  } = useProfile();

  const {
    data: currentBlock,
    isLoading: blockLoading,
    isError: blockError,
    error: blockErrorObj,
  } = useCurrentBlock();

  const handleRefresh = async () => {
    if (!address) return;
    await queryClient.invalidateQueries({ queryKey: ["vaults", address] });
    await queryClient.invalidateQueries({ queryKey: ["profile", address] });
    await queryClient.invalidateQueries({ queryKey: ["currentBlock"] });
  };

  // Guard: Do not show wallet-specific data without address
  if (!address) {
    return null;
  }

  const isLoading = vaultsLoading || profileLoading || blockLoading;
  const isError = vaultsError || profileError || blockError;

  if (isError) {
    const errorMsg =
      vaultsErrorObj?.message ||
      profileErrorObj?.message ||
      blockErrorObj?.message ||
      "An unexpected error occurred.";
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center space-y-6" data-testid="dashboard-error">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Failed to Load Dashboard
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorMsg}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="size-4" />
          Retry Loading
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8" data-testid="dashboard-loading">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 skeleton" />
            <div className="h-4 w-96 skeleton" />
          </div>
          <div className="h-10 w-28 skeleton" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <div className="skeleton skeleton--stat" />
          <div className="skeleton skeleton--stat" />
          <div className="skeleton skeleton--stat col-span-2 md:col-span-1" />
        </div>
        <div className="space-y-4">
          <div className="h-6 w-48 skeleton" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        </div>
      </div>
    );
  }

  if (vaults === undefined || profile === undefined || currentBlock === undefined) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center space-y-6" data-testid="dashboard-undefined">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Dashboard Data Unavailable
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            On-chain query returned undefined. Please try refreshing.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>
    );
  }

  // Filter pending vault creations
  const pendingCreateTxs = transactions.filter(
    (tx) =>
      tx.label.startsWith("Create Vault") &&
      (tx.status === "submitted" || !isTerminalStatus(tx.status as HiroTxStatus))
  );

  // Formatting values
  const totalSaved = profile?.totalSaved ?? 0n;
  const totalYieldEarned = profile?.totalYieldEarned ?? 0n;
  const vaultsCount = vaults.length;

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
          {currentBlock !== undefined && (
            <div className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-muted px-3.5 py-2 text-xs font-mono font-semibold text-muted-foreground border border-border">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Block #{currentBlock}
            </div>
          )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Saved */}
        <div className="stats-card" data-testid="stat-total-saved">
          <div className="stats-card__icon text-emerald-500">
            <CircleDollarSign />
          </div>
          <span className="stats-card__label">Total Locked</span>
          <div className="stats-card__value text-lg sm:text-2xl">
            {formatUSDCx(totalSaved)} USDCx
          </div>
        </div>

        {/* Total Yield Earned */}
        <div className="stats-card" data-testid="stat-total-yield">
          <div className="stats-card__icon text-amber-500">
            <TrendingUp />
          </div>
          <span className="stats-card__label">Total Yield Earned</span>
          <div className="stats-card__value text-lg sm:text-2xl text-emerald-500">
            {formatSTX(totalYieldEarned)} STX
          </div>
        </div>

        {/* Total Vaults Count */}
        <div className="stats-card col-span-2 md:col-span-1" data-testid="stat-vaults-count">
          <div className="stats-card__icon text-blue-500">
            <Briefcase />
          </div>
          <span className="stats-card__label">Active Vaults</span>
          <div className="stats-card__value text-lg sm:text-2xl">{vaultsCount}</div>
        </div>
      </div>

      {/* Vaults Grid or Empty State */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
          Your Commitment Vaults
        </h2>

        {vaults.length > 0 || pendingCreateTxs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="vaults-grid">
            {vaults.map((vault) => (
              <Link key={vault.id} href={`/vaults/${vault.id}`} className="block transition-transform hover:-translate-y-1 hover:no-underline">
                <VaultCard
                  vault={vault}
                  currentBlock={currentBlock}
                />
              </Link>
            ))}

            {/* Pending Vaults (Optimistic UI) */}
            {pendingCreateTxs.map((tx) => {
              const pendingName = tx.label.includes(":")
                ? tx.label.substring(tx.label.indexOf(":") + 1).trim()
                : "New Savings Vault";

              return (
                <div
                  key={tx.txId}
                  className="vault-card opacity-50 border-amber-500/30 bg-amber-500/5 relative overflow-hidden cursor-not-allowed"
                  data-testid="vault-card-pending"
                >
                  <div className="vault-card__header">
                    <h3 className="vault-card__name flex items-center gap-2">
                      <Lock className="size-4 text-amber-500 animate-pulse" />
                      {pendingName}
                    </h3>
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-500 border border-amber-500/20">
                      Pending...
                    </span>
                  </div>

                  <div className="vault-card__body">
                    <div className="vault-card__row">
                      <span className="vault-card__label flex items-center gap-1.5">
                        <CircleDollarSign className="size-4 text-muted-foreground" />
                        Principal
                      </span>
                      <span className="vault-card__value">—</span>
                    </div>

                    <div className="vault-card__row">
                      <span className="vault-card__label flex items-center gap-1.5">
                        <Percent className="size-4 text-muted-foreground" />
                        Est. Yield
                      </span>
                      <span className="vault-card__value font-mono">—</span>
                    </div>

                    <div className="vault-card__row pt-2 border-t border-border/50">
                      <span className="vault-card__label flex items-center gap-1.5">
                        <Calendar className="size-4 text-muted-foreground" />
                        Maturity
                      </span>
                      <span className="vault-card__countdown text-amber-500 animate-pulse">
                        Creating...
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-state__icon">
              <Lock className="size-8" />
            </div>
            <h3 className="empty-state__title">No Vaults Found</h3>
            <p className="empty-state__description">
              You haven&apos;t created any savings vaults yet. Start locking your tokens to earn Stacks Bitcoin yield!
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

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardPageContent />
    </ErrorBoundary>
  );
}
