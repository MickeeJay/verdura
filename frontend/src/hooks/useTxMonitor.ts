"use client";

import { useQuery } from "@tanstack/react-query";
import type { HiroTransactionResponse, HiroTxStatus } from "@/lib/types/hiro-types";

import { isTerminalStatus } from "@/lib/types/hiro-types";

const HIRO_API_URL = process.env.NEXT_PUBLIC_HIRO_API_URL ?? "https://api.testnet.hiro.so";

async function fetchTransaction(txId: string): Promise<HiroTransactionResponse> {
  const url = `${HIRO_API_URL}/extended/v1/tx/${txId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction ${txId}: ${response.statusText}`);
  }
  return response.json();
}

export function useTxMonitor(txId: string | null) {
  const query = useQuery<HiroTransactionResponse>({
    queryKey: ["tx-monitor", txId],
    queryFn: () => {
      if (!txId) {
        throw new Error("No transaction ID provided");
      }
      return fetchTransaction(txId);
    },
    enabled: !!txId,
    refetchInterval: (query) => {
      const state = query.state.data;
      if (state && isTerminalStatus(state.tx_status)) {
        return false;
      }
      return 10_000;
    },
  });

  const txStatus: HiroTxStatus | null = query.data?.tx_status ?? null;
  const isTerminal = txStatus ? isTerminalStatus(txStatus) : false;

  return {
    ...query,
    txStatus,
    isTerminal,
  };
}
