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

  it("should return zero for get-savings-streak on a non-existent profile", () => {
    const result = simnet.callReadOnlyFn(
      "savings-profile",
      "get-savings-streak",
      [Cl.principal(wallet_1)],
      wallet_1
    );
    expect(result.result).toBeUint(0);
  });

  it("should create a new profile upon the first deposit", () => {
    // 1. Create a vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 1"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    // 2. Deposit
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    // 3. Verify profile is created
    const isMember = simnet.callReadOnlyFn("savings-profile", "is-member", [Cl.principal(wallet_1)], wallet_1);
    expect(isMember.result).toBeBool(true);

    const profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(0),
      "total-saved": Cl.uint(1000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(simnet.blockHeight),
      "last-vault-block": Cl.uint(0)
    }));
  });

  it("should increment total-saved upon subsequent deposits", () => {
    // 1. Create another vault (vault-id 2)
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 2"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    // 2. Deposit to the new vault (vault-id 2)
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(2),
      Cl.uint(500)
    ], wallet_1);

    // 3. Verify total-saved is now 1500
    const profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(0),
      "total-saved": Cl.uint(1500),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(2),
      "last-vault-block": Cl.uint(0)
    }));
  });
});
