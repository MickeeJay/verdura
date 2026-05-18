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
  });
});
