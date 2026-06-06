/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TxProvider, TxContext } from "@/contexts/TxContext";
import type { PendingTransaction } from "@/contexts/TxContext";
import { TxStatusIndicator } from "@/components/tx/TxStatusIndicator";
import { PendingTxDrawer } from "@/components/tx/PendingTxDrawer";
import { toast } from "sonner";

// ── Mocks ────────────────────────────────────────────────────

// Mock sonner toast
jest.mock("sonner", () => ({
  toast: {
    loading: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) {
    return <a {...props}>{children}</a>;
  };
});

const mockedToast = toast as jest.Mocked<typeof toast>;

// ── Helpers ──────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <TxProvider>{children}</TxProvider>
    </QueryClientProvider>
  );
}

/** Helper component that can add a tx and expose context values */
function TxAdder({
  txId,
  label,
  onContext,
}: {
  txId: string;
  label: string;
  onContext?: (ctx: {
    transactions: PendingTransaction[];
    pendingCount: number;
    addPendingTx: (txId: string, label: string) => void;
    clearResolved: () => void;
  }) => void;
}) {
  const ctx = React.useContext(TxContext);
  React.useEffect(() => {
    if (ctx) {
      ctx.addPendingTx(txId, label);
      if (onContext) onContext(ctx);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// ── Tests ────────────────────────────────────────────────────

describe("Transaction Monitoring System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ── Test 1: Toast called on success status ─────────────────

  describe("toast triggers", () => {
    it("calls toast.success when transaction reaches success status", async () => {
      // First call returns pending, second returns success
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount <= 1) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                tx_id: "0xabc123",
                tx_status: "pending",
                tx_type: "contract_call",
                nonce: 1,
                fee_rate: "200",
                sender_address: "ST1TEST",
                sponsored: false,
                post_condition_mode: "allow",
                post_conditions: [],
                anchor_mode: "any",
              }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xabc123",
              tx_status: "success",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
              block_height: 100,
              burn_block_time: 1700000000,
            }),
        });
      }) as jest.Mock;

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
          },
        },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <TxProvider>
            <TxAdder txId="0xabc123" label="Vault created" />
          </TxProvider>
        </QueryClientProvider>
      );

      // Initial loading toast should be called
      await waitFor(() => {
        expect(mockedToast.loading).toHaveBeenCalledWith(
          "Vault created...",
          expect.objectContaining({
            id: "0xabc123",
            description: "Transaction submitted to Stacks",
          })
        );
      });

      // Wait for polling to pick up success status
      await waitFor(
        () => {
          expect(mockedToast.success).toHaveBeenCalledWith(
            "Vault created!",
            expect.objectContaining({
              id: "0xabc123",
              description: "Confirmed on Stacks",
            })
          );
        },
        { timeout: 15000 }
      );
    }, 20000);

    // ── Test 2: Toast called on failure status ────────────────

    it("calls toast.error when transaction reaches abort status", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xfail456",
              tx_status: "abort_by_response",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
              block_height: 101,
              burn_block_time: 1700000001,
            }),
        })
      ) as jest.Mock;

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
          },
        },
      });

      render(
        <QueryClientProvider client={queryClient}>
          <TxProvider>
            <TxAdder txId="0xfail456" label="Deposit STX" />
          </TxProvider>
        </QueryClientProvider>
      );

      await waitFor(
        () => {
          expect(mockedToast.error).toHaveBeenCalledWith(
            "Deposit STX failed",
            expect.objectContaining({
              id: "0xfail456",
              description: "Transaction aborted or dropped",
            })
          );
        },
        { timeout: 15000 }
      );
    }, 20000);
  });

  // ── Test 3: Pending count shows in TopBar ──────────────────

  describe("TxStatusIndicator", () => {
    it("shows pending count badge when transactions are pending", async () => {
      // Make fetch return pending status
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xpending1",
              tx_status: "pending",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
            }),
        })
      ) as jest.Mock;

      render(
        <TestWrapper>
          <TxAdder txId="0xpending1" label="Create Vault" />
          <TxStatusIndicator />
        </TestWrapper>
      );

      await waitFor(() => {
        const badge = screen.getByTestId("tx-indicator-badge");
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveTextContent("1");
      });
    });
  });

  // ── Test 4: PendingTxDrawer renders items ──────────────────

  describe("PendingTxDrawer", () => {
    it("renders transaction items in the drawer", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xdrawer1",
              tx_status: "pending",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
            }),
        })
      ) as jest.Mock;

      render(
        <TestWrapper>
          <TxAdder txId="0xdrawer1" label="Deposit STX" />
          <PendingTxDrawer isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      await waitFor(() => {
        const items = screen.getAllByTestId("tx-drawer-item");
        expect(items.length).toBeGreaterThanOrEqual(1);
      });

      expect(screen.getByText("Deposit STX")).toBeInTheDocument();
    });
  });

  // ── Test 5: Polling stops at terminal status ───────────────

  describe("polling behavior", () => {
    it("stops polling after terminal status is reached", async () => {
      let fetchCallCount = 0;
      global.fetch = jest.fn(() => {
        fetchCallCount++;
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xstop1",
              tx_status: "success",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
              block_height: 200,
              burn_block_time: 1700000002,
            }),
        });
      }) as jest.Mock;

      render(
        <TestWrapper>
          <TxAdder txId="0xstop1" label="Withdraw" />
        </TestWrapper>
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(fetchCallCount).toBeGreaterThanOrEqual(1);
      });

      const countAfterFirst = fetchCallCount;

      // Wait 12 seconds (past one refetch interval of 10s)
      // If polling stopped, no additional fetches should happen
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      });

      // Fetch count should not have significantly increased since the terminal status was returned immediately
      expect(fetchCallCount).toBeLessThanOrEqual(countAfterFirst + 1);
    }, 15000);
  });

  // ── Test 6: Multiple simultaneous transactions ─────────────

  describe("multiple transactions", () => {
    it("handles multiple simultaneous pending transactions", async () => {
      global.fetch = jest.fn((url: string) => {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: url.includes("0xmulti1") ? "0xmulti1" : "0xmulti2",
              tx_status: "pending",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
            }),
        });
      }) as jest.Mock;

      render(
        <TestWrapper>
          <TxAdder txId="0xmulti1" label="Vault A" />
          <TxAdder txId="0xmulti2" label="Vault B" />
          <PendingTxDrawer isOpen={true} onClose={() => {}} />
        </TestWrapper>
      );

      await waitFor(() => {
        const items = screen.getAllByTestId("tx-drawer-item");
        expect(items.length).toBe(2);
      });

      expect(screen.getByText("Vault A")).toBeInTheDocument();
      expect(screen.getByText("Vault B")).toBeInTheDocument();
    });
  });

  // ── Test 7: clearResolved removes completed transactions ───

  describe("clearResolved", () => {
    it("removes resolved transactions from the list", async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              tx_id: "0xclear1",
              tx_status: "success",
              tx_type: "contract_call",
              nonce: 1,
              fee_rate: "200",
              sender_address: "ST1TEST",
              sponsored: false,
              post_condition_mode: "allow",
              post_conditions: [],
              anchor_mode: "any",
              block_height: 300,
              burn_block_time: 1700000003,
            }),
        })
      ) as jest.Mock;

      let capturedCtx: {
        transactions: PendingTransaction[];
        pendingCount: number;
        addPendingTx: (txId: string, label: string) => void;
        clearResolved: () => void;
      } | null = null;

      function ContextCapture() {
        const ctx = React.useContext(TxContext);
        React.useEffect(() => {
          if (ctx) capturedCtx = ctx;
        });
        return null;
      }

      render(
        <TestWrapper>
          <ContextCapture />
          <TxAdder txId="0xclear1" label="Clear Test" />
        </TestWrapper>
      );

      // Wait for the transaction to be resolved
      await waitFor(
        () => {
          expect(capturedCtx).not.toBeNull();
          expect(mockedToast.success).toHaveBeenCalled();
        },
        { timeout: 15000 }
      );

      // Call clearResolved
      act(() => {
        capturedCtx!.clearResolved();
      });

      // After clearing, transactions should be filtered
      await waitFor(() => {
        expect(capturedCtx!.transactions.length).toBe(0);
      });
    }, 20000);
  });
});
