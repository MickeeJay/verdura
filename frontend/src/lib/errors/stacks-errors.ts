import { getContractErrorMessage, parseClarityErrorCode } from "@/components/errors/ContractError";

export interface ParsedStacksError {
  raw: unknown;
  message: string;
  clarityCode: number | null;
  friendlyMessage: string;
}

/**
 * Parses raw error objects/strings from Stacks API / transaction responses
 * and extracts Clarity abort reasons and error codes.
 */
export function parseStacksError(error: unknown): ParsedStacksError {
  let message = "An unknown Stacks transaction error occurred.";
  let clarityCode: number | null = null;

  if (error) {
    if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object") {
      // Handle standard Error objects or custom API response error structures
      const errObj = error as Record<string, unknown>;
      const rawMessage = errObj.message ?? errObj.error ?? errObj.reason;
      if (typeof rawMessage === "string") {
        message = rawMessage;
      } else if (rawMessage !== undefined) {
        message = String(rawMessage);
      } else {
        message = JSON.stringify(error);
      }
    }
  }

  // Check object properties for Clarity assertions (e.g. { reason: "ContractAssertionFailed", value: "u102" })
  if (error && typeof error === "object") {
    const errObj = error as Record<string, unknown>;
    if (errObj.value !== undefined) {
      clarityCode = parseClarityErrorCode(errObj.value);
    }
    if (clarityCode === null && errObj.reason !== undefined) {
      clarityCode = parseClarityErrorCode(errObj.reason);
    }
    if (clarityCode === null && errObj.code !== undefined) {
      clarityCode = parseClarityErrorCode(errObj.code);
    }
  }

  // Fallback to parsing from error message string
  if (clarityCode === null) {
    clarityCode = parseClarityErrorCode(message);
  }

  const friendlyMessage = clarityCode !== null
    ? getContractErrorMessage(clarityCode)
    : message;

  return {
    raw: error,
    message,
    clarityCode,
    friendlyMessage,
  };
}
