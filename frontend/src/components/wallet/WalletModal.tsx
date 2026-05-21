"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";

interface WalletModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WalletModal({ isOpen, onOpenChange }: WalletModalProps) {
  const { connect } = useWallet();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleConnect = () => {
    onOpenChange(false);
    connect();
  };

  // SVGs for wallet logos
  const LeatherIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-3 h-5 w-5"
    >
      <circle cx="12" cy="12" r="10" fill="#ECEFF1" />
      <path
        d="M8 7H11V14C11 15.6569 12.3431 17 14 17H16V20H14C10.6863 20 8 17.3137 8 14V7Z"
        fill="#121212"
      />
    </svg>
  );

  const XverseIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-3 h-5 w-5"
    >
      <circle cx="12" cy="12" r="10" fill="#000000" />
      <path
        d="M7 7L17 17M7 17L17 7"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-background border border-border rounded-xl shadow-2xl p-6">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Connect your wallet
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Connect to interact with Bitcoin-backed savings on Stacks.
          </DialogDescription>
        </DialogHeader>

        {isMobile ? (
          <div className="flex flex-col items-center justify-center space-y-6 py-4">
            {/* Visual QR Code placeholder */}
            <div className="relative p-4 bg-white rounded-xl border border-gray-200 shadow-md">
              <svg
                width="160"
                height="160"
                viewBox="0 0 100 100"
                className="text-black"
                fill="currentColor"
              >
                {/* QR code pattern */}
                <rect x="5" y="5" width="25" height="25" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="12" y="12" width="11" height="11" />
                
                <rect x="70" y="5" width="25" height="25" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="77" y="12" width="11" height="11" />

                <rect x="5" y="70" width="25" height="25" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="77" y="77" width="11" height="11" />
                <rect x="12" y="77" width="11" height="11" />

                {/* Random microblocks */}
                <rect x="35" y="5" width="10" height="5" />
                <rect x="50" y="5" width="5" height="15" />
                <rect x="60" y="10" width="5" height="5" />
                <rect x="35" y="15" width="5" height="10" />
                <rect x="45" y="20" width="15" height="5" />
                <rect x="5" y="35" width="10" height="5" />
                <rect x="20" y="35" width="5" height="15" />
                <rect x="5" y="45" width="5" height="5" />
                <rect x="15" y="45" width="15" height="5" />
                <rect x="35" y="35" width="30" height="30" />
                <rect x="40" y="40" width="20" height="20" fill="white" />
                <rect x="45" y="45" width="10" height="10" />
                <rect x="70" y="35" width="15" height="5" />
                <rect x="80" y="40" width="15" height="5" />
                <rect x="70" y="50" width="5" height="15" />
                <rect x="85" y="55" width="10" height="10" />
                <rect x="35" y="70" width="5" height="15" />
                <rect x="45" y="75" width="10" height="5" />
                <rect x="40" y="85" width="15" height="10" />
                <rect x="60" y="70" width="5" height="5" />
                <rect x="60" y="80" width="15" height="5" />
                <rect x="70" y="85" width="5" height="10" />
                <rect x="85" y="70" width="10" height="5" />
                <rect x="80" y="80" width="15" height="15" />
              </svg>
              {/* Inner branding logo indicator */}
              <div className="absolute inset-0 m-auto w-10 h-10 bg-black rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-[10px] text-white font-bold tracking-widest">V</span>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground max-w-[280px]">
              Scan this QR code with your mobile wallet camera, or open one of the apps below:
            </p>

            <div className="w-full space-y-3">
              <Button
                onClick={handleConnect}
                variant="outline"
                className="w-full flex items-center justify-center h-12 rounded-lg font-medium border-border hover:bg-accent text-sm"
              >
                <XverseIcon />
                Open Xverse Mobile
              </Button>
              <Button
                onClick={handleConnect}
                variant="outline"
                className="w-full flex items-center justify-center h-12 rounded-lg font-medium border-border hover:bg-accent text-sm"
              >
                <LeatherIcon />
                Open Leather Mobile
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-3 py-4">
            <Button
              onClick={handleConnect}
              variant="outline"
              className="w-full flex items-center justify-start h-14 px-4 rounded-lg font-medium border-border hover:bg-accent transition-all duration-200"
            >
              <LeatherIcon />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">Leather Wallet</span>
                <span className="text-xs text-muted-foreground">Use Leather browser extension</span>
              </div>
            </Button>

            <Button
              onClick={handleConnect}
              variant="outline"
              className="w-full flex items-center justify-start h-14 px-4 rounded-lg font-medium border-border hover:bg-accent transition-all duration-200"
            >
              <XverseIcon />
              <div className="flex flex-col items-start">
                <span className="text-sm font-semibold">Xverse Wallet</span>
                <span className="text-xs text-muted-foreground">Use Xverse browser extension</span>
              </div>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
