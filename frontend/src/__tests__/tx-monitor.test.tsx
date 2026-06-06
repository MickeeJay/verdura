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
  });
});
