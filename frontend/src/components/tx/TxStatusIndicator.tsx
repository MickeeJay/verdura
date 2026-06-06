"use client";

import React, { useState } from "react";
import { useTx } from "@/hooks/useTx";
import { Activity } from "lucide-react";
import { PendingTxDrawer } from "./PendingTxDrawer";

export function TxStatusIndicator() {
  const { pendingCount } = useTx();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // If there are no pending transactions, we still want to let users click it to see history
  // but we can render it without the badge or hide it.
  // The spec says: "shows a small count badge when there are pending transactions"
  // Let's show the indicator always so users can open the drawer to view recent transactions,
  // but only show the pulsing badge and animation when pendingCount > 0.
  // Or: "Renders nothing if pendingCount === 0 and no recent resolved txs" - since we can just check transactions length,
  // if transactions list is completely empty, we can render nothing.

  const { transactions } = useTx();
  if (transactions.length === 0) {
    return null;
  }

  const isPending = pendingCount > 0;

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="relative flex items-center justify-center p-2 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 active:scale-95"
        aria-label="View transaction status history"
        data-testid="tx-indicator-button"
      >
        <Activity
          className={`size-5 ${
            isPending ? "text-emerald-500 animate-pulse" : "text-muted-foreground"
          }`}
        />
        {isPending && (
          <span
            data-testid="tx-indicator-badge"
            className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white ring-2 ring-background animate-in zoom-in-50 duration-300"
          >
            {pendingCount}
          </span>
        )}
      </button>

      <PendingTxDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
