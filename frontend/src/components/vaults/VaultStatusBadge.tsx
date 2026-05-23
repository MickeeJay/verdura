"use client";

export type VaultStatus = "locked" | "matured" | "completed";

interface VaultStatusBadgeProps {
  status: VaultStatus;
}

const STATUS_CONFIG: Record<VaultStatus, { label: string; className: string }> = {
  matured: {
    label: "Matured",
    className: "vault-badge vault-badge--matured",
  },
  locked: {
    label: "Locked",
    className: "vault-badge vault-badge--locked",
  },
  completed: {
    label: "Completed",
    className: "vault-badge vault-badge--completed",
  },
};

export function getVaultStatus(
  isActive: boolean,
  currentBlock: number,
  endBlock: number
): VaultStatus {
  if (!isActive) {
    return "completed";
  }
  if (currentBlock >= endBlock) {
    return "matured";
  }
  return "locked";
}

export function VaultStatusBadge({ status }: VaultStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={config.className} data-testid="vault-status-badge">
      {config.label}
    </span>
  );
}
