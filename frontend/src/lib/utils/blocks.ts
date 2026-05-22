export const BLOCKS_PER_DAY = 144;

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
