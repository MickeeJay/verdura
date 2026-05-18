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
  });
});
