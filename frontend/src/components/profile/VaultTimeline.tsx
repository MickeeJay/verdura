"use client";

import React from "react";
import { useVaultTxHistory } from "@/hooks/useVaultTxHistory";
import { formatUSDCx } from "@/lib/utils/format";
import { ArrowDownLeft, ArrowUpRight, Loader2, Calendar } from "lucide-react";

export function VaultTimeline() {
  const { data, isLoading, loadMore, hasMore } = useVaultTxHistory();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4" data-testid="timeline-loading">
        <Loader2 className="size-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading transaction history...</p>
      </div>
    );
  }

  const transactions = data?.transactions ?? [];

  if (transactions.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-border rounded-2xl bg-card/50" data-testid="timeline-empty">
        <Calendar className="size-10 text-muted-foreground mx-auto mb-3 opacity-40" />
        <h4 className="text-base font-semibold text-foreground">No Transactions Found</h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
          Your transaction history will appear here once you perform deposits or withdrawals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="vault-timeline">
      <h3 className="text-lg font-bold text-foreground">Savings History Timeline</h3>
      
      <div className="relative border-l border-border ml-4 pl-6 space-y-6">
        {transactions.map((tx) => {
          const isDeposit = tx.type === "Deposit";
          const formattedTime = new Date(tx.timestamp * 1000).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div key={tx.txId} className="relative" data-testid="timeline-event">
              {/* Timeline Indicator Node */}
              <span
                className={`absolute -left-10 top-0 size-8 rounded-full border flex items-center justify-center shadow-sm transition-all duration-200 ${
                  isDeposit
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-500"
                }`}
              >
                {isDeposit ? (
                  <ArrowDownLeft className="size-4" />
                ) : (
                  <ArrowUpRight className="size-4" />
                )}
              </span>

              {/* Card content */}
              <div className="bg-card border border-border p-4 rounded-xl space-y-2 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-sm font-bold text-card-foreground">
                    {tx.type} {tx.vaultId ? `(Vault #${tx.vaultId})` : ""}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono font-medium">
                    {formattedTime} (approx.)
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {isDeposit ? (
                    <span className="font-semibold text-emerald-500">
                      +{formatUSDCx(tx.amount)} USDCx
                    </span>
                  ) : (
                    <span className="font-semibold text-blue-500">
                      Vault Withdrawal
                    </span>
                  )}

                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      tx.status === "success"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : tx.status === "pending"
                        ? "bg-amber-500/10 text-amber-500 animate-pulse"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>

                <div className="text-[10px] text-muted-foreground flex justify-between font-mono">
                  <span>Block #{tx.blockHeight}</span>
                  <a
                    href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-emerald-500"
                  >
                    View Tx ↗
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            className="px-4 py-2 border border-border rounded-xl text-xs font-semibold hover:bg-accent text-foreground transition-all duration-200 shadow-sm"
            data-testid="timeline-load-more"
          >
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  );
}

export default VaultTimeline;
