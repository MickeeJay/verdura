import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;

describe("savings-vault", () => {
  it("should deploy and be able to call get-vault-count", () => {
    const result = simnet.callReadOnlyFn("savings-vault", "get-vault-count", [], wallet_1);
    expect(result.result).toBeUint(0);
  });

  it("should create-vault with valid params", () => {
    const result = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("My Vault"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);
    expect(result.result).toBeOk(Cl.uint(1));
  });

  it("should fail create-vault with zero duration", () => {
    const result = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("My Vault"),
      Cl.uint(0),
      Cl.bool(true)
    ], wallet_1);
    expect(result.result).toBeErr(Cl.uint(107)); // err-invalid-duration
  });
});
