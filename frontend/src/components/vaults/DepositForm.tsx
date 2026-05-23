"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useWallet } from "@/hooks/useWallet";
import { buildDepositTx } from "@/lib/contracts/savings-vault";
import { openContractCall } from "@stacks/connect";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatTokenAmount } from "@/lib/utils/format";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const HIRO_API_URL = process.env.NEXT_PUBLIC_HIRO_API_URL ?? "https://api.testnet.hiro.so";

interface DepositFormProps {
  vaultId: number;
  onSuccess?: () => void;
}

interface AccountBalances {
  stx: {
    balance: string;
  };
}

async function fetchStxBalance(address: string): Promise<bigint> {
  const res = await fetch(`${HIRO_API_URL}/extended/v1/address/${address}/balances`);
  if (!res.ok) {
    throw new Error("Failed to fetch balance");
  }
  const data: AccountBalances = await res.json();
  return BigInt(data.stx.balance);
}

type DepositInput = {
  amount: string;
};

type TxState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; txId: string }
  | { status: "error"; message: string };

export function DepositForm({ vaultId, onSuccess }: DepositFormProps) {
  const { address, stacksNetwork } = useWallet();
  const queryClient = useQueryClient();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  // Fetch STX Balance
  const { data: balance = 0n, isLoading: balanceLoading, refetch: refetchBalance } = useQuery<bigint>({
    queryKey: ["stxBalance", address],
    queryFn: () => (address ? fetchStxBalance(address) : Promise.resolve(0n)),
    enabled: !!address,
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DepositInput>({
    defaultValues: {
      amount: "",
    },
  });

  const onSubmit = async (data: DepositInput) => {
    if (!address) return;

    // Manual validation — always uses latest balance
    const val = Number(data.amount);
    if (!data.amount || data.amount.trim() === "") {
      setError("amount", { message: "Amount is required" });
      return;
    }
    if (isNaN(val) || val <= 0) {
      setError("amount", { message: "Amount must be a positive number" });
      return;
    }
    const microVal = BigInt(Math.round(val * 1_000_000));
    if (microVal > balance) {
      setError("amount", { message: "Amount exceeds available wallet balance" });
      return;
    }

    setTxState({ status: "pending" });

    try {
      const txOptions = buildDepositTx(
        {
          vaultId,
          amount: microVal,
        },
        stacksNetwork
      );

      await openContractCall({
        ...txOptions,
        appDetails: {
          name: "Verdura",
          icon: "https://raw.githubusercontent.com/MickeeJay/verdura/main/docs/logo.png",
        },
        onFinish: (result: { txId: string }) => {
          setTxState({ status: "success", txId: result.txId });
          reset();
          refetchBalance();
          queryClient.invalidateQueries({ queryKey: ["vault", address, vaultId] });
          queryClient.invalidateQueries({ queryKey: ["vault-tx-history", vaultId] });
          if (onSuccess) onSuccess();
        },
        onCancel: () => {
          setTxState({ status: "idle" });
        },
      } as unknown as Parameters<typeof openContractCall>[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transaction failed";
      setTxState({ status: "error", message });
    }
  };

  const formattedBalance = formatTokenAmount(balance, 6);

  return (
    <div className="p-6 bg-card border border-border rounded-2xl shadow-lg space-y-6 max-w-md w-full">
      <div className="space-y-1">
        <h3 className="text-lg font-bold tracking-tight text-foreground">
          Deposit STX
        </h3>
        <p className="text-xs text-muted-foreground">
          Add additional principal to your commitment vault to secure more savings.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Accessible error summary */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {errors.amount && `Deposit error: ${errors.amount.message}`}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="deposit-amount" className="font-semibold text-muted-foreground">
              Amount (STX)
            </label>
            <span className="text-muted-foreground font-medium">
              Available: {balanceLoading ? "Loading..." : `${formattedBalance} STX`}
            </span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              id="deposit-amount"
              placeholder="e.g. 50"
              aria-invalid={errors.amount ? "true" : "false"}
              aria-describedby={errors.amount ? "deposit-amount-error" : undefined}
              {...register("amount")}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
            />
          </div>
          {errors.amount && (
            <p id="deposit-amount-error" role="alert" className="text-xs text-destructive font-medium">
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* Transaction Statuses */}
        {txState.status === "pending" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs" role="status">
            <Loader2 className="size-4 text-amber-500 animate-spin" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">Confirming deposit on Stacks...</span>
          </div>
        )}

        {txState.status === "success" && (
          <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs" role="status">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Deposit transaction broadcasted!</span>
            </div>
            <a
              href={`https://explorer.hiro.so/txid/${txState.txId}?chain=testnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-emerald-500 hover:underline font-mono truncate"
            >
              View: {txState.txId}
            </a>
          </div>
        )}

        {txState.status === "error" && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-xs" role="alert">
            <AlertCircle className="size-4 text-destructive" />
            <span className="text-destructive font-medium">{txState.message}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={txState.status === "pending" || balanceLoading}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {txState.status === "pending" ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Broadcasting...
            </>
          ) : (
            "Deposit Savings"
          )}
        </button>
      </form>
    </div>
  );
}
