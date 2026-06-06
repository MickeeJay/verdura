"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { WalletProvider } from "@/contexts/WalletContext";
import { TxProvider } from "@/contexts/TxContext";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TxProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TxProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}
