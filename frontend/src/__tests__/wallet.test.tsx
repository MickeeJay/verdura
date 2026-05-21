import React from "react";
import { render, screen } from "@testing-library/react";
import { useWallet } from "../hooks/useWallet";
import { WalletConnectButton } from "../components/wallet/WalletConnectButton";
import { truncateAddress } from "../lib/utils";
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

  it("renders truncated address when connected", () => {
    const mockContextValue = {
      address: "ST3924151251261313626246",
      isConnected: true,
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

    expect(screen.getByText("ST3924...6246")).toBeInTheDocument();
  });
});

describe("truncateAddress Utility Function", () => {
  it("correctly truncates standard Stacks addresses (first 6 and last 4)", () => {
    expect(truncateAddress("ST3924151251261313626246")).toBe("ST3924...6246");
    expect(truncateAddress("SP3924151251261313626246")).toBe("SP3924...6246");
  });

  it("returns empty string if address is empty or falsy", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("returns full address if length is short (less than or equal to 10)", () => {
    expect(truncateAddress("ST123")).toBe("ST123");
  });
});
