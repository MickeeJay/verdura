import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateVaultForm } from "../components/vaults/CreateVaultForm";
import { WalletContext } from "../contexts/WalletContext";
import { StacksNetwork, STACKS_TESTNET } from "@stacks/network";
import { openContractCall } from "@stacks/connect";
import { fetchSimulatedYield } from "../lib/contracts/yield-router";

// Mock @stacks/connect
jest.mock("@stacks/connect", () => {
  const actual = jest.requireActual("@stacks/connect");
  return {
    ...actual,
    openContractCall: jest.fn(),
  };
});

// Mock yield-router contract utility
jest.mock("../lib/contracts/yield-router", () => ({
  fetchSimulatedYield: jest.fn(),
}));

describe("CreateVaultForm", () => {
  const mockStacksNetwork = STACKS_TESTNET;
  const mockContextValue = {
    address: "ST3924151251261313626246",
    isConnected: true,
    network: "testnet" as const,
    connect: jest.fn(),
    disconnect: jest.fn(),
    stacksNetwork: mockStacksNetwork,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    expect(screen.getByRole("heading", { name: /create savings vault/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/vault name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /earn btc yield/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create vault/i })).toBeInTheDocument();
  });

  it("shows validation error for empty vault name on submit", async () => {
    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    fireEvent.click(screen.getByRole("button", { name: /create vault/i }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Vault name is required");
  });

  it("shows yield preview input and details when yield toggle is turned on", async () => {
    (fetchSimulatedYield as jest.Mock).mockResolvedValue(12345);

    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    // Turn on yield switch
    const yieldSwitch = screen.getByRole("switch", { name: /earn btc yield/i });
    fireEvent.click(yieldSwitch);

    // Yield preview should be rendered
    expect(screen.getByLabelText(/simulated deposit/i)).toBeInTheDocument();

    // It should perform simulation and show calculated yield
    await waitFor(() => {
      expect(screen.getByTestId("yield-preview")).toHaveTextContent("~12,345 µSTX");
    });
  });

  it("submits the form successfully and triggers openContractCall", async () => {
    (openContractCall as jest.Mock).mockImplementation(({ onFinish }) => {
      onFinish({ txId: "0x1234567890abcdef" });
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/vault name/i), {
      target: { value: "My Savings Vault" },
    });

    // Submit
    fireEvent.click(screen.getByRole("button", { name: /create vault/i }));

    await waitFor(() => {
      expect(openContractCall).toHaveBeenCalled();
    });

    // Check successful state UI
    expect(await screen.findByText(/vault created successfully!/i)).toBeInTheDocument();
    expect(screen.getByText(/view transaction: 0x1234567890abcdef/i)).toBeInTheDocument();
  });

  it("handles user canceling the contract call", async () => {
    (openContractCall as jest.Mock).mockImplementation(({ onCancel }) => {
      onCancel();
      return Promise.resolve();
    });

    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/vault name/i), {
      target: { value: "My Savings Vault" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create vault/i }));

    await waitFor(() => {
      expect(openContractCall).toHaveBeenCalled();
    });

    // Transaction state should revert to idle/initial (Create Vault button should be active and no success/error message shown)
    expect(screen.getByRole("button", { name: /create vault/i })).toBeEnabled();
    expect(screen.queryByText(/vault created successfully/i)).not.toBeInTheDocument();
  });

  it("displays transaction error on contract call failure", async () => {
    (openContractCall as jest.Mock).mockRejectedValue(new Error("User rejected transaction"));

    render(
      <WalletContext.Provider value={mockContextValue}>
        <CreateVaultForm />
      </WalletContext.Provider>
    );

    fireEvent.change(screen.getByLabelText(/vault name/i), {
      target: { value: "My Savings Vault" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create vault/i }));

    await waitFor(() => {
      expect(openContractCall).toHaveBeenCalled();
    });

    // Check error message is displayed
    expect(await screen.findByRole("alert")).toHaveTextContent("User rejected transaction");
  });
});
