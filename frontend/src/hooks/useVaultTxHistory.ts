"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/hooks/useWallet";
import { getContractAddresses } from "@/lib/constants";
import { useState } from "react";

/**
 * Interface representing argument values in Stacks transactions from Hiro API.
 */
export interface HiroTxArg {
  hex: string;
  repr: string;
  name: string;
}

/**
 * Interface representing a smart contract call event in the transaction history.
 */
export interface HiroContractCall {
  contract_id: string;
  function_name: string;
  function_args?: HiroTxArg[];
}

/**
 * Interface representing a Stacks transaction from the Hiro blockchain API.
 */
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
  vaultId?: number;
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
 * Custom React Query hook to retrieve and paginate transaction history.
 * If vaultId is provided and > 0, filters the transaction history of the savings-vault contract for that vault.
 * If vaultId is omitted or <= 0, retrieves and filters all savings-vault transactions for the connected user.
 */
export function useVaultTxHistory(vaultId?: number, initialLimit = 50) {
  const { address, stacksNetwork } = useWallet();
  const { savingsVault } = getContractAddresses(stacksNetwork);
  const offset = 0;
  const [limit, setLimit] = useState(initialLimit);

  const isAll = !vaultId || vaultId <= 0;
  const queryKey = ["vault-tx-history", savingsVault, isAll ? "all" : vaultId, address, limit, offset] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const targetAddress = isAll ? (address || "") : savingsVault;
      if (!targetAddress) {
        return { transactions: [], total: 0, hasMore: false };
      }

      const data = await fetchContractTransactions(targetAddress, limit, offset);
      
      // Filter transactions related to this vault
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

        const vaultIdArg = args.find(
          (arg) => arg.name === "vault-id"
        );

        let isMatch = false;
        let amount = 0n;
        let type: "Deposit" | "Withdraw" | "Create" = "Deposit";
        let txVaultId = 0;

        if (vaultIdArg) {
          txVaultId = Number(vaultIdArg.repr.replace(/^u/, ""));
        }

        if (isAll) {
          if (isDeposit || isWithdraw) {
            isMatch = true;
            type = isDeposit ? "Deposit" : "Withdraw";
            if (isDeposit) {
              const amountArg = args.find((arg) => arg.name === "amount");
              if (amountArg) {
                amount = BigInt(amountArg.repr.replace(/^u/, ""));
              }
            }
          }
        } else {
          if (isDeposit && vaultIdArg && vaultIdArg.repr === targetRepr) {
            isMatch = true;
            type = "Deposit";
            const amountArg = args.find((arg) => arg.name === "amount");
            if (amountArg) {
              amount = BigInt(amountArg.repr.replace(/^u/, ""));
            }
          } else if (isWithdraw && vaultIdArg && vaultIdArg.repr === targetRepr) {
            isMatch = true;
            type = "Withdraw";
            amount = 0n; 
          }
        }

        if (isMatch) {
          filtered.push({
            txId: tx.tx_id,
            type,
            amount,
            timestamp: tx.burn_block_time || Math.floor(Date.now() / 1000),
            blockHeight: tx.block_height,
            status: tx.tx_status,
            vaultId: txVaultId > 0 ? txVaultId : undefined,
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
    enabled: isAll ? !!address : true,
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

