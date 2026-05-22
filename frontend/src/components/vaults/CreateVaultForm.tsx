"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createVaultSchema, type CreateVaultInput } from "@/lib/validation/vault";
import { durationDaysToBlocks } from "@/lib/utils/blocks";
import { fetchSimulatedYield } from "@/lib/contracts/yield-router";
import { buildCreateVaultTx } from "@/lib/contracts/savings-vault";
import { openContractCall } from "@stacks/connect";
import { useWallet } from "@/hooks/useWallet";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { DurationSlider } from "./DurationSlider";
import { YieldToggle } from "./YieldToggle";

type TxState =
  | { status: "idle" }
  | { status: "pending" }
  | { status: "success"; txId: string }
  | { status: "error"; message: string };

export function CreateVaultForm() {
  const { stacksNetwork } = useWallet();
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateVaultInput>({
    resolver: zodResolver(createVaultSchema),
    defaultValues: {
      name: "",
      durationDays: 30,
      yieldEnabled: false,
    },
  });

  const watchedDuration = watch("durationDays");
  const watchedYield = watch("yieldEnabled");

  const [simulatedAmount, setSimulatedAmount] = useState(100_000_000);
  const [estimatedYield, setEstimatedYield] = useState<number | null>(null);
  const [yieldLoading, setYieldLoading] = useState(false);
  const [txState, setTxState] = useState<TxState>({ status: "idle" });

  const updateYieldPreview = useCallback(async () => {
    if (!watchedYield) {
      setEstimatedYield(null);
      return;
    }
    const blocks = durationDaysToBlocks(watchedDuration);
    if (blocks <= 0 || simulatedAmount <= 0) {
      setEstimatedYield(null);
      return;
    }
    setYieldLoading(true);
    try {
      const result = await fetchSimulatedYield(simulatedAmount, blocks, stacksNetwork);
      setEstimatedYield(result);
    } catch {
      setEstimatedYield(null);
    } finally {
      setYieldLoading(false);
    }
  }, [watchedDuration, watchedYield, simulatedAmount, stacksNetwork]);

  useEffect(() => {
    const timeout = setTimeout(updateYieldPreview, 300);
    return () => clearTimeout(timeout);
  }, [updateYieldPreview]);

  const onSubmit = async (data: CreateVaultInput) => {
    setTxState({ status: "pending" });
    try {
      const durationBlocks = durationDaysToBlocks(data.durationDays);
      const txOptions = buildCreateVaultTx(
        {
          name: data.name,
          durationBlocks,
          yieldEnabled: data.yieldEnabled,
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-lg mx-auto p-6 bg-card border border-border rounded-2xl shadow-lg"
      noValidate
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
          Create Savings Vault
        </h2>
        <p className="text-sm text-muted-foreground">
          Initialize a new time-locked savings vault with customized yield rules.
        </p>
      </div>

      {/* Accessible error summary */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {Object.keys(errors).length > 0 && (
          <span>
            Form has {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""}.
            {errors.name && ` Vault name: ${errors.name.message}.`}
            {errors.durationDays && ` Duration: ${errors.durationDays.message}.`}
          </span>
        )}
      </div>

      {/* Vault Name Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="vault-name" className="text-sm font-semibold text-foreground">
          Vault Name
        </label>
        <input
          type="text"
          id="vault-name"
          maxLength={64}
          placeholder="e.g. My BTC Nest Egg"
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "vault-name-error" : undefined}
          {...register("name")}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20"
        />
        {errors.name && (
          <p id="vault-name-error" role="alert" aria-live="assertive" className="text-xs text-destructive font-medium">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Duration Slider */}
      <div className="flex flex-col gap-2">
        <Controller
          name="durationDays"
          control={control}
          render={({ field }) => (
            <DurationSlider
              value={field.value}
              onChange={field.onChange}
              id="vault-duration"
            />
          )}
        />
        {errors.durationDays && (
          <p id="vault-duration-error" role="alert" aria-live="assertive" className="text-xs text-destructive font-medium">
            {errors.durationDays.message}
          </p>
        )}
      </div>

      {/* Yield Toggle */}
      <Controller
        name="yieldEnabled"
        control={control}
        render={({ field }) => (
          <YieldToggle
            checked={field.value}
            onChange={field.onChange}
            id="vault-yield"
          />
        )}
      />

      {/* Yield Preview */}
      {watchedYield && (
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="simulated-amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Simulated Deposit (µSTX)
            </label>
            <input
              type="number"
              id="simulated-amount"
              min={1}
              value={simulatedAmount}
              onChange={(e) => setSimulatedAmount(Number(e.target.value) || 0)}
              className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated yield</span>
            <span className="font-mono font-semibold text-emerald-500" data-testid="yield-preview">
              {yieldLoading ? (
                <span className="animate-pulse">Calculating…</span>
              ) : estimatedYield !== null ? (
                `~${estimatedYield.toLocaleString()} µSTX`
              ) : (
                "—"
              )}
            </span>
          </div>
        </div>
      )}

      {/* Transaction State Feedback */}
      {txState.status === "pending" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm" role="status" aria-live="polite">
          <Loader2 className="size-5 text-amber-500 animate-spin" />
          <span className="text-amber-600 dark:text-amber-400 font-medium">Confirming on Stacks…</span>
        </div>
      )}

      {txState.status === "success" && (
        <div className="flex flex-col gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Vault created successfully!</span>
          </div>
          <a
            href={`https://explorer.hiro.so/txid/${txState.txId}?chain=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-500 hover:underline font-mono truncate"
          >
            View transaction: {txState.txId}
          </a>
        </div>
      )}

      {txState.status === "error" && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm" role="alert" aria-live="assertive">
          <AlertCircle className="size-5 text-destructive" />
          <span className="text-destructive font-medium">{txState.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={txState.status === "pending"}
        className="w-full flex items-center justify-center gap-2 h-10 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {txState.status === "pending" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Confirming…
          </>
        ) : (
          "Create Vault"
        )}
      </button>
    </form>
  );
}
