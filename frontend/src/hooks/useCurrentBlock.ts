"use client";

import { useQuery } from "@tanstack/react-query";

const HIRO_API_URL = process.env.NEXT_PUBLIC_HIRO_API_URL ?? "https://api.testnet.hiro.so";

interface BlockResponse {
  results: Array<{
    height: number;
    hash: string;
    burn_block_height: number;
  }>;
  total: number;
}

async function fetchCurrentBlockHeight(): Promise<number> {
  try {
    const response = await fetch(`${HIRO_API_URL}/extended/v1/block?limit=1`);

    if (!response.ok) {
      console.warn(`Hiro API response was not OK: ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch block height: ${response.status}`);
    }

    const data: BlockResponse = await response.json();

    if (!data.results || data.results.length === 0) {
      console.error("Hiro API response returned an empty block list.");
      throw new Error("No block data returned from Hiro API");
    }

    return data.results[0].height;
  } catch (error) {
    console.error("Error encountered in fetchCurrentBlockHeight:", error);
    throw error;
  }
}

/**
 * Custom React Query hook that polls the Hiro Stacks API for the latest block height.
 * 
 * Query Key: `['currentBlock']`
 * Polling Interval: 60 seconds (prevents rate-limiting the Hiro API).
 * Background Polling: Disabled (does not poll when the tab is inactive/backgrounded).
 * 
 * @returns Query result containing the latest Stacks block height (number).
 */
export function useCurrentBlock() {
  return useQuery<number>({
    queryKey: ["currentBlock"],
    queryFn: fetchCurrentBlockHeight,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}
