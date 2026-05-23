"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchAllVaultsForOwner, VaultData } from "@/lib/contracts/savings-vault";

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
