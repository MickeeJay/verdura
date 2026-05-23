"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { getContractAddresses } from "@/lib/constants";
import { useState } from "react";

export interface HiroTxArg {
  hex: string;
  repr: string;
  name: string;
}

export interface HiroContractCall {
  contract_id: string;
  function_name: string;
  function_args?: HiroTxArg[];
}

export interface HiroTransaction {
  tx_id: string;
  tx_status: "success" | "pending" | "failed";
  tx_type: string;
  burn_block_time: number;
  burn_block_time_iso?: string;
  block_height: number;
  contract_call?: HiroContractCall;
}

export interface HiroTxHistoryResponse {
  limit: number;
  offset: number;
  total: number;
  results: HiroTransaction[];
}

export interface FilteredVaultTx {
  txId: string;
  type: "Deposit" | "Withdraw" | "Create";
  amount: bigint;
  timestamp: number;
  blockHeight: number;
  status: "success" | "pending" | "failed";
}

const HIRO_API_URL = process.env.NEXT_PUBLIC_HIRO_API_URL ?? "https://api.testnet.hiro.so";

async function fetchContractTransactions(
  contractAddress: string,
  limit: number,
  offset: number
): Promise<HiroTxHistoryResponse> {
  const url = `${HIRO_API_URL}/extended/v1/address/${contractAddress}/transactions?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Custom React Query hook to retrieve and paginate transaction history for a specific vault.
 * Filters the transaction history of the savings-vault contract for relevant vault events.
 */
export function useVaultTxHistory(vaultId: number, initialLimit = 50) {
  const { stacksNetwork } = useWallet();
  const { savingsVault } = getContractAddresses(stacksNetwork);
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(initialLimit);

  const queryKey = ["vault-tx-history", savingsVault, vaultId, limit, offset] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const data = await fetchContractTransactions(savingsVault, limit, offset);
      
      // Filter transactions related to this vault ID
      const filtered: FilteredVaultTx[] = [];
      const targetRepr = `u${vaultId}`;

      for (const tx of data.results) {
        if (tx.tx_type !== "contract_call" || !tx.contract_call) {
          continue;
        }

        const call = tx.contract_call;
        const args = call.function_args || [];

        // Check if this contract call is for our savingsVault contract
        if (!call.contract_id.endsWith("savings-vault")) {
          continue;
        }

        // We only care about create-vault, deposit, and withdraw
        const isCreate = call.function_name === "create-vault";
        const isDeposit = call.function_name === "deposit";
        const isWithdraw = call.function_name === "withdraw";

        if (!isCreate && !isDeposit && !isWithdraw) {
          continue;
        }

        // For create-vault, wait, we might not have a vault-id in the input arguments,
        // but we might want to show it. Actually, wait! The create-vault response returns
        // the vault ID, but in the transaction list we'd have to know the resulting vault ID.
        // Let's check: can we match create-vault if the transaction created this vault?
        // Wait, for deposit/withdraw, the first argument 'vault-id' is matched.
        // Let's inspect the arguments:
        const vaultIdArg = args.find(
          (arg) => arg.name === "vault-id" || arg.name === "vault-id"
        );

        let isMatch = false;
        let amount = 0n;
        let type: "Deposit" | "Withdraw" | "Create" = "Deposit";

        if (isDeposit && vaultIdArg && vaultIdArg.repr === targetRepr) {
          isMatch = true;
          type = "Deposit";
          const amountArg = args.find((arg) => arg.name === "amount");
          if (amountArg) {
            // Amount is represented like "u1000000"
            amount = BigInt(amountArg.repr.replace(/^u/, ""));
          }
        } else if (isWithdraw && vaultIdArg && vaultIdArg.repr === targetRepr) {
          isMatch = true;
          type = "Withdraw";
          // Withdraw principal is not in the args, but we will display that it's a withdraw event.
          // In actual UX, we can show the transaction. Let's set amount to 0 or we can approximate it.
          amount = 0n; 
        }

        if (isMatch) {
          filtered.push({
            txId: tx.tx_id,
            type,
            amount,
            timestamp: tx.burn_block_time || Math.floor(Date.now() / 1000),
            blockHeight: tx.block_height,
            status: tx.tx_status,
          });
        }
      }

      return {
        transactions: filtered,
        total: data.total,
        hasMore: offset + limit < data.total,
      };
    },
    refetchInterval: 30_000,
  });

  const loadMore = () => {
    if (query.data?.hasMore) {
      setLimit((prev) => prev + initialLimit);
    }
  };

  return {
    ...query,
    loadMore,
    hasMore: !!query.data?.hasMore,
  };
}
