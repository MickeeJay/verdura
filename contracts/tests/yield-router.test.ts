import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

describe("yield-router", () => {
  it("should verify simulate-yield formula with known inputs", () => {
    // 1,000,000 amount, 10,000 blocks, 8% APY
    // Expected yield = (1,000,000 * 10,000 * 8) / 5,256,000 = 15,220
    const result = simnet.callReadOnlyFn("yield-router", "simulate-yield", [
      Cl.uint(1000000),
      Cl.uint(10000)
    ], wallet_1);
    expect(result.result).toBeUint(15220);
  });
});
