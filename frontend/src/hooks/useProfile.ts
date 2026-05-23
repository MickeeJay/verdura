"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchProfile, fetchLeaderboardScore, fetchSavingsStreak, ProfileData } from "@/lib/contracts/savings-profile";

/**
 * Custom React Query hook to fetch the savings profile metrics for the connected Stacks wallet address.
 * 
 * Query Key: `['profile', address]`
 * Cache Lifetime (staleTime): Set to 60 seconds (custom override).
 * Refetch Behavior: Refetches on window focus.
 * 
 * @returns Query result containing:
 *  - `data`: ProfileData representing total completions, total saved, and total yield (or null if not connected)
 *  - `isLoading`: Boolean state indicating if network request is pending
 */
export function useProfile() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<ProfileData | null>({
    queryKey: ["profile", address] as const,
    queryFn: async (): Promise<ProfileData | null> => {
      if (!address) {
        return null;
      }
      const data = await fetchProfile(address, stacksNetwork);
      return data;
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Custom React Query hook to fetch the leaderboard score for the connected Stacks wallet address.
 */
export function useLeaderboardScore() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<bigint>({
    queryKey: ["leaderboardScore", address] as const,
    queryFn: async (): Promise<bigint> => {
      if (!address) {
        return 0n;
      }
      return fetchLeaderboardScore(address, stacksNetwork);
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Custom React Query hook to fetch the savings streak for the connected Stacks wallet address.
 */
export function useSavingsStreak() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<bigint>({
    queryKey: ["savingsStreak", address] as const,
    queryFn: async (): Promise<bigint> => {
      if (!address) {
        return 0n;
      }
      return fetchSavingsStreak(address, stacksNetwork);
    },
    enabled: !!address,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

