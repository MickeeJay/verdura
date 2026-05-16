import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;

describe("yield-router", () => {
  it("should deploy and be able to call get-yield-balance", () => {
    const result = simnet.callReadOnlyFn("yield-router", "get-yield-balance", [
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.token", // placeholder
      wallet_1
    ], wallet_1);
    expect(result.result).toBeUint(0);
  });
});
