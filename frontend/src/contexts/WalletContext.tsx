"use client";

import React, { createContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  showConnect,
  AppConfig,
  UserSession,
} from "@stacks/connect";
import {
  STACKS_TESTNET,
  STACKS_MAINNET,
  type StacksNetwork,
} from "@stacks/network";

export interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  network: "testnet" | "mainnet";
  connect: () => void;
  disconnect: () => void;
  stacksNetwork: StacksNetwork;
}

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
);

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

const networkEnv = process.env.NEXT_PUBLIC_NETWORK || "testnet";
const networkType: "testnet" | "mainnet" =
  networkEnv === "mainnet" ? "mainnet" : "testnet";
const stacksNetwork: StacksNetwork =
  networkType === "mainnet" ? STACKS_MAINNET : STACKS_TESTNET;

function extractAddress(session: UserSession): string | null {
  try {
    if (!session.isUserSignedIn()) return null;
    const userData = session.loadUserData();
    const stxAddress = userData?.profile?.stxAddress;
    if (!stxAddress) return null;
    return networkType === "mainnet" ? stxAddress.mainnet : stxAddress.testnet;
  } catch {
    return null;
  }
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    if (userSession.isUserSignedIn()) {
      const addr = extractAddress(userSession);
      if (addr) {
        setAddress(addr);
        setIsConnected(true);
      }
    }
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: {
        name: "Verdura",
        icon: "https://raw.githubusercontent.com/MickeeJay/verdura/main/docs/logo.png",
      },
      userSession,
      onFinish: () => {
        const addr = extractAddress(userSession);
        if (addr) {
          setAddress(addr);
          setIsConnected(true);
        }
      },
      onCancel: () => {
        console.log("Wallet connection cancelled");
      },
    });
  }, []);

  const disconnect = useCallback(() => {
    if (userSession.isUserSignedIn()) {
      userSession.signUserOut();
    }
    setAddress(null);
    setIsConnected(false);
  }, []);

  const contextValue: WalletContextType = {
    address: isMounted ? address : null,
    isConnected: isMounted ? isConnected : false,
    network: networkType,
    connect,
    disconnect,
    stacksNetwork,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
