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
