import {
  someCV,
  tupleCV,
  stringAsciiCV,
  uintCV,
  boolCV,
  noneCV,
  responseOkCV,
  responseErrorCV,
  trueCV,
  falseCV
} from "@stacks/transactions";
import { parseVault, fetchAllVaultsForOwner, fetchIsVaultMature, VaultData } from "../lib/contracts/savings-vault";
import { parseProfile, fetchProfile } from "../lib/contracts/savings-profile";
import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from "@stacks/network";
import { getContractAddresses, CONTRACT_ADDRESSES } from "../lib/constants";
import { fetchYieldBalance, fetchSimulatedYield } from "../lib/contracts/yield-router";

// Mock the fetchCallReadOnlyFunction from @stacks/transactions to prevent actual network calls
jest.mock("@stacks/transactions", () => {
  const actual = jest.requireActual("@stacks/transactions");
  return {
    ...actual,
    fetchCallReadOnlyFunction: jest.fn(),
  };
});

import { fetchCallReadOnlyFunction } from "@stacks/transactions";
const mockFetchReadOnly = fetchCallReadOnlyFunction as jest.MockedFunction<typeof fetchCallReadOnlyFunction>;

describe("VaultData Parsing", () => {
  it("correctly parses a valid some tuple to VaultData", () => {
    const mockTuple = tupleCV({
      name: stringAsciiCV("My Vault"),
      "principal-amount": uintCV(5000),
      "start-block": uintCV(100),
      "end-block": uintCV(1000),
      "is-active": boolCV(true),
      "yield-enabled": boolCV(true),
      "yield-shares": uintCV(50),
    });
    const mockSome = someCV(mockTuple);

    const result = parseVault(mockSome, 1, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(result).toEqual({
      id: 1,
      owner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      name: "My Vault",
      principalAmount: 5000n,
      startBlock: 100n,
      endBlock: 1000n,
      isActive: true,
      yieldEnabled: true,
      yieldShares: 50n,
    });
  });

  it("returns null for none response", () => {
    const result = parseVault(noneCV(), 1, "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM");
    expect(result).toBeNull();
  });
});

describe("ProfileData Parsing", () => {
  it("correctly parses a valid some tuple to ProfileData", () => {
    const mockTuple = tupleCV({
      "total-vaults-completed": uintCV(5),
      "total-saved": uintCV(25000),
      "total-yield-earned": uintCV(450),
      "member-since": uintCV(100),
      "last-vault-block": uintCV(500),
    });
    const mockSome = someCV(mockTuple);

    const result = parseProfile(mockSome);
    expect(result).toEqual({
      totalVaultsCompleted: 5n,
      totalSaved: 25000n,
      totalYieldEarned: 450n,
      memberSince: 100n,
      lastVaultBlock: 500n,
    });
  });

  it("returns null for none response", () => {
    const result = parseProfile(noneCV());
    expect(result).toBeNull();
  });
});

describe("getContractAddresses", () => {
  it("resolves mainnet contract addresses correctly", () => {
    const result = getContractAddresses(STACKS_MAINNET);
    expect(result).toEqual(CONTRACT_ADDRESSES.mainnet);
  });

  it("resolves testnet contract addresses correctly", () => {
    const result = getContractAddresses(STACKS_TESTNET);
    expect(result).toEqual(CONTRACT_ADDRESSES.testnet);
  });

  it("resolves devnet contract addresses correctly", () => {
    const result = getContractAddresses(STACKS_DEVNET);
    expect(result).toEqual(CONTRACT_ADDRESSES.devnet);
  });
});

describe("fetchAllVaultsForOwner", () => {
  beforeEach(() => {
    mockFetchReadOnly.mockReset();
  });

  it("filters out null results and returns only valid vaults", async () => {
    const validVaultTuple = tupleCV({
      name: stringAsciiCV("Vault A"),
      "principal-amount": uintCV(1000),
      "start-block": uintCV(10),
      "end-block": uintCV(500),
      "is-active": boolCV(true),
      "yield-enabled": boolCV(false),
      "yield-shares": uintCV(0),
    });

    // Return a valid vault for IDs 1 and 3, none for all others
    mockFetchReadOnly.mockImplementation(async (opts) => {
      const args = (opts as { functionArgs: { value: bigint }[] }).functionArgs;
      const vaultIdArg = args[1];
      const id = Number(vaultIdArg.value);
      if (id === 1 || id === 3) {
        return someCV(validVaultTuple);
      }
      return noneCV();
    });

    const result = await fetchAllVaultsForOwner(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(1);
    expect(result[0].name).toBe("Vault A");
    expect(result[1].id).toBe(3);
  });

  it("returns empty array when no vaults exist", async () => {
    mockFetchReadOnly.mockResolvedValue(noneCV());

    const result = await fetchAllVaultsForOwner(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toEqual([]);
    expect(mockFetchReadOnly).toHaveBeenCalledTimes(50);
  });
});

describe("fetchIsVaultMature", () => {
  beforeEach(() => {
    mockFetchReadOnly.mockReset();
  });

  it("returns true when contract responds with (ok true)", async () => {
    mockFetchReadOnly.mockResolvedValue(responseOkCV(trueCV()));

    const result = await fetchIsVaultMature(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      1,
      STACKS_TESTNET
    );

    expect(result).toBe(true);
  });

  it("returns false when contract responds with (ok false)", async () => {
    mockFetchReadOnly.mockResolvedValue(responseOkCV(falseCV()));

    const result = await fetchIsVaultMature(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      1,
      STACKS_TESTNET
    );

    expect(result).toBe(false);
  });

  it("returns false when contract responds with an error", async () => {
    mockFetchReadOnly.mockResolvedValue(responseErrorCV(uintCV(102)));

    const result = await fetchIsVaultMature(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      99,
      STACKS_TESTNET
    );

    expect(result).toBe(false);
  });
});

describe("fetchProfile", () => {
  beforeEach(() => {
    mockFetchReadOnly.mockReset();
  });

  it("returns ProfileData when profile exists", async () => {
    const profileTuple = tupleCV({
      "total-vaults-completed": uintCV(3),
      "total-saved": uintCV(15000),
      "total-yield-earned": uintCV(200),
      "member-since": uintCV(50),
      "last-vault-block": uintCV(400),
    });
    mockFetchReadOnly.mockResolvedValue(someCV(profileTuple));

    const result = await fetchProfile(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toEqual({
      totalVaultsCompleted: 3n,
      totalSaved: 15000n,
      totalYieldEarned: 200n,
      memberSince: 50n,
      lastVaultBlock: 400n,
    });
  });

  it("returns null when profile does not exist", async () => {
    mockFetchReadOnly.mockResolvedValue(noneCV());

    const result = await fetchProfile(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toBeNull();
  });
});

describe("fetchYieldBalance", () => {
  beforeEach(() => {
    mockFetchReadOnly.mockReset();
  });

  it("returns numeric balance from (ok uint) response", async () => {
    mockFetchReadOnly.mockResolvedValue(responseOkCV(uintCV(12500)));

    const result = await fetchYieldBalance(
      1,
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toBe(12500);
  });

  it("returns 0 for (ok u0) response", async () => {
    mockFetchReadOnly.mockResolvedValue(responseOkCV(uintCV(0)));

    const result = await fetchYieldBalance(
      1,
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toBe(0);
  });

  it("returns 0 when fetch throws an error", async () => {
    mockFetchReadOnly.mockRejectedValue(new Error("Network error"));

    const result = await fetchYieldBalance(
      1,
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
      STACKS_TESTNET
    );

    expect(result).toBe(0);
  });
});

describe("fetchSimulatedYield", () => {
  beforeEach(() => {
    mockFetchReadOnly.mockReset();
  });

  it("returns numeric simulated yield from uint response", async () => {
    mockFetchReadOnly.mockResolvedValue(uintCV(320));

    const result = await fetchSimulatedYield(
      1000,
      100,
      STACKS_TESTNET
    );

    expect(result).toBe(320);
  });

  it("returns 0 when simulated yield call throws", async () => {
    mockFetchReadOnly.mockRejectedValue(new Error("Network error"));

    const result = await fetchSimulatedYield(
      1000,
      100,
      STACKS_TESTNET
    );

    expect(result).toBe(0);
  });
});

