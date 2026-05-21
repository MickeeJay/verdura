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
