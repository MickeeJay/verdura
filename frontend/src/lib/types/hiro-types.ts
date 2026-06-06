/**
 * Typed interfaces for the Hiro Stacks API transaction response.
 * Endpoint: GET /extended/v1/tx/{txid}
 *
 * @see https://docs.hiro.so/stacks/api/transactions/get-transaction
 */

// ── Transaction Status ───────────────────────────────────────

/** All possible `tx_status` values returned by the Hiro API. */
export type HiroTxStatus =
  | "pending"
  | "success"
  | "abort_by_response"
  | "abort_by_post_condition"
  | "dropped_replace_by_fee"
  | "dropped_replace_across_fork"
  | "dropped_too_expensive"
  | "dropped_stale_garbage_collect";


// ── Contract Call Details ────────────────────────────────────

export interface HiroContractCallDetail {
  contract_id: string;
  function_name: string;
  function_signature: string;
  function_args?: HiroFunctionArg[];
}

export interface HiroFunctionArg {
  hex: string;
  repr: string;
  name: string;
  type: string;
}

// ── Transaction Events ───────────────────────────────────────

export interface HiroTransactionEvent {
  event_index: number;
  event_type: string;
  tx_id: string;
  contract_log?: {
    contract_id: string;
    topic: string;
    value: { hex: string; repr: string };
  };
  stx_transfer_event?: {
    sender: string;
    recipient: string;
    amount: string;
  };
}

// ── Post Conditions ──────────────────────────────────────────

export interface HiroPostCondition {
  principal: {
    type_id: string;
    address?: string;
    contract_name?: string;
  };
  condition_code: string;
  amount: string;
  type: string;
  asset?: {
    asset_name: string;
    contract_address: string;
    contract_name: string;
  };
}

// ── Full Transaction Response ────────────────────────────────

export interface HiroTransactionResponse {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  sponsored: boolean;
  post_condition_mode: string;
  post_conditions: HiroPostCondition[];
  anchor_mode: string;

  tx_status: HiroTxStatus;
  tx_type: string;

  /** Block-level fields — absent when `tx_status === 'pending'` */
  block_hash?: string;
  block_height?: number;
  burn_block_time?: number;
  burn_block_time_iso?: string;
  canonical?: boolean;
  microblock_canonical?: boolean;
  microblock_hash?: string;
  microblock_sequence?: number;
  parent_block_hash?: string;
  parent_burn_block_time?: number;
  parent_burn_block_time_iso?: string;
  tx_index?: number;

  /** Present when `tx_type === 'contract_call'` */
  contract_call?: HiroContractCallDetail;

  /** Transaction result — present after execution */
  tx_result?: {
    hex: string;
    repr: string;
  };

  /** Events emitted by the transaction */
  events?: HiroTransactionEvent[];
  event_count?: number;
}
