"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchAllVaultsForOwner, VaultData } from "@/lib/contracts/savings-vault";

export function useVaults() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<VaultData[]>({
    queryKey: ["vaults", address],
    queryFn: () => {
      if (!address) {
        return Promise.resolve([]);
      }
      return fetchAllVaultsForOwner(address, stacksNetwork);
    },
    enabled: !!address,
    refetchOnWindowFocus: true,
  });
}
