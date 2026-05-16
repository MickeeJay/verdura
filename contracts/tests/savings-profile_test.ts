import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;

describe("savings-profile", () => {
  it("should deploy and be able to call get-total-saved", () => {
    const result = simnet.callReadOnlyFn("savings-profile", "get-total-saved", [wallet_1], wallet_1);
    expect(result.result).toBeUint(0);
  });
});
