"use client";

import { useContext } from "react";
import { TxContext } from "@/contexts/TxContext";

export function useTx() {
  const context = useContext(TxContext);
  if (context === undefined) {
    throw new Error("useTx must be used within a TxProvider");
  }
  return context;
}
