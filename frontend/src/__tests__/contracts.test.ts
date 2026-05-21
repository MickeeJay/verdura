import {
  someCV,
  tupleCV,
  stringAsciiCV,
  uintCV,
  boolCV,
  noneCV
} from "@stacks/transactions";
import { parseVault } from "../lib/contracts/savings-vault";

describe("VaultData Parsing", () => {
  it("correctly parses a valid some tuple to VaultData", () => {
    const mockTuple = tupleCV({
      name: stringAsciiCV("My Vault"),
      "principal-amount": uintCV(5000),
      "start-block": uintCV(100),
      "end-block": uintCV(1000),
      "is-active": boolCV(true),
      "yield-enabled": boolCV(true),
      "yield-shares": uintCV(50),
    });
    const mockSome = someCV(mockTuple);

    const result = parseVault(mockSome, 1, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(result).toEqual({
      id: 1,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      name: "My Vault",
      principalAmount: 5000n,
      startBlock: 100n,
      endBlock: 1000n,
      isActive: true,
      yieldEnabled: true,
      yieldShares: 50n,
    });
  });

  it("returns null for none response", () => {
    const result = parseVault(noneCV(), 1, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(result).toBeNull();
  });
});
