import {
  ContractCallOptions,
  makeContractCall,
  stringAsciiCV,
  uintCV,
  boolCV,
  fetchCallReadOnlyFunction as callReadOnlyFunction,
  standardPrincipalCV,
  cvToValue,
  ClarityType,
  ClarityValue
} from "@stacks/transactions";
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

export function buildDepositTx(params: DepositParams, network: StacksNetwork): ContractCallOptions {
  const { savingsVault } = getContractAddresses(network);
  const [contractAddress, contractName] = savingsVault.split(".");

  return {
    contractAddress,
    contractName,
    functionName: "deposit",
    functionArgs: [
      uintCV(params.vaultId),
      uintCV(params.amount),
    ],
    network,
  };
}

export function buildWithdrawTx(params: WithdrawParams, network: StacksNetwork): ContractCallOptions {
  const { savingsVault } = getContractAddresses(network);
  const [contractAddress, contractName] = savingsVault.split(".");

  return {
    contractAddress,
    contractName,
    functionName: "withdraw",
    functionArgs: [
      uintCV(params.vaultId),
    ],
    network,
  };
}

export function parseVault(val: ClarityValue, id: number, ownerAddress: string): VaultData | null {
  if (val.type === ClarityType.OptionalNone) {
    return null;
  }

  if (val.type === ClarityType.OptionalSome) {
    const tuple = val.value;
    if (tuple.type === ClarityType.Tuple) {
      const data = tuple.value;
      return {
        id,
        owner: ownerAddress,
        name: cvToValue(data["name"]) as string,
        principalAmount: cvToValue(data["principal-amount"]) as bigint,
        startBlock: cvToValue(data["start-block"]) as bigint,
        endBlock: cvToValue(data["end-block"]) as bigint,
        isActive: cvToValue(data["is-active"]) as boolean,
        yieldEnabled: cvToValue(data["yield-enabled"]) as boolean,
        yieldShares: cvToValue(data["yield-shares"]) as bigint,
      };
    }
  }

  return null;
}

export async function fetchVault(
  ownerAddress: string,
  vaultId: number,
  network: StacksNetwork
): Promise<VaultData | null> {
  const { savingsVault } = getContractAddresses(network);
  const [contractAddress, contractName] = savingsVault.split(".");

  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-vault",
      functionArgs: [
        standardPrincipalCV(ownerAddress),
        uintCV(vaultId),
      ],
      senderAddress: ownerAddress,
      network,
    });

    return parseVault(result, vaultId, ownerAddress);
  } catch (error) {
    console.error(`Error fetching vault ${vaultId}:`, error);
    return null;
  }
}




