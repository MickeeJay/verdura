import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;

describe("savings-vault", () => {
  it("should deploy and be able to call get-vault-count", () => {
    const result = simnet.callReadOnlyFn("savings-vault", "get-vault-count", [], wallet_1);
    expect(result.result).toBeUint(0);
  });
});
