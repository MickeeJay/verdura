"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";

const WalletModal = dynamic(
  () => import("./WalletModal").then((mod) => ({ default: mod.WalletModal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
        <div className="w-[420px] h-[280px] bg-card border border-border rounded-xl animate-pulse" />
      </div>
    ),
    ssr: false,
  }
);


export function WalletConnectButton() {
  const { address, isConnected, disconnect } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant={isConnected ? "outline" : "default"}
        className="font-medium rounded-lg px-4 py-2 text-sm transition-all duration-200"
      >
        {isConnected && address ? truncateAddress(address) : "Connect Wallet"}
      </Button>

      <WalletModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
