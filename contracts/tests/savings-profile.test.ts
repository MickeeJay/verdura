import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;

describe("savings-profile", () => {
  it("should deploy and be able to call get-total-saved", () => {
    const result = simnet.callReadOnlyFn("savings-profile", "get-total-saved", [Cl.principal(wallet_1)], wallet_1);
    expect(result.result).toBeOk(Cl.uint(0));
  });

  it("should fail record-deposit if caller is not savings-vault", () => {
    const result = simnet.callPublicFn(
      "savings-profile",
      "record-deposit",
      [Cl.principal(wallet_1), Cl.uint(1), Cl.uint(100)],
      wallet_1
    );
    expect(result.result).toBeErr(Cl.uint(300)); // err-unauthorized
  });

  it("should fail record-withdrawal if caller is not savings-vault", () => {
    const result = simnet.callPublicFn(
      "savings-profile",
      "record-withdrawal",
      [Cl.principal(wallet_1), Cl.uint(1), Cl.uint(100), Cl.uint(0)],
      wallet_1
    );
    expect(result.result).toBeErr(Cl.uint(300)); // err-unauthorized
  });

  it("should return none for get-profile on a non-existent profile", () => {
    const result = simnet.callReadOnlyFn(
      "savings-profile",
      "get-profile",
      [Cl.principal(wallet_1)],
      wallet_1
    );
    expect(result.result).toBeNone();
  });

  it("should return false for is-member on a non-existent profile", () => {
    const result = simnet.callReadOnlyFn(
      "savings-profile",
      "is-member",
      [Cl.principal(wallet_1)],
      wallet_1
    );
    expect(result.result).toBeBool(false);
  });

  it("should return zero for get-leaderboard-score on a non-existent profile", () => {
    const result = simnet.callReadOnlyFn(
      "savings-profile",
      "get-leaderboard-score",
      [Cl.principal(wallet_1)],
      wallet_1
    );
    expect(result.result).toBeUint(0);
  });
});
