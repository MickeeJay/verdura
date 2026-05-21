import {
  ClarityValue,
  cvToValue,
  ClarityType,
  fetchCallReadOnlyFunction as callReadOnlyFunction,
  standardPrincipalCV
} from "@stacks/transactions";
import { StacksNetwork } from "@stacks/network";
import { getContractAddresses } from "../constants";

export interface ProfileData {
  totalVaultsCompleted: bigint;
  totalSaved: bigint;
  totalYieldEarned: bigint;
  memberSince: bigint;
  lastVaultBlock: bigint;
}

export function parseProfile(val: ClarityValue): ProfileData | null {
  if (val.type === ClarityType.OptionalNone) {
    return null;
  }

  if (val.type === ClarityType.OptionalSome) {
    const tuple = val.value;
    if (tuple.type === ClarityType.Tuple) {
      const data = tuple.value;
      return {
        totalVaultsCompleted: cvToValue(data["total-vaults-completed"]) as bigint,
        totalSaved: cvToValue(data["total-saved"]) as bigint,
        totalYieldEarned: cvToValue(data["total-yield-earned"]) as bigint,
        memberSince: cvToValue(data["member-since"]) as bigint,
        lastVaultBlock: cvToValue(data["last-vault-block"]) as bigint,
      };
    }
  }

  return null;
}

export async function fetchProfile(
  address: string,
  network: StacksNetwork
): Promise<ProfileData | null> {
  const { savingsProfile } = getContractAddresses(network);
  const [contractAddress, contractName] = savingsProfile.split(".");

  try {
    const result = await callReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: "get-profile",
      functionArgs: [
        standardPrincipalCV(address),
      ],
      senderAddress: address,
      network,
    });

    return parseProfile(result);
  } catch (error) {
    console.error(`Error fetching profile for address ${address}:`, error);
    return null;
  }
}

