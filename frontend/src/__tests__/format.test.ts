import { formatTokenAmount, formatUSDCx, formatSTX } from "../lib/utils/format";

describe("formatTokenAmount Utility", () => {
  it("formats positive bigint values correctly with thousands separators", () => {
    expect(formatTokenAmount(1000000000n)).toBe("1,000.000000");
    expect(formatTokenAmount(123456789n)).toBe("123.456789");
  });

  it("formats zero values correctly", () => {
    expect(formatTokenAmount(0n)).toBe("0.000000");
  });

  it("formats negative bigint values correctly", () => {
    expect(formatTokenAmount(-1000000000n)).toBe("-1,000.000000");
    expect(formatTokenAmount(-500n)).toBe("-0.000500");
  });

  it("handles custom decimal parameters correctly", () => {
    expect(formatTokenAmount(100000n, 2)).toBe("1,000.00");
    expect(formatTokenAmount(100n, 0)).toBe("100.");
  });
});

describe("formatUSDCx Wrapper", () => {
  it("formats USDCx values with 6 decimals", () => {
    expect(formatUSDCx(5000000n)).toBe("5.000000");
  });
});

describe("formatSTX Wrapper", () => {
  it("formats STX values with 6 decimals", () => {
    expect(formatSTX(12000000n)).toBe("12.000000");
  });
});
