export const BLOCKS_PER_DAY = 144;
export const BLOCK_TIME_MINUTES = 10;

/**
 * Converts duration in days to the estimated number of blocks on the Stacks/Bitcoin network.
 * Based on an approximation of 144 blocks per day (approx. 10 minutes per block).
 * 
 * @param days - The duration in days (1 to 365)
 * @returns The corresponding number of blocks
 */
export function durationDaysToBlocks(days: number): number {
  return Math.round(days * BLOCKS_PER_DAY);
}

/**
 * Converts remaining Stacks/Bitcoin blocks into a human-readable time remaining string.
 * Uses a standard assumption of 10 minutes per block (approx 144 blocks per day).
 *
 * Examples:
 * - 0 blocks -> "Ready to withdraw"
 * - 1 block -> "10 minutes"
 * - 6 blocks -> "1 hour"
 * - 144 blocks -> "1 day"
 * - 2034 blocks -> "14 days, 3 hours"
 * - NaN inputs -> "Ready to withdraw"
 *
 * @param currentBlock - The current Stacks block height (number)
 * @param endBlock - The vault's end/maturity Stacks block height (number)
 * @returns A human-readable remaining time string or 'Ready to withdraw'
 */
export function blocksToTimeRemaining(currentBlock: number, endBlock: number): string {
  if (isNaN(currentBlock) || isNaN(endBlock)) {
    return "Ready to withdraw";
  }

  if (currentBlock >= endBlock) {
    return "Ready to withdraw";
  }

  const remainingBlocks = endBlock - currentBlock;
  const totalMinutes = remainingBlocks * BLOCK_TIME_MINUTES;

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

  if (days > 0 && hours > 0) {
    return `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  if (days > 0) {
    return `${days} day${days !== 1 ? "s" : ""}`;
  }

  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? "s" : ""}`;
  }

  const minutes = totalMinutes;
  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
  }

  return "Ready to withdraw";
}
