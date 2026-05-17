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

  it("should fail create-vault with empty name", () => {
    const result = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii(""),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);
    expect(result.result).toBeErr(Cl.uint(106)); // err-invalid-amount for empty name
  });

  it("should fail create-vault with duration too long", () => {
    const result = simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("My Vault"),
      Cl.uint(60000), // > 52560
      Cl.bool(true)
    ], wallet_1);
    expect(result.result).toBeErr(Cl.uint(107)); // err-invalid-duration
  });

  it("should fail deposit to non-existent vault", () => {
    const result = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(999), // non-existent vault-id
      Cl.uint(1000)
    ], wallet_1);
    expect(result.result).toBeErr(Cl.uint(102)); // err-not-found
  });

  it("should fail deposit of zero amount", () => {
    // Create a vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault Zero"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);

    const result = simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(0)
    ], wallet_1);
    expect(result.result).toBeErr(Cl.uint(106)); // err-invalid-amount
  });

  it("should fail withdrawal before maturity", () => {
    // Create a vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 1"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);
    
    // Deposit
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(100)
    ], wallet_1);

    // Attempt withdrawal before 144 blocks
    const withdrawResult = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);
    
    expect(withdrawResult.result).toBeErr(Cl.uint(103)); // err-vault-locked
  });

  it("should succeed withdrawal at exact maturity block", () => {
    // Create a vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Vault 2"),
      Cl.uint(144),
      Cl.bool(true)
    ], wallet_1);
    
    // Deposit
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(100)
    ], wallet_1);

    // Advance block-height by 144
    simnet.mineEmptyBlocks(144);

    // Attempt withdrawal
    const withdrawResult = simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);
    
    expect(withdrawResult.result).toBeOk(Cl.uint(100)); // returns amount
  });

  it("should complete full vault lifecycle and verify final balance", () => {
    const amount = 500;
    
    // 1. Create Vault
    simnet.callPublicFn("savings-vault", "create-vault", [
      Cl.stringAscii("Lifecycle Vault"),
      Cl.uint(500),
      Cl.bool(true)
    ], wallet_1);

    // 2. Deposit
    simnet.callPublicFn("savings-vault", "deposit", [
      Cl.uint(1),
      Cl.uint(amount)
    ], wallet_1);

    // Get balances before withdrawal
    const address = simnet.getAccounts().get("wallet_1")!;
    const balanceBefore = simnet.getAssetsMap().get("STX")?.get(address) ?? 0n;

    // 3. Advance Chain by duration blocks
    simnet.mineEmptyBlocks(500);

    // 4. Withdraw
    simnet.callPublicFn("savings-vault", "withdraw", [
      Cl.uint(1)
    ], wallet_1);

    // 5. Verify final balance (should have increased by `amount`)
    const balanceAfter = simnet.getAssetsMap().get("STX")?.get(address) ?? 0n;
    expect(balanceAfter - balanceBefore).toBe(BigInt(amount));

    // Verify vault is marked inactive
    const vault = simnet.callReadOnlyFn("savings-vault", "get-vault", [
      Cl.principal(wallet_1),
      Cl.uint(1)
    ], wallet_1);
    
    expect(vault.result).toBeSome(Cl.tuple({
      "name": Cl.stringAscii("Lifecycle Vault"),
      "principal-amount": Cl.uint(500),
      "start-block": Cl.uint(2), 
      "end-block": Cl.uint(502),
      "is-active": Cl.bool(false),
      "yield-enabled": Cl.bool(true),
      "yield-shares": Cl.uint(0)
    }));
  });
});
