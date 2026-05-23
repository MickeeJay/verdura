"use client";

import React from "react";
import { VaultData } from "@/lib/contracts/savings-vault";
import { VaultStatusBadge, getVaultStatus } from "./VaultStatusBadge";
import { blocksToTimeRemaining } from "@/lib/utils/blocks";
import { formatUSDCx, formatSTX } from "@/lib/utils/format";
import { Calendar, CircleDollarSign, Percent, Lock } from "lucide-react";

interface VaultCardProps {
  vault: VaultData;
  currentBlock: number;
}

export function VaultCard({ vault, currentBlock }: VaultCardProps) {
  const status = getVaultStatus(vault.isActive, currentBlock, Number(vault.endBlock));
  const timeRemaining = blocksToTimeRemaining(currentBlock, Number(vault.endBlock));

  // Calculate estimated yield using contract simulation formula: (amount * blocks * 8) / 5,256,000
  const end = BigInt(vault.endBlock);
  const start = BigInt(vault.startBlock);
  const blocks = end > start ? end - start : 0n;
  const estimatedYield = vault.yieldEnabled
    ? (vault.principalAmount * blocks * 8n) / 5256000n
    : 0n;

  return (
    <div className="vault-card" data-testid="vault-card">
      <div className="vault-card__header">
        <h3 className="vault-card__name flex items-center gap-2">
          <Lock className="size-4 text-emerald-500" />
          {vault.name}
        </h3>
        <VaultStatusBadge status={status} />
      </div>

      <div className="vault-card__body">
        <div className="vault-card__row">
          <span className="vault-card__label flex items-center gap-1.5">
            <CircleDollarSign className="size-4 text-muted-foreground" />
            Principal
          </span>
          <span className="vault-card__value" data-testid="vault-principal">
            {formatUSDCx(vault.principalAmount)} USDCx
          </span>
        </div>

        <div className="vault-card__row">
          <span className="vault-card__label flex items-center gap-1.5">
            <Percent className="size-4 text-muted-foreground" />
            Est. Yield
          </span>
          <span className="vault-card__value text-emerald-500 font-mono" data-testid="vault-yield">
            {formatSTX(estimatedYield)} STX
          </span>
        </div>

        <div className="vault-card__row pt-2 border-t border-border/50">
          <span className="vault-card__label flex items-center gap-1.5">
            <Calendar className="size-4 text-muted-foreground" />
            Maturity
          </span>
          <span
            className={`vault-card__countdown ${
              status === "matured" ? "vault-card__countdown--ready" : ""
            }`}
            data-testid="vault-countdown"
          >
            {status === "completed" ? "Completed" : timeRemaining}
          </span>
        </div>
      </div>
    </div>
  );
}
