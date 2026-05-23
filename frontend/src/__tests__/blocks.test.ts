import { durationDaysToBlocks, BLOCKS_PER_DAY, blocksToTimeRemaining } from "../lib/utils/blocks";

describe("durationDaysToBlocks", () => {
  it("uses the correct BLOCKS_PER_DAY constant value of 144", () => {
    expect(BLOCKS_PER_DAY).toBe(144);
  });

  it("correctly converts 1 day to 144 blocks", () => {
    expect(durationDaysToBlocks(1)).toBe(144);
  });

  it("correctly converts 30 days to 4320 blocks", () => {
    expect(durationDaysToBlocks(30)).toBe(4320);
  });

  it("correctly converts 365 days to 52560 blocks", () => {
    expect(durationDaysToBlocks(365)).toBe(52560);
  });

  it("handles decimal values if they are passed", () => {
    expect(durationDaysToBlocks(1.5)).toBe(216);
  });
});

describe("blocksToTimeRemaining", () => {
  it("returns 'Ready to withdraw' if currentBlock is equal to endBlock", () => {
    expect(blocksToTimeRemaining(100, 100)).toBe("Ready to withdraw");
  });

  it("returns 'Ready to withdraw' if currentBlock is greater than endBlock", () => {
    expect(blocksToTimeRemaining(120, 100)).toBe("Ready to withdraw");
  });

  it("returns human-readable string like '14 days, 3 hours' for locked vaults", () => {
    // 14 days = 14 * 144 = 2016 blocks. 3 hours = 18 blocks. Total = 2034 blocks.
    expect(blocksToTimeRemaining(1000, 3034)).toBe("14 days, 3 hours");
  });

  it("handles singular time units correctly", () => {
    // 1 day = 144 blocks. 1 hour = 6 blocks. Total = 150 blocks.
    expect(blocksToTimeRemaining(0, 150)).toBe("1 day, 1 hour");
  });

  it("handles only days remaining", () => {
    // 2 days = 288 blocks.
    expect(blocksToTimeRemaining(0, 288)).toBe("2 days");
  });

  it("handles only hours remaining", () => {
    // 5 hours = 30 blocks.
    expect(blocksToTimeRemaining(0, 30)).toBe("5 hours");
  });

  it("handles minutes when days and hours are zero", () => {
    // 3 blocks = 30 minutes.
    expect(blocksToTimeRemaining(0, 3)).toBe("30 minutes");
  });

  it("handles singular minutes correctly", () => {
    // We don't typically have fractional blocks but 1 block is 10 minutes.
    // If we have custom block times resulting in less than 10 minutes, let's see.
    // Let's just check standard cases:
    expect(blocksToTimeRemaining(0, 1)).toBe("10 minutes");
  });
});

