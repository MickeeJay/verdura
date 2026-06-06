"use client";

import React, { useEffect, useState } from "react";
import { useTx } from "@/hooks/useTx";
import { X, ExternalLink, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface PendingTxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendingTxDrawer({ isOpen, onClose }: PendingTxDrawerProps) {
  const { transactions, clearResolved } = useTx();
  const [mounted, setMounted] = useState(false);

  // Handle slide transition after mount
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  const resolvedTxs = transactions.filter(
    (tx) => tx.status !== "submitted" && tx.status !== "pending"
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      aria-labelledby="drawer-title"
      role="dialog"
      aria-modal="true"
      data-testid="tx-drawer"
    >
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-background/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        data-testid="tx-drawer-backdrop"
      />

      {/* Drawer panel */}
      <div
        className={`relative w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col h-full z-10 transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="space-y-1">
            <h2 id="drawer-title" className="text-lg font-bold tracking-tight text-foreground">
              Transactions Status
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time updates of your Stacks blockchain calls.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            aria-label="Close drawer"
            data-testid="tx-drawer-close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-xl bg-muted/20 text-center p-4">
              <p className="text-sm text-muted-foreground font-medium">No recent transactions</p>
              <p className="text-xs text-muted-foreground mt-1">
                Your contract call transactions will appear here while they process.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isPending = tx.status === "submitted" || tx.status === "pending";
                const isSuccess = tx.status === "success";

                let statusText = "Pending";
                if (isSuccess) statusText = "Success";
                else if (!isPending) statusText = "Failed";

                return (
                  <div
                    key={tx.txId}
                    data-testid="tx-drawer-item"
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {isPending ? (
                          <Loader2 className="size-4 text-amber-500 animate-spin" />
                        ) : isSuccess ? (
                          <CheckCircle className="size-4 text-emerald-500" />
                        ) : (
                          <AlertCircle className="size-4 text-destructive" />
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">{tx.label}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">
                          {tx.txId}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                              isPending
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : isSuccess
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {statusText}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(tx.addedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://explorer.hiro.so/txid/${tx.txId}?chain=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
                      aria-label={`View transaction ${tx.txId} on Stacks Explorer`}
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {resolvedTxs.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/10">
            <button
              onClick={clearResolved}
              className="w-full flex items-center justify-center h-10 px-4 py-2 border border-border bg-card hover:bg-muted hover:text-foreground text-muted-foreground text-sm font-semibold rounded-xl transition-all"
              data-testid="tx-clear-resolved"
            >
              Clear Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
