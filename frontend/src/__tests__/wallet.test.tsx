import React from "react";
import { render, screen } from "@testing-library/react";
import { useWallet } from "../hooks/useWallet";
import { WalletConnectButton } from "../components/wallet/WalletConnectButton";
import { WalletContext } from "../contexts/WalletContext";
import { StacksNetwork } from "@stacks/network";

// Test component to trigger the hook
function HookTestComponent() {
  useWallet();
  return null;
}

describe("useWallet Hook", () => {
  it("throws an error when used outside WalletProvider", () => {
    // Suppress console.error in tests for this block
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<HookTestComponent />)).toThrow(
      "useWallet must be used within a WalletProvider"
    );

    consoleError.mockRestore();
  });
});

describe("WalletConnectButton Component", () => {
  it("renders 'Connect Wallet' when disconnected", () => {
    const mockContextValue = {
      address: null,
      isConnected: false,
      network: "testnet" as const,
      connect: jest.fn(),
      disconnect: jest.fn(),
      stacksNetwork: {} as unknown as StacksNetwork,
    };

    render(
      <WalletContext.Provider value={mockContextValue}>
        <WalletConnectButton />
      </WalletContext.Provider>
    );

    expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
  });
});
