"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchAllVaultsForOwner, VaultData } from "@/lib/contracts/savings-vault";

/**
 * Custom React Query hook to fetch all commitment savings vaults for the currently connected Stacks wallet address.
 * 
 * Query Key: `['vaults', address]`
 * Cache Lifetime (staleTime): Inherited from QueryClient defaults (30 seconds).
 * Refetch Behavior: Refetches automatically when the application window gains focus.
 * 
 * @returns Query result object containing:
 *  - `data`: Array of VaultData objects (empty array if no address is connected)
 *  - `isLoading`: Boolean state indicating if the network fetch is active
 *  - `isRefetching`: Boolean state indicating if query is background-refetching
 */
export function useVaults() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<VaultData[]>({
    queryKey: ["vaults", address] as const,
    queryFn: async (): Promise<VaultData[]> => {
      if (!address) {
        return [];
      }
      const data = await fetchAllVaultsForOwner(address, stacksNetwork);
      return data;
    },
    enabled: !!address,
    refetchOnWindowFocus: true,
  });
}
