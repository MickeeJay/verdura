export interface VaultData {
  id: number;
  owner: string;
  name: string;
  principalAmount: bigint;
  startBlock: bigint;
  endBlock: bigint;
  isActive: boolean;
  yieldEnabled: boolean;
  yieldShares: bigint;
}

export interface CreateVaultParams {
  name: string;
  durationBlocks: number;
  yieldEnabled: boolean;
}

export interface DepositParams {
  vaultId: number;
  amount: bigint;
}

export interface WithdrawParams {
  vaultId: number;
}

export interface VaultQueryResult {
  vault: VaultData | null;
}
