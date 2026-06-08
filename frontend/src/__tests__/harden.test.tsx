import React from "react";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "../components/errors/ErrorBoundary";
import { ContractError, getContractErrorMessage } from "../components/errors/ContractError";
import { NetworkStatusBanner } from "../components/NetworkStatusBanner";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import AppLayout from "../app/(app)/layout";
import { useWallet } from "../hooks/useWallet";
import { useRouter } from "next/navigation";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock useWallet
jest.mock("../hooks/useWallet", () => ({
  useWallet: jest.fn(),
}));

// Mock useNetworkStatus
jest.mock("../hooks/useNetworkStatus", () => ({
  useNetworkStatus: jest.fn(),
}));

const ProblematicComponent = () => {
  throw new Error("Test render crash");
};

describe("Frontend Hardening Tests", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useNetworkStatus as jest.Mock).mockReturnValue({
      isOnline: true,
      isChecking: false,
    });
  });

  describe("ErrorBoundary component", () => {
    it("renders error card on crash", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Test render crash")).toBeInTheDocument();

      spy.mockRestore();
    });
  });

  describe("ContractError component and mapper", () => {
    it("maps known Clarity error codes to human-readable messages", () => {
      expect(getContractErrorMessage(100)).toBe("Unauthorized");
      expect(getContractErrorMessage("u102")).toBe("Vault is still locked");
      expect(getContractErrorMessage(203)).toBe("Yield router is temporarily paused");

      render(<ContractError code="u102" />);
      expect(screen.getByTestId("contract-error-card")).toBeInTheDocument();
      expect(screen.getByText("Vault is still locked")).toBeInTheDocument();
    });
  });

  describe("NetworkStatusBanner component", () => {
    it("shows banner on offline state", () => {
      (useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: false,
        isChecking: false,
      });

      render(<NetworkStatusBanner />);
      expect(screen.getByTestId("network-status-banner")).toBeInTheDocument();
      expect(screen.getByText(/Hiro API is currently unreachable/)).toBeInTheDocument();
    });

    it("does not show banner on online state", () => {
      (useNetworkStatus as jest.Mock).mockReturnValue({
        isOnline: true,
        isChecking: false,
      });

      const { container } = render(<NetworkStatusBanner />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("AppLayout Redirect Guard", () => {
    it("redirects to home/marketing page if not connected", () => {
      (useWallet as jest.Mock).mockReturnValue({
        isConnected: false,
        connect: jest.fn(),
        disconnect: jest.fn(),
      });

      render(
        <AppLayout>
          <div data-testid="child-content">Protected Content</div>
        </AppLayout>
      );

      expect(mockPush).toHaveBeenCalledWith("/");
      expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
    });

    it("renders child contents if wallet is connected", () => {
      (useWallet as jest.Mock).mockReturnValue({
        isConnected: true,
        connect: jest.fn(),
        disconnect: jest.fn(),
      });

      render(
        <AppLayout>
          <div data-testid="child-content">Protected Content</div>
        </AppLayout>
      );

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
    });
  });
});
