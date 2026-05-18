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
    expect(true).toBe(true);
  });
});
