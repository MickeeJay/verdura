import { durationDaysToBlocks, BLOCKS_PER_DAY } from "../lib/utils/blocks";

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
