import React from "react";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import DashboardPage from "../app/(app)/dashboard/page";
import { CreateVaultForm } from "../components/vaults/CreateVaultForm";
import ProfilePage from "../app/(app)/profile/page";

import { useWallet } from "../hooks/useWallet";
import { useVaults } from "../hooks/useVaults";
import { useProfile, useLeaderboardScore, useSavingsStreak } from "../hooks/useProfile";
import { useCurrentBlock } from "../hooks/useCurrentBlock";

expect.extend(toHaveNoViolations);

// Mock the custom hooks
jest.mock("../hooks/useWallet", () => ({
  useWallet: jest.fn(),
}));

jest.mock("../hooks/useVaults", () => ({
  useVaults: jest.fn(),
}));

jest.mock("../hooks/useProfile", () => ({
  useProfile: jest.fn(),
  useLeaderboardScore: jest.fn(),
  useSavingsStreak: jest.fn(),
}));

jest.mock("../hooks/useCurrentBlock", () => ({
  useCurrentBlock: jest.fn(),
}));

jest.mock("../hooks/useTx", () => ({
  useTx: () => ({
    transactions: [],
    pendingCount: 0,
    addPendingTx: jest.fn(),
    clearResolved: jest.fn(),
  }),
}));

jest.mock("../hooks/useVaultTxHistory", () => ({
  useVaultTxHistory: () => ({
    data: { transactions: [] },
    isLoading: false,
    isError: false,
    error: null,
    loadMore: jest.fn(),
    hasMore: false,
  }),
}));

// Helper to wrap components with QueryClientProvider
const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};

describe("Accessibility (a11y) Tests", () => {
  beforeEach(() => {
    (useWallet as jest.Mock).mockReturnValue({
      address: "ST3924151251261313626246",
      isConnected: true,
      network: "testnet",
      connect: jest.fn(),
      disconnect: jest.fn(),
      stacksNetwork: {},
    });
    (useVaults as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          owner: "ST3924151251261313626246",
          name: "Locked Vault",
          principalAmount: 500000000n,
          startBlock: 100n,
          endBlock: 200n,
          isActive: true,
          yieldEnabled: true,
          yieldShares: 100n,
        },
      ],
      isLoading: false,
      isRefetching: false,
      error: null,
    });
    (useProfile as jest.Mock).mockReturnValue({
      data: {
        totalSaved: 500000000n,
        totalYieldEarned: 100000n,
        totalVaultsCompleted: 2n,
        memberSince: 50n,
      },
      isLoading: false,
      isRefetching: false,
      error: null,
    });
    (useLeaderboardScore as jest.Mock).mockReturnValue({
      data: 250n,
      isLoading: false,
      error: null,
    });
    (useSavingsStreak as jest.Mock).mockReturnValue({
      data: 3n,
      isLoading: false,
      error: null,
    });
    (useCurrentBlock as jest.Mock).mockReturnValue({
      data: 150,
      isLoading: false,
      error: null,
    });
  });

  it("should have no accessibility violations on DashboardPage", async () => {
    const { container } = renderWithQueryClient(<DashboardPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations on CreateVaultForm", async () => {
    const { container } = renderWithQueryClient(<CreateVaultForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should have no accessibility violations on ProfilePage", async () => {
    const { container } = renderWithQueryClient(<ProfilePage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
