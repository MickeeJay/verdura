import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WithdrawButton } from "../components/vaults/WithdrawButton";
import { DepositForm } from "../components/vaults/DepositForm";
import { WalletContext } from "../contexts/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { openContractCall } from "@stacks/connect";
import { STACKS_TESTNET } from "@stacks/network";

// Mock @stacks/connect
jest.mock("@stacks/connect", () => {
  const actual = jest.requireActual("@stacks/connect");
  return {
    ...actual,
    openContractCall: jest.fn(),
  };
});

// Helper wrapper for react-query provider
const renderWithProviders = (ui: React.ReactElement, contextValue: any) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <WalletContext.Provider value={contextValue}>
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
        />,
        mockContextValue
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
        />,
        mockContextValue
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
        />,
        mockContextValue
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
      renderWithProviders(<DepositForm vaultId={1} />, mockContextValue);

      // Fill in negative amount
      const input = await screen.findByLabelText(/amount/i);
      fireEvent.change(input, { target: { value: "-5" } });

      const submitBtn = screen.getByRole("button", { name: /deposit savings/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByRole("alert")).toHaveTextContent("Amount must be a positive number");
    });

    it("validates that amount cannot exceed available wallet balance", async () => {
      renderWithProviders(<DepositForm vaultId={1} />, mockContextValue);

      // Fill in exceeding amount (150 STX when max balance is 100 STX)
      const input = await screen.findByLabelText(/amount/i);
      fireEvent.change(input, { target: { value: "150" } });

      const submitBtn = screen.getByRole("button", { name: /deposit savings/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByRole("alert")).toHaveTextContent("Amount exceeds available wallet balance");
    });
  });
});
