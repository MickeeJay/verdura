import React from "react";
import { render } from "@testing-library/react";
import { useWallet } from "../hooks/useWallet";

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
