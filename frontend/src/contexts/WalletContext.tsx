"use client";

import React, { createContext, ReactNode } from "react";
import {
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
