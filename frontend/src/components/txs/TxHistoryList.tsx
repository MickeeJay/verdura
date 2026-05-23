"use client";

import React from "react";
import { FilteredVaultTx } from "@/hooks/useVaultTxHistory";
import { formatSTX } from "@/lib/utils/format";
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Calendar, Layers } from "lucide-react";

interface TxHistoryListProps {
  transactions: FilteredVaultTx[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TxHistoryList({
  transactions,
  isLoading,
  hasMore,
  onLoadMore,
}: TxHistoryListProps) {
  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-4 py-4" data-testid="tx-history-loading">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full skeleton" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-border rounded-xl bg-card" data-testid="tx-history-empty">
        <p className="text-sm text-muted-foreground font-medium">
          No transaction history found for this vault.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
        {transactions.map((tx) => {
          const isDeposit = tx.type === "Deposit";
          const dateStr = new Date(tx.timestamp * 1000).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <div
              key={tx.txId}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              data-testid="tx-history-item"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    isDeposit
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-blue-500/10 text-blue-500"
                  }`}
                >
                  {isDeposit ? (
                    <ArrowDownLeft className="size-4" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {tx.type}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {dateStr}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Layers className="size-3" />
                      #{tx.blockHeight}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-bold font-mono text-foreground">
                    {isDeposit
                      ? `+${formatSTX(tx.amount)} STX`
                      : `Withdrawal`}
                  </p>
                  <p className="text-[10px] text-emerald-500 font-medium capitalize">
                    {tx.status}
                  </p>
                </div>

                <a
                  href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-md hover:bg-muted border border-transparent hover:border-border text-muted-foreground hover:text-foreground transition-all"
                  aria-label={`View transaction ${tx.txId} on Stacks Explorer`}
                >
                  <ExternalLink className="size-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full flex items-center justify-center h-10 border border-border bg-card hover:bg-muted font-medium text-xs rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-pulse">Loading more...</span>
          ) : (
            "Load More Transactions"
          )}
        </button>
      )}
    </div>
  );
}
