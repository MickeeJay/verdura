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

  it("should fail route-to-yield when the router is paused", () => {
    // 1. Create vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Paused Test"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);

    // 2. Pause the router from the contract owner (deployer)
    const pauseResult = simnet.callPublicFn("yield-router", "pause-router", [], deployer);
    expect(pauseResult.result).toBeOk(Cl.bool(true));

    // 3. Attempt deposit, which should fail because the yield router is paused.
    // savings-vault wraps route-to-yield failures in err-unauthorized (u100)
    const depositResult = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(1000)
    ], wallet_1);
    expect(depositResult.result).toBeErr(Cl.uint(100));

    // 4. Resume the router
    const resumeResult = simnet.callPublicFn("yield-router", "resume-router", [], deployer);
    expect(resumeResult.result).toBeOk(Cl.bool(true));
  });

  it("should run a complete lifecycle: deposit, accrue 8% yield, and withdraw principal + yield", () => {
    const amount = 1000000; // 1 STX
    const duration = 1000;

    // Seed the yield router contract with STX to fund yield payouts
    simnet.transferSTX(100000, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.yield-router", wallet_1);

    // 1. Create a yield-bearing vault
    const createResult = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Yield Vault"),
      Cl.uint(duration),
      Cl.bool(true)
    ], wallet_1);
    const vaultId = 1;

    // 2. Record initial balance
    const balanceBefore = simnet.getAssetsMap().get("STX")?.get(wallet_1) || 0n;

    // 3. Deposit STX
    const depositResult = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(vaultId),
      Cl.uint(amount)
    ], wallet_1);
    expect(depositResult.result).toBeOk(Cl.bool(true));

    // 4. Verify yield position exists and stats reflect deposit
    const statsResult = simnet.callReadOnlyFn("yield-router", "get-router-stats", [], wallet_1);
    expect(statsResult.result).toBeTuple({
      "total-shares": Cl.uint(amount),
      "total-assets": Cl.uint(amount),
      "is-paused": Cl.bool(false)
    });

    // 5. Mine 1000 blocks to mature the vault and accrue yield
    simnet.mineEmptyBlocks(duration + 5);

    // 6. Verify yield was accrued in get-yield-balance and get-router-stats
    // Expected yield at block 1005 (read-only) = (1,000,000 * 1005 * 8) / 5,256,000 = 1529
    // Expected total assets = 1,001,529
    const balanceResult = simnet.callReadOnlyFn("yield-router", "get-yield-balance", [
      Cl.uint(vaultId),
      Cl.principal(wallet_1)
    ], wallet_1);
    expect(balanceResult.result).toBeOk(Cl.uint(1001529));

    const statsAfter = simnet.callReadOnlyFn("yield-router", "get-router-stats", [], wallet_1);
    expect(statsAfter.result).toBeTuple({
      "total-shares": Cl.uint(amount),
      "total-assets": Cl.uint(1001529),
      "is-paused": Cl.bool(false)
    });

    // 7. Withdraw and verify that STX returned is principal + yield
    // Since withdraw is a transaction, it is executed in block 1006.
    // Expected yield at block 1006 = (1,000,000 * 1006 * 8) / 5,256,000 = 1531
    const withdrawResult = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(vaultId)
    ], wallet_1);
    expect(withdrawResult.result).toBeOk(Cl.uint(1001531));

    const balanceAfter = simnet.getAssetsMap().get("STX")?.get(wallet_1) || 0n;
    // Net gain should be exactly 1531 micro-STX
    expect(balanceAfter - balanceBefore).toBe(1531n);
  });
});
