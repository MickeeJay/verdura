import {
  fetchCallReadOnlyFunction as callReadOnlyFunction,
  uintCV,
  standardPrincipalCV,
  cvToValue,
  ClarityType
} from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";
import { getContractAddresses } from "../constants";

export async function fetchYieldBalance(
  vaultId: number,
  ownerAddress: string,
  network: StacksNetwork
): Promise<number> {
  const { yieldRouter } = getContractAddresses(network);
  const [contractAddress, contractName] = yieldRouter.split(".");

  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-yield-balance",
      functionArgs: [
        uintCV(vaultId),
        standardPrincipalCV(ownerAddress),
      ],
      senderAddress: ownerAddress,
      network,
    });

    if (result.type === ClarityType.ResponseOk) {
      const val = cvToValue(result.value);
      return Number(val);
    }
    return 0;
  } catch (error) {
    console.error(`Error fetching yield balance for vault ${vaultId}:`, error);
    return 0;
  }
}

export async function fetchSimulatedYield(
  amount: number,
  blocks: number,
  network: StacksNetwork
): Promise<number> {
  const { yieldRouter } = getContractAddresses(network);
  const [contractAddress, contractName] = yieldRouter.split(".");

  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "simulate-yield",
      functionArgs: [
        uintCV(amount),
        uintCV(blocks),
      ],
      senderAddress: contractAddress,
      network,
    });

    const val = cvToValue(result);
    return Number(val);
  } catch (error) {
    console.error(`Error simulating yield for amount ${amount} over ${blocks} blocks:`, error);
    return 0;
  }
}

