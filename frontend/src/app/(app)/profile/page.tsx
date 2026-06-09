"use client";

import React from "react";
import { useWallet } from "@/hooks/useWallet";
import { useProfile, useLeaderboardScore, useSavingsStreak } from "@/hooks/useProfile";
import { useCurrentBlock } from "@/hooks/useCurrentBlock";
import { SavingsStats } from "@/components/profile/SavingsStats";
import { SavingsStreak } from "@/components/profile/SavingsStreak";
import { LeaderboardScore } from "@/components/profile/LeaderboardScore";
import { VaultTimeline } from "@/components/profile/VaultTimeline";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { useQueryClient } from "@tanstack/react-query";
import { RefreshCw, User, AlertTriangle } from "lucide-react";

function ProfilePageContent() {
  const { address } = useWallet();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: profileLoading,
    isRefetching: profileRefetching,
    isError: profileError,
    error: profileErrorObj,
  } = useProfile();

  const {
    data: score = 0n,
    isLoading: scoreLoading,
    isError: scoreError,
    error: scoreErrorObj,
  } = useLeaderboardScore();

  const {
    data: streak = 0n,
    isLoading: streakLoading,
    isError: streakError,
    error: streakErrorObj,
  } = useSavingsStreak();

  const {
    data: currentBlock,
    isLoading: blockLoading,
    isError: blockError,
    error: blockErrorObj,
  } = useCurrentBlock();

  const handleRefresh = async () => {
    if (!address) return;
    await queryClient.invalidateQueries({ queryKey: ["profile", address] });
    await queryClient.invalidateQueries({ queryKey: ["leaderboardScore", address] });
    await queryClient.invalidateQueries({ queryKey: ["savingsStreak", address] });
    await queryClient.invalidateQueries({ queryKey: ["currentBlock"] });
    await queryClient.invalidateQueries({ queryKey: ["vault-tx-history"] });
  };

  if (!address) {
    return null;
  }

  const isLoading = profileLoading || scoreLoading || streakLoading || blockLoading;
  const isError = profileError || scoreError || streakError || blockError;

  if (isError) {
    const errorMsg =
      profileErrorObj?.message ||
      scoreErrorObj?.message ||
      streakErrorObj?.message ||
      blockErrorObj?.message ||
      "An unexpected error occurred.";

    return (
      <div className="container mx-auto px-4 py-12 max-w-md text-center space-y-6" data-testid="profile-error">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <AlertTriangle className="size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Failed to Load Profile
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-center gap-3">
            <User className="size-8 text-emerald-500" />
            Savings Profile
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your savings progress, completion streak, and leaderboard rank on the Stacks network.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="refresh-btn"
            disabled={profileRefetching}
            aria-label="Refresh Profile"
            data-testid="refresh-profile-button"
          >
            <RefreshCw
              className={`size-4 refresh-btn__icon ${profileRefetching ? "animate-spin" : ""}`}
            />
            {profileRefetching ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Savings Stats Cards */}
      <SavingsStats
        profile={profile ?? null}
        currentBlock={currentBlock}
        isLoading={isLoading}
      />

      {/* Grid for Streak and Leaderboard Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsStreak streak={streak} isLoading={isLoading} />
        <LeaderboardScore score={score} isLoading={isLoading} />
      </div>

      {/* Vault Timeline Section */}
      <div className="border-t border-border pt-8">
        <VaultTimeline />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ErrorBoundary>
      <ProfilePageContent />
    </ErrorBoundary>
  );
}
