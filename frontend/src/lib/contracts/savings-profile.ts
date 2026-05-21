import { ClarityValue, cvToValue, ClarityType } from "@stacks/transactions";

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
