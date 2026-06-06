"use client";

import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { HiroTxStatus, isTerminalStatus } from "@/lib/types/hiro-types";
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

export function useTx(): TxContextType {
  const context = useContext(TxContext);
  if (!context) {
    throw new Error("useTx must be used within a TxProvider");
  }
  return context;
}

// Helper watcher component for tracking individual transactions
function TxWatcherItem({
  txId,
  label,
  onTransition,
}: {
  txId: string;
  label: string;
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
    // Skeleton for now, to be filled in toast commits
  }, []);

  const clearResolved = useCallback(() => {
    // Skeleton
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
          label={tx.label}
          onTransition={handleTransition}
        />
      ))}
    </TxContext.Provider>
  );
}

