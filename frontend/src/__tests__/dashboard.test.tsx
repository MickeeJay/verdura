import React from "react";
import { render, screen } from "@testing-library/react";
import { VaultCard } from "../components/vaults/VaultCard";
import DashboardPage from "../app/(app)/dashboard/page";
import { useWallet } from "../hooks/useWallet";
import { useVaults } from "../hooks/useVaults";
import { useProfile } from "../hooks/useProfile";
import { useCurrentBlock } from "../hooks/useCurrentBlock";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the custom hooks
jest.mock("../hooks/useWallet", () => ({
  useWallet: jest.fn(),
}));

jest.mock("../hooks/useVaults", () => ({
  useVaults: jest.fn(),
}));

jest.mock("../hooks/useProfile", () => ({
  useProfile: jest.fn(),
}));

jest.mock("../hooks/useCurrentBlock", () => ({
  useCurrentBlock: jest.fn(),
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

describe("VaultCard Component", () => {
  const mockVault = {
    id: 1,
    owner: "ST3924151251261313626246",
    name: "Locked Vault",
    principalAmount: 500000000n, // 500 USDCx
    startBlock: 100n,
    endBlock: 200n,
    isActive: true,
    yieldEnabled: true,
    yieldShares: 100n,
  };

  it("renders correct status badge for locked vault", () => {
    // Current block is 150 (locked, since endBlock is 200)
    render(<VaultCard vault={mockVault} currentBlock={150} />);

    expect(screen.getByText("Locked").className).toContain("vault-badge--locked");
    expect(screen.getByTestId("vault-principal")).toHaveTextContent("500.000000 USDCx");

    // 50 blocks remaining = 500 minutes = 8 hours
    expect(screen.getByTestId("vault-countdown")).toHaveTextContent("8 hours");
  });

  it("renders 'Ready to withdraw' for matured vault", () => {
    // Current block is 250 (matured, since endBlock is 200)
    render(<VaultCard vault={mockVault} currentBlock={250} />);

    expect(screen.getByTestId("vault-status-badge")).toHaveTextContent("Matured");
    expect(screen.getByTestId("vault-countdown")).toHaveTextContent("Ready to withdraw");
  });

  it("renders 'Completed' for inactive vault", () => {
    const completedVault = {
      ...mockVault,
      isActive: false,
    };
    render(<VaultCard vault={completedVault} currentBlock={250} />);

    expect(screen.getByTestId("vault-status-badge")).toHaveTextContent("Completed");
    expect(screen.getByTestId("vault-countdown")).toHaveTextContent("Completed");
  });
});

describe("DashboardPage Empty State", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders empty state when no vaults", () => {
    // Mock user being logged in
    (useWallet as jest.Mock).mockReturnValue({
      address: "ST3924151251261313626246",
      isConnected: true,
      network: "testnet",
      connect: jest.fn(),
      disconnect: jest.fn(),
      stacksNetwork: {},
    });

    // Mock zero vaults
    (useVaults as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isRefetching: false,
      error: null,
    });

    // Mock empty profile
    (useProfile as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    // Mock block height
    (useCurrentBlock as jest.Mock).mockReturnValue({
      data: 100,
      isLoading: false,
      error: null,
    });

    renderWithQueryClient(<DashboardPage />);

    // Assert that statistics show zeros
    expect(screen.getByTestId("stat-total-saved")).toHaveTextContent("0.000000 USDCx");
    expect(screen.getByTestId("stat-total-yield")).toHaveTextContent("0.000000 STX");
    expect(screen.getByTestId("stat-vaults-count")).toHaveTextContent("0");

    // Assert empty state elements
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Vaults Found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "You haven't created any savings vaults yet. Start locking your tokens to earn Stacks Bitcoin yield!"
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create Your First Vault" })).toBeInTheDocument();
  });
});
