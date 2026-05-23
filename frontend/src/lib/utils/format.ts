import { USDCX_DECIMALS, STX_DECIMALS } from "@/lib/constants";

/**
 * Formats a bigint micro-unit amount into a human-readable decimal string.
 *
 * @param amount - The amount in micro-units (bigint)
 * @param decimals - The number of decimal places for the token (default: 6)
 * @returns Formatted string with proper decimal places, e.g. "1,000.000000"
 */
export function formatTokenAmount(amount: bigint, decimals: number = USDCX_DECIMALS): string {
  const isNegative = amount < 0n;
  const absoluteAmount = isNegative ? -amount : amount;

  const divisor = BigInt(10 ** decimals);
  const wholePart = absoluteAmount / divisor;
  const fractionalPart = absoluteAmount % divisor;

  const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
  const wholeStr = wholePart.toLocaleString("en-US");

  return `${isNegative ? "-" : ""}${wholeStr}.${fractionalStr}`;
}

/**
 * Formats a bigint amount as USDCx with 6 decimal places.
 */
export function formatUSDCx(amount: bigint): string {
  return formatTokenAmount(amount, USDCX_DECIMALS);
}

/**
 * Formats a bigint amount as STX with 6 decimal places.
 */
export function formatSTX(amount: bigint): string {
  return formatTokenAmount(amount, STX_DECIMALS);
}
