"use client";

import React from "react";
import { AlertCircle, ShieldAlert, Ban, Timer, HelpCircle } from "lucide-react";

export const CLARITY_ERRORS: Record<number, string> = {};

// Initialize all error codes in u100 - u305 to ensure no gaps
for (let i = 100; i <= 305; i++) {
  if (i >= 100 && i < 200) {
    CLARITY_ERRORS[i] = `Vault Error (u${i})`;
  } else if (i >= 200 && i < 300) {
    CLARITY_ERRORS[i] = `Yield Router Error (u${i})`;
  } else {
    CLARITY_ERRORS[i] = `Savings Profile Error (u${i})`;
  }
}

// Override with specific human-readable messages for known contract error codes
CLARITY_ERRORS[100] = "Unauthorized";
CLARITY_ERRORS[102] = "Vault is still locked";
CLARITY_ERRORS[103] = "Vault is locked and cannot be accessed";
CLARITY_ERRORS[104] = "Vault has already matured";
CLARITY_ERRORS[106] = "Invalid deposit or withdrawal amount";
CLARITY_ERRORS[107] = "Invalid lock duration specified";

CLARITY_ERRORS[200] = "Unauthorized action on yield router";
CLARITY_ERRORS[201] = "Unsupported token for yield routing";
CLARITY_ERRORS[202] = "Amount must be greater than zero";
CLARITY_ERRORS[203] = "Yield router is temporarily paused";

CLARITY_ERRORS[300] = "Unauthorized savings profile update";
CLARITY_ERRORS[301] = "Savings profile not found";
CLARITY_ERRORS[302] = "Savings profile already exists";

// Parse Clarity error strings like "u102", "(err u102)", or raw numbers
export function parseClarityErrorCode(errorInput: string | number | any): number | null {
  if (typeof errorInput === "number") {
    return errorInput;
  }
  if (!errorInput || typeof errorInput !== "string") {
    return null;
  }
  const match = errorInput.match(/u?(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

export function getContractErrorMessage(code: number | string | any): string {
  const parsedCode = parseClarityErrorCode(code);
  if (parsedCode !== null && parsedCode in CLARITY_ERRORS) {
    return CLARITY_ERRORS[parsedCode];
  }
  return typeof code === "string" ? code : "Unknown on-chain error";
}

interface ContractErrorProps {
  code: number | string | any;
  className?: string;
}

export function ContractError({ code, className = "" }: ContractErrorProps) {
  const parsedCode = parseClarityErrorCode(code);
  const message = getContractErrorMessage(code);

  const getIcon = () => {
    if (parsedCode === null) return <HelpCircle className="size-5 text-destructive" />;
    if (parsedCode === 100 || parsedCode === 200 || parsedCode === 300) {
      return <ShieldAlert className="size-5 text-destructive" />;
    }
    if (parsedCode === 102 || parsedCode === 103) {
      return <Timer className="size-5 text-amber-500" />;
    }
    if (parsedCode === 203) {
      return <Ban className="size-5 text-destructive" />;
    }
    return <AlertCircle className="size-5 text-destructive" />;
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl ${className}`}
      data-testid="contract-error-card"
    >
      <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-foreground leading-none">
          Contract Error {parsedCode ? `u${parsedCode}` : ""}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
