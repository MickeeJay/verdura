"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, CircleDollarSign, Percent, Lock, Share2, Check, Clock, Layers } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { fetchVault, fetchIsVaultMature, VaultData } from "@/lib/contracts/savings-vault";
import { useCurrentBlock } from "@/hooks/useCurrentBlock";
import { useQuery } from "@tanstack/react-query";
import { formatUSDCx, formatSTX } from "@/lib/utils/format";
import { getVaultStatus, VaultStatusBadge } from "@/components/vaults/VaultStatusBadge";
import { blocksToTimeRemaining } from "@/lib/utils/blocks";
import { DepositForm } from "@/components/vaults/DepositForm";
import { WithdrawButton } from "@/components/vaults/WithdrawButton";
import { TxHistoryList } from "@/components/txs/TxHistoryList";
import { useVaultTxHistory } from "@/hooks/useVaultTxHistory";
import { Button } from "@/components/ui/button";

export default function VaultDetailPage({ params }: { params: { vaultId: string } }) {
  const { address, stacksNetwork, isConnected, connect } = useWallet();
  const { data: currentBlock = 0 } = useCurrentBlock();
  const vaultId = Number(params.vaultId);

  const [copied, setCopied] = useState(false);

  // Fetch Vault Data
  const {
    data: vault,
    isLoading: vaultLoading,
    refetch: refetchVault,
  } = useQuery<VaultData | null>({
    queryKey: ["vault", address, vaultId] as const,
    queryFn: async () => {
      if (!address) return null;
      return fetchVault(address, vaultId, stacksNetwork);
    },
    enabled: !!address && !isNaN(vaultId),
  });

  // Query Maturity
  const { data: isVaultMature = false } = useQuery<boolean>({
    queryKey: ["vault-maturity", address, vaultId] as const,
    queryFn: async () => {
      if (!address) return false;
      return fetchIsVaultMature(address, vaultId, stacksNetwork);
    },
    enabled: !!address && !isNaN(vaultId),
    refetchInterval: 30_000,
  });

  // Fetch Transaction History
  const {
    data: txHistory,
    isLoading: txLoading,
    loadMore: onLoadMore,
    hasMore,
  } = useVaultTxHistory(vaultId);

  // Approximate Creation Date
  const [creationDate, setCreationDate] = useState<string>("");

  useEffect(() => {
    if (vault && currentBlock > 0) {
      const start = Number(vault.startBlock);
      const diff = currentBlock - start;
      const timeDiffMs = diff * 10 * 60 * 1000; // 10 mins per block
      const date = new Date(Date.now() - timeDiffMs);
      setCreationDate(
        date.toLocaleDateString(undefined, {
          dateStyle: "long",
        })
      );
    }
  }, [vault, currentBlock]);

  // Copy Vault Link to Clipboard
  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6 min-h-[calc(100vh-4rem)]">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md p-8 bg-card border border-border rounded-2xl shadow-xl text-center space-y-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Lock className="size-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Connect Your Wallet</h1>
              <p className="text-sm text-muted-foreground">
                Please connect your Stacks wallet to view commitment vault details.
              </p>
            </div>
            <Button
              onClick={connect}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              Connect Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (vaultLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <div className="h-6 w-32 skeleton" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 skeleton" />
            <div className="h-64 skeleton" />
          </div>
          <div className="space-y-6">
            <div className="h-64 skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (!vault) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 text-center space-y-4">
        <h2 className="text-xl font-bold">Vault Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The requested vault does not exist or belongs to another account.
        </p>
        <Link href="/" className="inline-flex text-emerald-500 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const startBlock = Number(vault.startBlock);
  const endBlock = Number(vault.endBlock);
  const status = getVaultStatus(vault.isActive, currentBlock, endBlock);

  // Clamped progress calculation: (currentBlock - startBlock) / (endBlock - startBlock) * 100% clamped to [0, 100]
  const totalBlocks = endBlock - startBlock;
  const elapsedBlocks = currentBlock - startBlock;
  const progressPercent =
    totalBlocks > 0 ? Math.min(Math.max((elapsedBlocks / totalBlocks) * 100, 0), 100) : 100;

  const durationBlocks = endBlock - startBlock;
  const durationDays = Math.round(durationBlocks / 144);

  // Estimated Yield calculation
  const blocksBig = BigInt(durationBlocks);
  const estimatedYield = vault.yieldEnabled
    ? (vault.principalAmount * blocksBig * 8n) / 5256000n
    : 0n;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </Link>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          data-testid="share-vault-button"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-emerald-500 animate-bounce" />
              <span>Copied Link!</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5" />
              <span>Share Vault</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details and Progress */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 md:p-8 bg-card border border-border rounded-3xl shadow-md space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <Lock className="size-6 text-emerald-500" />
                  {vault.name}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span>Created on {creationDate || "Loading..."}</span>
                  <span>•</span>
                  <a
                    href={`https://explorer.hiro.so/block/${startBlock}?chain=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-emerald-500 font-mono font-medium"
                  >
                    Block #{startBlock}
                  </a>
                </p>
              </div>
              <VaultStatusBadge status={status} />
            </div>

            {/* Progress Bar Component */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-semibold flex items-center gap-1">
                  <Clock className="size-3.5" />
                  Time Elapsed ({progressPercent.toFixed(1)}%)
                </span>
                <span className="font-mono text-foreground font-bold">
                  {currentBlock > 0
                    ? `${Math.min(elapsedBlocks, totalBlocks)} / ${totalBlocks} blocks`
                    : "Fetching blocks..."}
                </span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-3.5 rounded-full overflow-hidden border border-border/50 relative">
                <div
                  className={`bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out ${
                    status === "locked" ? "animate-[pulse_3s_infinite]" : ""
                  }`}
                  style={{ width: `${progressPercent}%` }}
                  data-testid="vault-progress-bar"
                  role="progressbar"
                  aria-valuenow={progressPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Start: #{startBlock}</span>
                <span>End: #{endBlock}</span>
              </div>
            </div>

            {/* Detailed Grid Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <CircleDollarSign className="size-3.5" />
                  Principal Locked
                </span>
                <p className="text-lg font-bold text-foreground" data-testid="detail-principal">
                  {formatUSDCx(vault.principalAmount)} USDCx
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Percent className="size-3.5" />
                  Estimated Yield
                </span>
                <p className="text-lg font-bold text-emerald-500 font-mono" data-testid="detail-yield">
                  {vault.yieldEnabled ? `${formatSTX(estimatedYield)} STX` : "Disabled"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  Lock Duration
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {durationDays} Days ({durationBlocks} blocks)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                  <Layers className="size-3.5" />
                  Maturity Countdown
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {status === "completed"
                    ? "Completed"
                    : blocksToTimeRemaining(currentBlock, endBlock)}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History Feed */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Transaction History
            </h2>
            <TxHistoryList
              transactions={txHistory?.transactions || []}
              isLoading={txLoading}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
            />
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <WithdrawButton
            vaultId={vaultId}
            isVaultMature={isVaultMature || currentBlock >= endBlock}
            isActive={vault.isActive}
            currentBlock={currentBlock}
            endBlock={endBlock}
            onSuccess={refetchVault}
          />

          {vault.isActive && (
            <DepositForm vaultId={vaultId} onSuccess={refetchVault} />
          )}
        </div>
      </div>
    </div>
  );
}
