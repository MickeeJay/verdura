"use client";

import React, { useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { buildWithdrawTx } from "@/lib/contracts/savings-vault";
import { openContractCall } from "@stacks/connect";
import { useQueryClient } from "@tanstack/react-query";
import { blocksToTimeRemaining } from "@/lib/utils/blocks";
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface WithdrawButtonProps {
  vaultId: number;
  isVaultMature: boolean;
  isActive: boolean;
  currentBlock: number;
  endBlock: number;
  onSuccess?: () => void;
}

type TxState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; txId: string }
  | { status: "error"; message: string };

export function WithdrawButton({
  vaultId,
  isVaultMature,
  isActive,
  currentBlock,
  endBlock,
  onSuccess,
}: WithdrawButtonProps) {
  const { address, stacksNetwork } = useWallet();
  const queryClient = useQueryClient();
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const timeRemaining = blocksToTimeRemaining(currentBlock, endBlock);

  const handleWithdraw = async () => {
    if (!address || !isVaultMature || !isActive) return;
    setTxState({ status: "pending" });

    try {
      const txOptions = buildWithdrawTx({ vaultId }, stacksNetwork);

      await openContractCall({
        ...txOptions,
        appDetails: {
          name: "Verdura",
          icon: "https://raw.githubusercontent.com/MickeeJay/verdura/main/docs/logo.png",
        },
        onFinish: async (result: { txId: string }) => {
          setTxState({ status: "success", txId: result.txId });
          
          // Trigger confetti dynamically
          try {
            const confetti = (await import("canvas-confetti")).default;
            confetti({
              particleCount: 150,
              spread: 80,
              origin: { y: 0.6 },
              colors: ["#10b981", "#3b82f6", "#f59e0b"],
            });
          } catch (e) {
            console.error("Failed to load confetti dynamically:", e);
          }

          queryClient.invalidateQueries({ queryKey: ["vault", address, vaultId] });
          queryClient.invalidateQueries({ queryKey: ["vaults", address] });
          queryClient.invalidateQueries({ queryKey: ["profile", address] });
          queryClient.invalidateQueries({ queryKey: ["vault-tx-history", vaultId] });
          
          if (onSuccess) onSuccess();
        },
        onCancel: () => {
          setTxState({ status: "idle" });
        },
      } as unknown as Parameters<typeof openContractCall>[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Withdrawal failed";
      setTxState({ status: "error", message });
    }
  };

  const preloadConfetti = () => {
    import("canvas-confetti").catch((err) => {
      console.warn("Failed to pre-load canvas-confetti:", err);
    });
  };

  if (!isActive) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center h-11 px-6 bg-muted text-muted-foreground font-semibold rounded-xl cursor-not-allowed border border-border"
      >
        Vault Withdrawn
      </button>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="relative group w-full">
        {/* Strictly disabled check */}
        {!isVaultMature ? (
          <>
            <button
              disabled
              data-testid="withdraw-button-disabled"
              className="w-full flex items-center justify-center gap-2 h-11 px-6 bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 font-semibold rounded-xl cursor-not-allowed border border-border"
            >
              Withdraw Principal
            </button>
            <div
              role="tooltip"
              data-testid="withdraw-tooltip"
              className="vault-tooltip"
            >
              Vault matures in {timeRemaining}
            </div>
          </>
        ) : (
          <button
            onClick={handleWithdraw}
            onMouseEnter={preloadConfetti}
            disabled={txState.status === "pending" || txState.status === "success"}
            data-testid="withdraw-button-enabled"
            className={`w-full flex items-center justify-center gap-2 h-11 px-6 font-semibold rounded-xl transition-all shadow-md active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed ${
              txState.status === "success"
                ? "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500 border border-border"
                : "bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/20"
            }`}
          >
            {txState.status === "pending" ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Withdrawing...
              </>
            ) : txState.status === "success" ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" />
                Withdrawn Successfully
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                Withdraw Principal & Yield
              </>
            )}
          </button>
        )}
      </div>

      {/* Transaction status info */}
      {txState.status === "pending" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs" role="status">
          <Loader2 className="size-4 text-amber-500 animate-spin" />
          <span className="text-amber-600 dark:text-amber-400 font-medium">Processing withdrawal on Stacks...</span>
        </div>
      )}

      {txState.status === "success" && (
        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs" role="status">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Withdrawal transaction broadcasted!</span>
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
    </div>
  );
}
