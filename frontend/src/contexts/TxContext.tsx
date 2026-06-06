"use client";

import React, { createContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { HiroTxStatus, isTerminalStatus, isSuccessStatus } from "@/lib/types/hiro-types";
import { useTxMonitor } from "@/hooks/useTxMonitor";

export interface PendingTransaction {
  txId: string;
  label: string;
  status: HiroTxStatus | "submitted";
  addedAt: number;
  resolvedAt?: number;
}

interface TxContextType {
  transactions: PendingTransaction[];
  pendingCount: number;
  addPendingTx: (txId: string, label: string) => void;
  clearResolved: () => void;
}

export const TxContext = createContext<TxContextType | undefined>(undefined);



// Helper watcher component for tracking individual transactions
function TxWatcherItem({
  txId,
  onTransition,
}: {
  txId: string;
  onTransition: (txId: string, status: HiroTxStatus) => void;
}) {
  const { txStatus } = useTxMonitor(txId);

  useEffect(() => {
    if (txStatus) {
      onTransition(txId, txStatus);
    }
  }, [txStatus, txId, onTransition]);

  return null;
}

export function TxProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);

  // Calculate pending count (any tx not in terminal status)
  const pendingCount = transactions.filter(
    (tx) => tx.status === "submitted" || !isTerminalStatus(tx.status)
  ).length;

  const addPendingTx = useCallback((txId: string, label: string) => {
    setTransactions((prev) => {
      if (prev.some((tx) => tx.txId === txId)) return prev;

      // Show initial loading toast
      toast.loading(`${label}...`, {
        id: txId,
        description: "Transaction submitted to Stacks",
      });

      return [
        ...prev,
        {
          txId,
          label,
          status: "submitted",
          addedAt: Date.now(),
        },
      ];
    });
  }, []);

  const handleTransition = useCallback((txId: string, status: HiroTxStatus) => {
    setTransactions((prev) => {
      const tx = prev.find((t) => t.txId === txId);
      if (!tx) return prev;

      // Only update if status actually changed
      if (tx.status === status) return prev;

      const isTerminal = isTerminalStatus(status);

      if (isTerminal) {
        if (isSuccessStatus(status)) {
          toast.success(`${tx.label}!`, {
            id: txId,
            description: "Confirmed on Stacks",
          });
        } else {
          toast.error(`${tx.label} failed`, {
            id: txId,
            description: "Transaction aborted or dropped",
          });
        }
      }

      return prev.map((t) =>
        t.txId === txId
          ? {
              ...t,
              status,
              resolvedAt: isTerminal ? Date.now() : t.resolvedAt,
            }
          : t
      );
    });
  }, []);

  const clearResolved = useCallback(() => {
    setTransactions((prev) =>
      prev.filter((tx) => tx.status === "submitted" || !isTerminalStatus(tx.status))
    );
  }, []);

  // Auto-cleanup resolved transactions after 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prev) =>
        prev.filter((tx) => {
          if (!tx.resolvedAt) return true;
          return Date.now() - tx.resolvedAt < 5 * 60 * 1000;
        })
      );
    }, 30_000);

    return () => clearInterval(interval);
  }, []);

  // Filter down to only transactions that need active polling
  const activeTxs = transactions.filter(
    (tx) => tx.status === "submitted" || !isTerminalStatus(tx.status)
  );

  return (
    <TxContext.Provider value={{ transactions, pendingCount, addPendingTx, clearResolved }}>
      {children}
      {/* Mount a watcher for each active transaction */}
      {activeTxs.map((tx) => (
        <TxWatcherItem
          key={tx.txId}
          txId={tx.txId}
          onTransition={handleTransition}
        />
      ))}
    </TxContext.Provider>
  );
}

