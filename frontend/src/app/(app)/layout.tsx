"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TxProvider } from "@/contexts/TxContext";
import { Toaster } from "sonner";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProvider client={queryClient}>
      <TxProvider>
        {children}
        <Toaster richColors position="bottom-right" />
      </TxProvider>
    </QueryClientProvider>
  );
}
