"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { fetchProfile, ProfileData } from "@/lib/contracts/savings-profile";

export function useProfile() {
  const { address, stacksNetwork } = useWallet();

  return useQuery<ProfileData | null>({
    queryKey: ["profile", address],
    queryFn: () => {
      if (!address) {
        return Promise.resolve(null);
      }
      return fetchProfile(address, stacksNetwork);
    },
    enabled: !!address,
    refetchOnWindowFocus: true,
  });
}
