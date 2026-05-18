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
    // 1. Create vault 1 and deposit 1000
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 1"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    // 2. Create vault 2 and deposit 500
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 2"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

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
      "member-since": Cl.uint(3), // first deposit at block 3
      "last-vault-block": Cl.uint(0)
    }));
  });

  it("should record withdrawal, increment counters, and update last-vault-block", () => {
    // 1. Create vault 1
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Withdraw Vault"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    // 2. Deposit
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    // 3. Mine 144 blocks
    simnet.mineEmptyBlocks(144);

    // 4. Withdraw
    const withdrawResult = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);
    expect(withdrawResult.result).toBeOk(Cl.uint(1000));

    // 5. Verify profile has completed vaults = 1 and last-vault-block is updated
    const profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(1),
      "total-saved": Cl.uint(1000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(3), // creation block 2, deposit block 3
      "last-vault-block": Cl.uint(simnet.blockHeight)
    }));
  });

  it("should calculate active savings streak correctly", () => {
    // 1. Create vault and deposit
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Streak Vault"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    // 2. Mine blocks and withdraw
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);

    // 3. Verify streak is 1
    const streakResult = simnet.callReadOnlyFn("savings-profile", "get-savings-streak", [Cl.principal(wallet_1)], wallet_1);
    expect(streakResult.result).toBeUint(1);
  });

  it("should reset savings streak to zero after 4320 block window", () => {
    // 1. Create vault and deposit
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Streak Reset Vault"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    // 2. Mine blocks and withdraw
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);

    // 3. Mine 4321 more blocks (exceeding the 4320 block streak window)
    simnet.mineEmptyBlocks(4321);

    // 4. Verify streak is reset to 0
    const streakResult = simnet.callReadOnlyFn("savings-profile", "get-savings-streak", [Cl.principal(wallet_1)], wallet_1);
    expect(streakResult.result).toBeUint(0);
  });

  it("should verify leaderboard score formula matches exactly", () => {
    // 1. Create vault and deposit
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Leaderboard Vault"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(10000)
    ], wallet_1);

    // 2. Mine blocks and withdraw
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);

    // 3. Verify leaderboard score matches formula
    const scoreResult = simnet.callReadOnlyFn("savings-profile", "get-leaderboard-score", [Cl.principal(wallet_1)], wallet_1);
    expect(scoreResult.result).toBeUint(110);
  });

  it("should simulate 3 vault completions and verify cumulative stats", () => {
    // 1. Create 3 vaults
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 1"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 2"),
      Cl.uint(200),
      Cl.bool(false)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 3"),
      Cl.uint(300),
      Cl.bool(false)
    ], wallet_1);

    // 2. Deposit to all of them
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(2),
      Cl.uint(2000)
    ], wallet_1);

    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(3),
      Cl.uint(3000)
    ], wallet_1);

    // 3. Complete Vault 1: mine 144 blocks, withdraw
    simnet.mineEmptyBlocks(144);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);

    // 4. Complete Vault 2: mine 56 more blocks (total 200 blocks since start), withdraw
    simnet.mineEmptyBlocks(56);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(2)
    ], wallet_1);

    // 5. Complete Vault 3: mine 100 more blocks (total 300 blocks since start), withdraw
    simnet.mineEmptyBlocks(100);
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(3)
    ], wallet_1);

    // 6. Verify final profile cumulative stats
    const profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(3),
      "total-saved": Cl.uint(6000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(5), // first deposit at block height 5
      "last-vault-block": Cl.uint(simnet.blockHeight)
    }));

    // Verify streak and score
    const streakResult = simnet.callReadOnlyFn("savings-profile", "get-savings-streak", [Cl.principal(wallet_1)], wallet_1);
    expect(streakResult.result).toBeUint(3);

    const scoreResult = simnet.callReadOnlyFn("savings-profile", "get-leaderboard-score", [Cl.principal(wallet_1)], wallet_1);
    expect(scoreResult.result).toBeUint(306);
  });
});
