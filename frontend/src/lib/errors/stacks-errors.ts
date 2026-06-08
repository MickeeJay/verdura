import { getContractErrorMessage, parseClarityErrorCode } from "@/components/errors/ContractError";

export interface ParsedStacksError {
  raw: any;
  message: string;
  clarityCode: number | null;
  friendlyMessage: string;
}

/**
 * Parses raw error objects/strings from Stacks API / transaction responses
 * and extracts Clarity abort reasons and error codes.
 */
export function parseStacksError(error: any): ParsedStacksError {
  let message = "An unknown Stacks transaction error occurred.";
  let clarityCode: number | null = null;

  if (error) {
    if (typeof error === "string") {
      message = error;
    } else if (typeof error === "object") {
      // Handle standard Error objects or custom API response error structures
      message = error.message || error.error || error.reason || JSON.stringify(error);
    }
  }

  // Check object properties for Clarity assertions (e.g. { reason: "ContractAssertionFailed", value: "u102" })
  if (error && typeof error === "object") {
    if (error.value !== undefined) {
      clarityCode = parseClarityErrorCode(error.value);
    }
    if (clarityCode === null && error.reason !== undefined) {
      clarityCode = parseClarityErrorCode(error.reason);
    }
    if (clarityCode === null && error.code !== undefined) {
      clarityCode = parseClarityErrorCode(error.code);
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
