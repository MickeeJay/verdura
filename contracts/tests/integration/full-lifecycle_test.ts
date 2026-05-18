import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const wallet_1 = accounts.get("wallet_1")!;
const wallet_2 = accounts.get("wallet_2")!;
const wallet_3 = accounts.get("wallet_3")!;
const deployer = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";

describe("verdura-integration-tests", () => {
  it("user-creates-vault-deposits-and-withdraws-with-yield", () => {
    const amount = 10000; // 10000 micro-STX
    const duration = 144;

    // Seed the yield router contract with STX to fund yield payouts
    simnet.transferSTX(100000, `${deployer}.yield-router`, wallet_1);

    // Record initial balance
    const balanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet_1) || 0n;
    expect(balanceBefore).toBeGreaterThan(0n);

    // 1. Create a vault with yield enabled
    const createResult = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Yield Savings Vault"),
      Cl.uint(duration),
      Cl.bool(true)
    ], wallet_1);
    expect(createResult.result).toBeOk(Cl.uint(1));
    const vaultId = 1;

    // 2. Deposit 10000 uSTX
    const depositResult = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(vaultId),
      Cl.uint(amount)
    ], wallet_1);
    expect(depositResult.result).toBeOk(Cl.bool(true));

    // Verify router stats
    const statsBefore = simnet.callReadOnlyFn("yield-router", "get-router-stats", [], wallet_1);
    expect(statsBefore.result).toBeTuple({
      "total-shares": Cl.uint(amount),
      "total-assets": Cl.uint(amount),
      "is-paused": Cl.bool(false)
    });

    // 3. Advance chain by vault duration
    simnet.mineEmptyBlocks(duration + 4);

    // Verify yield balance (expected yield: 10000 * 148 * 8 / 5256000 = 2, so total = 10002)
    const yieldBalance = simnet.callReadOnlyFn("yield-router", "get-yield-balance", [
      Cl.uint(vaultId),
      Cl.principal(wallet_1)
    ], wallet_1);
    expect(yieldBalance.result).toBeOk(Cl.uint(10002));

    // 4. Withdraw principal + yield
    const withdrawResult = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(vaultId)
    ], wallet_1);
    expect(withdrawResult.result).toBeOk(Cl.uint(10002));

    // Verify net balance change (deposited 10000, got back 10002, net change = 2)
    const balanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet_1) || 0n;
    expect(balanceAfter - balanceBefore).toBe(2n);

    // Verify profile stats are updated
    const profileResult = simnet.callReadOnlyFn("savings-profile", "get-profile", [
      Cl.principal(wallet_1)
    ], wallet_1);
    expect(profileResult.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(1),
      "total-saved": Cl.uint(amount),
      "total-yield-earned": Cl.uint(2),
      "member-since": Cl.uint(4),
      "last-vault-block": Cl.uint(153)
    }));
  });

  it("multiple-users-independent-vaults", () => {
    const userA = wallet_1;
    const userB = wallet_2;
    const userC = wallet_3;

    // Record initial balance for all three users
    const balA = simnet.getAssetsMap().get("STX")?.get(userA) || 0n;
    const balB = simnet.getAssetsMap().get("STX")?.get(userB) || 0n;
    const balC = simnet.getAssetsMap().get("STX")?.get(userC) || 0n;

    expect(balA).toBeGreaterThan(0n);
    expect(balB).toBeGreaterThan(0n);
    expect(balC).toBeGreaterThan(0n);

    // Create 2 vaults for each user
    const createA1 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault A1"), Cl.uint(144), Cl.bool(false)], userA);
    const createA2 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault A2"), Cl.uint(144), Cl.bool(false)], userA);
    expect(createA1.result).toBeOk(Cl.uint(1));
    expect(createA2.result).toBeOk(Cl.uint(2));

    const createB1 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault B1"), Cl.uint(144), Cl.bool(false)], userB);
    const createB2 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault B2"), Cl.uint(144), Cl.bool(false)], userB);
    expect(createB1.result).toBeOk(Cl.uint(3));
    expect(createB2.result).toBeOk(Cl.uint(4));

    const createC1 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault C1"), Cl.uint(144), Cl.bool(false)], userC);
    const createC2 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault C2"), Cl.uint(144), Cl.bool(false)], userC);
    expect(createC1.result).toBeOk(Cl.uint(5));
    expect(createC2.result).toBeOk(Cl.uint(6));

    // Deposit STX into each vault
    const depA1 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(1), Cl.uint(1000)], userA);
    const depA2 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(2), Cl.uint(2000)], userA);
    expect(depA1.result).toBeOk(Cl.bool(true));
    expect(depA2.result).toBeOk(Cl.bool(true));

    const depB1 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(3), Cl.uint(3000)], userB);
    const depB2 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(4), Cl.uint(4000)], userB);
    expect(depB1.result).toBeOk(Cl.bool(true));
    expect(depB2.result).toBeOk(Cl.bool(true));

    const depC1 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(5), Cl.uint(5000)], userC);
    const depC2 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(6), Cl.uint(6000)], userC);
    expect(depC1.result).toBeOk(Cl.bool(true));
    expect(depC2.result).toBeOk(Cl.bool(true));

    // Verify cross-user withdrawal is blocked (user B cannot withdraw user A's vault)
    const crossWithdraw = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(1)], userB);
    expect(crossWithdraw.result).toBeErr(Cl.uint(102));

    const crossWithdraw2 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(2)], userC);
    expect(crossWithdraw2.result).toBeErr(Cl.uint(102));

    // Advance block-height by 144 to mature all vaults
    simnet.mineEmptyBlocks(144);

    // Each user withdraws their own vaults successfully
    const withdrawA1 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(1)], userA);
    const withdrawA2 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(2)], userA);
    expect(withdrawA1.result).toBeOk(Cl.uint(1000));
    expect(withdrawA2.result).toBeOk(Cl.uint(2000));

    const withdrawB1 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(3)], userB);
    const withdrawB2 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(4)], userB);
    expect(withdrawB1.result).toBeOk(Cl.uint(3000));
    expect(withdrawB2.result).toBeOk(Cl.uint(4000));

    const withdrawC1 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(5)], userC);
    const withdrawC2 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(6)], userC);
    expect(withdrawC1.result).toBeOk(Cl.uint(5000));
    expect(withdrawC2.result).toBeOk(Cl.uint(6000));
  });

  it("early-withdrawal-blocked", () => {
    // 1. Create a vault
    const createResult = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Early Block Vault"),
      Cl.uint(144),
      Cl.bool(false)
    ], wallet_1);
    expect(createResult.result).toBeOk(Cl.uint(1));

    // 2. Deposit STX
    const depositResult = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(5000)
    ], wallet_1);
    expect(depositResult.result).toBeOk(Cl.bool(true));

    // 3. Attempt withdrawal before end-block -> fails with err-vault-locked (u103)
    const prematureWithdraw = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);
    expect(prematureWithdraw.result).toBeErr(Cl.uint(103));
  });

  it("yield-router-paused-blocks-deposit", () => {
    // 1. Create a yield-enabled vault
    const createResult = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Paused Yield Vault"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);
    expect(createResult.result).toBeOk(Cl.uint(1));

    // 2. Pause the yield router from the deployer (contract owner)
    const pauseResult = simnet.callPublicFn("yield-router", "pause-router", [], deployer);
    expect(pauseResult.result).toBeOk(Cl.bool(true));

    // 3. Attempt deposit into yield-enabled vault -> fails with err-unauthorized (u100)
    const depositAttempt = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);
    expect(depositAttempt.result).toBeErr(Cl.uint(100));

    // 4. Resume the yield router
    const resumeResult = simnet.callPublicFn("yield-router", "resume-router", [], deployer);
    expect(resumeResult.result).toBeOk(Cl.bool(true));

    // 5. Verify deposit now succeeds
    const depositSuccess = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);
    expect(depositSuccess.result).toBeOk(Cl.bool(true));
  });

  it("profile-stats-accumulate-across-vaults", () => {
    // 1. Create three vaults
    const c1 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault 1"), Cl.uint(144), Cl.bool(false)], wallet_1);
    const c2 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault 2"), Cl.uint(144), Cl.bool(false)], wallet_1);
    const c3 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("Vault 3"), Cl.uint(144), Cl.bool(false)], wallet_1);
    expect(c1.result).toBeOk(Cl.uint(1));
    expect(c2.result).toBeOk(Cl.uint(2));
    expect(c3.result).toBeOk(Cl.uint(3));

    // 2. Deposit into each vault
    const d1 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(1), Cl.uint(1000)], wallet_1);
    const d2 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(2), Cl.uint(2000)], wallet_1);
    const d3 = simnet.callPublicFn("savings-vault", "deposit", [Cl.uint(3), Cl.uint(3000)], wallet_1);
    expect(d1.result).toBeOk(Cl.bool(true));
    expect(d2.result).toBeOk(Cl.bool(true));
    expect(d3.result).toBeOk(Cl.bool(true));

    // 3. Mature vaults
    simnet.mineEmptyBlocks(144);

    // 4. Complete first vault (withdraw)
    const w1 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(1)], wallet_1);
    expect(w1.result).toBeOk(Cl.uint(1000));

    // Verify profile stats after first completion
    let profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(1),
      "total-saved": Cl.uint(6000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(5),
      "last-vault-block": Cl.uint(152)
    }));

    // 5. Complete second vault
    const w2 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(2)], wallet_1);
    expect(w2.result).toBeOk(Cl.uint(2000));

    // Verify accumulated profile stats after second completion
    profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(2),
      "total-saved": Cl.uint(6000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(5),
      "last-vault-block": Cl.uint(153)
    }));

    // 6. Complete third vault
    const w3 = simnet.callPublicFn("savings-vault", "withdraw", [Cl.uint(3)], wallet_1);
    expect(w3.result).toBeOk(Cl.uint(3000));

    // Verify final accumulated profile stats
    profile = simnet.callReadOnlyFn("savings-profile", "get-profile", [Cl.principal(wallet_1)], wallet_1);
    expect(profile.result).toBeSome(Cl.tuple({
      "total-vaults-completed": Cl.uint(3),
      "total-saved": Cl.uint(6000),
      "total-yield-earned": Cl.uint(0),
      "member-since": Cl.uint(5),
      "last-vault-block": Cl.uint(154)
    }));
  });

  it("vault-id-increments-correctly", () => {
    // 1. User A creates first vault -> gets ID 1
    const v1 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("User A Vault 1"), Cl.uint(144), Cl.bool(false)], wallet_1);
    expect(v1.result).toBeOk(Cl.uint(1));

    // 2. User A creates second vault -> gets ID 2
    const v2 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("User A Vault 2"), Cl.uint(144), Cl.bool(false)], wallet_1);
    expect(v2.result).toBeOk(Cl.uint(2));

    // 3. User B creates vault -> gets ID 3
    const v3 = simnet.callPublicFn("savings-vault", "create-vault", [Cl.stringAscii("User B Vault 1"), Cl.uint(144), Cl.bool(false)], wallet_2);
    expect(v3.result).toBeOk(Cl.uint(3));

    // 4. Verify maps isolation by retrieving vault details via get-vault
    const details1 = simnet.callReadOnlyFn("savings-vault", "get-vault", [Cl.principal(wallet_1), Cl.uint(1)], wallet_1);
    expect(details1.result).toBeSome(Cl.tuple({
      "name": Cl.stringAscii("User A Vault 1"),
      "start-block": Cl.uint(2),
      "end-block": Cl.uint(146),
      "principal-amount": Cl.uint(0),
      "yield-enabled": Cl.bool(false),
      "yield-shares": Cl.uint(0),
      "is-active": Cl.bool(true)
    }));

    const details2 = simnet.callReadOnlyFn("savings-vault", "get-vault", [Cl.principal(wallet_1), Cl.uint(2)], wallet_1);
    expect(details2.result).toBeSome(Cl.tuple({
      "name": Cl.stringAscii("User A Vault 2"),
      "start-block": Cl.uint(3),
      "end-block": Cl.uint(147),
      "principal-amount": Cl.uint(0),
      "yield-enabled": Cl.bool(false),
      "yield-shares": Cl.uint(0),
      "is-active": Cl.bool(true)
    }));

    const details3 = simnet.callReadOnlyFn("savings-vault", "get-vault", [Cl.principal(wallet_2), Cl.uint(3)], wallet_2);
    expect(details3.result).toBeSome(Cl.tuple({
      "name": Cl.stringAscii("User B Vault 1"),
      "start-block": Cl.uint(4),
      "end-block": Cl.uint(148),
      "principal-amount": Cl.uint(0),
      "yield-enabled": Cl.bool(false),
      "yield-shares": Cl.uint(0),
      "is-active": Cl.bool(true)
    }));
  });
});
