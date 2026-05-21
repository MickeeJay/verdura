"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { truncateAddress } from "@/lib/utils";
import { WalletModal } from "./WalletModal";

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
