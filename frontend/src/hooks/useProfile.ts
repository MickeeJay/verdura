"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchProfile, ProfileData } from "@/lib/contracts/savings-profile";

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
