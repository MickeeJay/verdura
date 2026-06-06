"use client";

import React, { createContext, useState, useCallback, useContext } from "react";
import { HiroTxStatus } from "@/lib/types/hiro-types";

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

export function TxProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);

  const pendingCount = 0;

  const addPendingTx = useCallback((txId: string, label: string) => {
    // Skeleton
  }, []);

  const clearResolved = useCallback(() => {
    // Skeleton
  }, []);

  return (
    <TxContext.Provider value={{ transactions, pendingCount, addPendingTx, clearResolved }}>
      {children}
    </TxContext.Provider>
  );
}

