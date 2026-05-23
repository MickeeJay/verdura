import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WithdrawButton } from "../components/vaults/WithdrawButton";
import { DepositForm } from "../components/vaults/DepositForm";
import { TxHistoryList } from "../components/txs/TxHistoryList";
import VaultDetailPage from "../app/(app)/vaults/[vaultId]/page";
import { WalletContext } from "../contexts/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { openContractCall } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";
import { useWallet } from "../hooks/useWallet";
import { useCurrentBlock } from "../hooks/useCurrentBlock";
import { useVaultTxHistory } from "../hooks/useVaultTxHistory";
import { fetchVault, fetchIsVaultMature } from "../lib/contracts/savings-vault";

// Mock @stacks/connect
jest.mock("@stacks/connect", () => {
  const actual = jest.requireActual("@stacks/connect");
  return {
    ...actual,
    openContractCall: jest.fn(),
  };
});

// Mock hooks
jest.mock("../hooks/useWallet", () => ({
  useWallet: jest.fn(),
}));

jest.mock("../hooks/useCurrentBlock", () => ({
  useCurrentBlock: jest.fn(),
}));

jest.mock("../hooks/useVaultTxHistory", () => ({
  useVaultTxHistory: jest.fn(),
}));

jest.mock("../lib/contracts/savings-vault", () => {
  const actual = jest.requireActual("../lib/contracts/savings-vault");
  return {
    ...actual,
    fetchVault: jest.fn(),
    fetchIsVaultMature: jest.fn(),
  };
});

// Helper wrapper for react-query provider
const renderWithProviders = (ui: React.ReactElement, contextValue?: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const ctx = contextValue || {
    address: "ST3924151251261313626246",
    isConnected: true,
    network: "testnet" as const,
    connect: jest.fn(),
    disconnect: jest.fn(),
    stacksNetwork: STACKS_TESTNET,
  };

  return render(
    <WalletContext.Provider value={ctx}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </WalletContext.Provider>
  );
};

describe("Vault Detail Page Components", () => {
  const mockContextValue = {
    address: "ST3924151251261313626246",
    isConnected: true,
    network: "testnet" as const,
    connect: jest.fn(),
    disconnect: jest.fn(),
    stacksNetwork: STACKS_TESTNET,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock setups
    (useWallet as jest.Mock).mockReturnValue(mockContextValue);
    (useCurrentBlock as jest.Mock).mockReturnValue({ data: 100 });
    (useVaultTxHistory as jest.Mock).mockReturnValue({
      data: { transactions: [], total: 0, hasMore: false },
      isLoading: false,
      loadMore: jest.fn(),
      hasMore: false,
    });
  });

  describe("WithdrawButton State", () => {
    it("renders disabled with tooltip when locked (not mature)", () => {
      renderWithProviders(
        <WithdrawButton
          vaultId={1}
          isVaultMature={false}
          isActive={true}
          currentBlock={150}
          endBlock={200}
        />
      );

      // Verify that the disabled withdraw button is rendered
      const btn = screen.getByTestId("withdraw-button-disabled");
      expect(btn).toBeInTheDocument();
      expect(btn).toBeDisabled();

      // Verify tooltip text shows remaining blocks/time
      const tooltip = screen.getByTestId("withdraw-tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Vault matures in 8 hours");
    });

    it("renders enabled when mature", () => {
      renderWithProviders(
        <WithdrawButton
          vaultId={1}
          isVaultMature={true}
          isActive={true}
          currentBlock={250}
          endBlock={200}
        />
      );

      // Verify that the active withdraw button is rendered
      const btn = screen.getByTestId("withdraw-button-enabled");
      expect(btn).toBeInTheDocument();
      expect(btn).toBeEnabled();
    });

    it("triggers openContractCall when clicked while mature", async () => {
      (openContractCall as jest.Mock).mockImplementation(({ onFinish }) => {
        onFinish({ txId: "0xwithdrawtxid123" });
        return Promise.resolve();
      });

      renderWithProviders(
        <WithdrawButton
          vaultId={1}
          isVaultMature={true}
          isActive={true}
          currentBlock={250}
          endBlock={200}
        />
      );

      const btn = screen.getByTestId("withdraw-button-enabled");
      fireEvent.click(btn);

      await waitFor(() => {
        expect(openContractCall).toHaveBeenCalled();
      });
    });
  });

  describe("DepositForm Validation", () => {
    // Mock the global fetch to return balances response
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            stx: {
              balance: "100000000", // 100 STX
            },
          }),
      } as Response);
    });

    it("validates that amount must be positive", async () => {
      renderWithProviders(<DepositForm vaultId={1} />);

      // Fill in negative amount
      const input = await screen.findByLabelText(/amount/i);
      fireEvent.change(input, { target: { value: "-5" } });

      const submitBtn = screen.getByRole("button", { name: /deposit savings/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByRole("alert")).toHaveTextContent("Amount must be a positive number");
    });

    it("validates that amount cannot exceed available wallet balance", async () => {
      renderWithProviders(<DepositForm vaultId={1} />);

      // Fill in exceeding amount (150 STX when max balance is 100 STX)
      const input = await screen.findByLabelText(/amount/i);
      fireEvent.change(input, { target: { value: "150" } });

      const submitBtn = screen.getByRole("button", { name: /deposit savings/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByRole("alert")).toHaveTextContent("Amount exceeds available wallet balance");
    });

    it("validates that non-numeric amount displays an error", async () => {
      renderWithProviders(<DepositForm vaultId={1} />);

      const input = await screen.findByLabelText(/amount/i);
      fireEvent.change(input, { target: { value: "abc" } });

      const submitBtn = screen.getByRole("button", { name: /deposit savings/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByRole("alert")).toHaveTextContent("Amount must be a positive number");
    });
  });

  describe("Vault Progress Bar and Details", () => {
    const mockVaultData = {
      id: 1,
      owner: "ST3924151251261313626246",
      name: "Commitment Nest Egg",
      principalAmount: 100000000n, // 100 USDCx
      startBlock: 100n,
      endBlock: 200n,
      isActive: true,
      yieldEnabled: true,
      yieldShares: 100n,
    };

    it("renders 0% progress correctly at start block", async () => {
      (fetchVault as jest.Mock).mockResolvedValue(mockVaultData);
      (fetchIsVaultMature as jest.Mock).mockResolvedValue(false);
      (useCurrentBlock as jest.Mock).mockReturnValue({ data: 100 });

      renderWithProviders(<VaultDetailPage params={{ vaultId: "1" }} />);

      const progressBar = await screen.findByTestId("vault-progress-bar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "0");
      expect(progressBar.style.width).toBe("0%");
    });

    it("renders 50% progress correctly at mid point", async () => {
      (fetchVault as jest.Mock).mockResolvedValue(mockVaultData);
      (fetchIsVaultMature as jest.Mock).mockResolvedValue(false);
      (useCurrentBlock as jest.Mock).mockReturnValue({ data: 150 });

      renderWithProviders(<VaultDetailPage params={{ vaultId: "1" }} />);

      const progressBar = await screen.findByTestId("vault-progress-bar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "50");
      expect(progressBar.style.width).toBe("50%");
    });

    it("renders and clamps at 100% progress when block height exceeds endBlock", async () => {
      (fetchVault as jest.Mock).mockResolvedValue(mockVaultData);
      (fetchIsVaultMature as jest.Mock).mockResolvedValue(true);
      (useCurrentBlock as jest.Mock).mockReturnValue({ data: 250 }); // well past endBlock 200

      renderWithProviders(<VaultDetailPage params={{ vaultId: "1" }} />);

      const progressBar = await screen.findByTestId("vault-progress-bar");
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute("aria-valuenow", "100");
      expect(progressBar.style.width).toBe("100%");
    });
  });

  describe("TxHistoryList Component", () => {
    it("renders empty state message when no transactions", () => {
      render(
        <TxHistoryList
          transactions={[]}
          isLoading={false}
          hasMore={false}
          onLoadMore={jest.fn()}
        />
      );

      expect(screen.getByTestId("tx-history-empty")).toBeInTheDocument();
      expect(
        screen.getByText("No transaction history found for this vault.")
      ).toBeInTheDocument();
    });

    it("renders list items when transactions are provided", () => {
      const mockTxs = [
        {
          txId: "0xtxid123",
          type: "Deposit" as const,
          amount: 50000000n, // 50 STX
          timestamp: 1716480000,
          blockHeight: 12345,
          status: "success" as const,
        },
      ];

      render(
        <TxHistoryList
          transactions={mockTxs}
          isLoading={false}
          hasMore={false}
          onLoadMore={jest.fn()}
        />
      );

      expect(screen.getByText("Deposit")).toBeInTheDocument();
      expect(screen.getByText("+50.000000 STX")).toBeInTheDocument();
      expect(screen.getByText("#12345")).toBeInTheDocument();
    });
  });
});
