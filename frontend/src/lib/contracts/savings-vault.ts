import { ContractCallOptions, makeContractCall, stringAsciiCV, uintCV, boolCV } from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";
import { getContractAddresses } from "../constants";

export interface VaultData {
  id: number;
  owner: string;
  name: string;
  principalAmount: bigint;
  startBlock: bigint;
  endBlock: bigint;
  isActive: boolean;
  yieldEnabled: boolean;
  yieldShares: bigint;
}

export interface CreateVaultParams {
  name: string;
  durationBlocks: number;
  yieldEnabled: boolean;
}

export interface DepositParams {
  vaultId: number;
  amount: bigint;
}

export interface WithdrawParams {
  vaultId: number;
}

export interface VaultQueryResult {
  vault: VaultData | null;
}

export function buildCreateVaultTx(params: CreateVaultParams, network: StacksNetwork): ContractCallOptions {
  const { savingsVault } = getContractAddresses(network);
  const [contractAddress, contractName] = savingsVault.split(".");

  return {
    contractAddress,
    contractName,
    functionName: "create-vault",
    functionArgs: [
      stringAsciiCV(params.name),
      uintCV(params.durationBlocks),
      boolCV(params.yieldEnabled),
    ],
    network,
  };
}

