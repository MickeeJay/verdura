export const STX_DECIMALS = 6;
export const USDCX_DECIMALS = 6;
export const BLOCK_TIME_SEC = 600; // 10 minutes

export interface ContractAddresses {
  savingsVault: string;
  yieldRouter: string;
  savingsProfile: string;
}

export const CONTRACT_ADDRESSES: Record<"devnet" | "testnet" | "mainnet", ContractAddresses> = {
  devnet: {
    savingsVault: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault",
    yieldRouter: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.yield-router",
    savingsProfile: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-profile",
  },
  testnet: {
    savingsVault: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault",
    yieldRouter: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.yield-router",
    savingsProfile: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-profile",
  },
  mainnet: {
    savingsVault: "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-vault",
    yieldRouter: "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.yield-router",
    savingsProfile: "SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.savings-profile",
  },
};

/**
 * Helper to resolve the correct contract addresses based on a StacksNetwork instance.
 */
import { StacksNetwork } from "@stacks/network";

export function getContractAddresses(network: StacksNetwork): ContractAddresses {
  if (network.isMainnet()) {
    return CONTRACT_ADDRESSES.mainnet;
  }
  // Check if it's local/devnet or testnet.
  // Hiro's StacksNetwork doesn't explicitly expose devnet, but we can check the RPC URL or assume testnet as fallback.
  const url = network.getCoreApiUrl();
  if (url.includes("localhost") || url.includes("127.0.0.1") || url.includes("devnet")) {
    return CONTRACT_ADDRESSES.devnet;
  }
  return CONTRACT_ADDRESSES.testnet;
}
