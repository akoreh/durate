import { describe, test, expect } from 'vitest';
import { format, MAX_TIMEOUT } from '../src';

// ─── Precomputed constants (duplicated on purpose — test must not trust src) ──
const D = 86_400_000;
const W = 604_800_000;
const Y = 365.25 * 24 * 60 * 60 * 1_000; // 31_557_600_000
const MO = Y / 12; // 2_629_800_000

describe('format', () => {
  describe('short format (default)', () => {
    test('should format 500 as "500ms"', () => {
      expect(format(500)).toBe('500ms');
    });

    test('should format 0 as "0ms"', () => {
      expect(format(0)).toBe('0ms');
    });

    test('should format 1_000 as "1s"', () => {
      expect(format(1_000)).toBe('1s');
    });

    test('should format 1_500 as "2s" (rounds)', () => {
      expect(format(1_500)).toBe('2s');
    });

    test('should format 60_000 as "1m"', () => {
      expect(format(60_000)).toBe('1m');
    });

    test('should format 300_000 as "5m"', () => {
      expect(format(300_000)).toBe('5m');
    });

    test('should format 3_600_000 as "1h"', () => {
      expect(format(3_600_000)).toBe('1h');
    });

    test('should format 86_400_000 as "1d"', () => {
      expect(format(86_400_000)).toBe('1d');
    });

    test('should format 604_800_000 as "1w"', () => {
      expect(format(604_800_000)).toBe('1w');
    });

    test('should format negative value as "-1h"', () => {
      expect(format(-3_600_000)).toBe('-1h');
    });

    test('should format year duration as "1y"', () => {
      expect(format(31_557_600_000)).toBe('1y');
    });

    test('should format month duration as "1mo"', () => {
      expect(format(2_629_800_000)).toBe('1mo');
    });
  });

  describe('long format', () => {
    test('should format 500 as "500 ms"', () => {
      expect(format(500, { long: true })).toBe('500 ms');
    });

    test('should format 1_000 as "1 second"', () => {
      expect(format(1_000, { long: true })).toBe('1 second');
    });

    test('should format 2000 as "2 seconds" (plural)', () => {
      expect(format(2_000, { long: true })).toBe('2 seconds');
    });

    test('should format 60_000 as "1 minute"', () => {
      expect(format(60_000, { long: true })).toBe('1 minute');
    });

    test('should format 120_000 as "2 minutes" (plural)', () => {
      expect(format(120_000, { long: true })).toBe('2 minutes');
    });

    test('should format 3_600_000 as "1 hour"', () => {
      expect(format(3_600_000, { long: true })).toBe('1 hour');
    });

    test('should format 7_200_000 as "2 hours" (plural)', () => {
      expect(format(7_200_000, { long: true })).toBe('2 hours');
    });

    test('should format 86_400_000 as "1 day"', () => {
      expect(format(86_400_000, { long: true })).toBe('1 day');
    });

    test('should format 172_800_000 as "2 days" (plural)', () => {
      expect(format(172_800_000, { long: true })).toBe('2 days');
    });

    test('should format negative value as "-1 hour"', () => {
      expect(format(-3_600_000, { long: true })).toBe('-1 hour');
    });

    test('should format 1 year as "1 year"', () => {
      expect(format(31_557_600_000, { long: true })).toBe('1 year');
    });

    test('should format 2 years as "2 years" (plural)', () => {
      expect(format(2 * 31_557_600_000, { long: true })).toBe('2 years');
    });

    test('should format 1 month as "1 month"', () => {
      expect(format(2_629_800_000, { long: true })).toBe('1 month');
    });

    test('should format 2 months as "2 months" (plural)', () => {
      expect(format(2 * 2_629_800_000, { long: true })).toBe('2 months');
    });

    test('should format 1 week as "1 week"', () => {
      expect(format(604_800_000, { long: true })).toBe('1 week');
    });

    test('should format 2 weeks as "2 weeks" (plural)', () => {
      expect(format(2 * 604_800_000, { long: true })).toBe('2 weeks');
    });

    test('should pluralize at exactly 1.5x boundary', () => {
      expect(format(1_500, { long: true })).toBe('2 seconds');
    });
  });

  describe('errors', () => {
    test('should throw for NaN', () => {
      expect(() => format(NaN)).toThrow('format()');
    });

    test('should throw for Infinity', () => {
      expect(() => format(Infinity)).toThrow();
    });

    test('should throw for -Infinity', () => {
      expect(() => format(-Infinity)).toThrow();
    });

    test('should throw for non-number', () => {
      expect(() => format('1h' as unknown as number)).toThrow();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 35. FORMAT — short format rounding behavior
// ─────────────────────────────────────────────────────────────────────────────
describe('format: short format rounding', () => {
  test('1_400ms rounds to 1s', () => {
    expect(format(1_400)).toBe('1s');
  });

  test('1_500ms rounds to 2s', () => {
    expect(format(1_500)).toBe('2s');
  });

  test('1_501ms rounds to 2s', () => {
    expect(format(1_501)).toBe('2s');
  });

  test('59_500ms stays in seconds range (60s not 1m)', () => {
    // 59_500 < 60_000 (m threshold), so it uses s: Math.round(59500/1000) = 60 → "60s"
    expect(format(59_500)).toBe('60s');
  });

  test('89_999ms rounds to 1m', () => {
    expect(format(89_999)).toBe('1m');
  });

  test('90_000ms rounds to 2m', () => {
    expect(format(90_000)).toBe('2m');
  });

  test('negative: -1_500 rounds to -1s (JS banker rounding: Math.round(-1.5) = -1)', () => {
    expect(format(-1_500)).toBe('-1s');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 37. FORMAT — short format unit selection thresholds
// ─────────────────────────────────────────────────────────────────────────────
describe('format: unit selection thresholds (short)', () => {
  test('999ms → ms range', () => {
    expect(format(999)).toBe('999ms');
  });

  test('1_000ms → s range', () => {
    expect(format(1_000)).toBe('1s');
  });

  test('59_999ms → s range (rounds to 60s, not 1m)', () => {
    // 59_999 < 60_000 threshold, so stays in seconds: Math.round(59999/1000) = 60 → "60s"
    expect(format(59_999)).toBe('60s');
  });

  test('60_000ms → m range', () => {
    expect(format(60_000)).toBe('1m');
  });

  test('3_599_999ms → m range', () => {
    expect(format(3_599_999)).toBe('60m');
  });

  test('3_600_000ms → h range', () => {
    expect(format(3_600_000)).toBe('1h');
  });

  test('86_399_999ms → h range', () => {
    expect(format(86_399_999)).toBe('24h');
  });

  test('86_400_000ms → d range', () => {
    expect(format(86_400_000)).toBe('1d');
  });

  test('604_799_999ms → d range', () => {
    expect(format(604_799_999)).toBe('7d');
  });

  test('604_800_000ms → w range', () => {
    expect(format(604_800_000)).toBe('1w');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 25. FORMAT — long pluralization boundary
// ─────────────────────────────────────────────────────────────────────────────
describe('format: long pluralization boundary at 1.5x', () => {
  test('1499ms → "1 second" (below 1.5x)', () => {
    expect(format(1_499, { long: true })).toBe('1 second');
  });

  test('1500ms → "2 seconds" (at 1.5x)', () => {
    expect(format(1_500, { long: true })).toBe('2 seconds');
  });

  test('89_999ms → "1 minute" (below 1.5x of 60s)', () => {
    expect(format(89_999, { long: true })).toBe('1 minute');
  });

  test('90_000ms → "2 minutes" (at 1.5x of 60s)', () => {
    expect(format(90_000, { long: true })).toBe('2 minutes');
  });

  test('5_399_999ms → "1 hour" (below 1.5x of 1h)', () => {
    expect(format(5_399_999, { long: true })).toBe('1 hour');
  });

  test('5_400_000ms → "2 hours" (at 1.5x of 1h)', () => {
    expect(format(5_400_000, { long: true })).toBe('2 hours');
  });

  test('129_599_999ms → "1 day" (below 1.5x of 1d)', () => {
    expect(format(129_599_999, { long: true })).toBe('1 day');
  });

  test('129_600_000ms → "2 days" (at 1.5x of 1d)', () => {
    expect(format(129_600_000, { long: true })).toBe('2 days');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 24. FORMAT — single millisecond
// ─────────────────────────────────────────────────────────────────────────────
describe('format: format(1)', () => {
  test('format(1) returns "1ms"', () => {
    expect(format(1)).toBe('1ms');
  });

  test('format(1, { long: true }) returns "1 ms"', () => {
    expect(format(1, { long: true })).toBe('1 ms');
  });

  test('format(1, { compound: true }) returns "1ms"', () => {
    expect(format(1, { compound: true })).toBe('1ms');
  });

  test('format(1, { precision: 2 }) returns "1ms"', () => {
    expect(format(1, { precision: 2 })).toBe('1ms');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 41. FORMAT — format(MAX_SAFE_INTEGER)
// ─────────────────────────────────────────────────────────────────────────────
describe('format: extreme values', () => {
  test('MAX_SAFE_INTEGER does not throw', () => {
    expect(() => format(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  test('MAX_SAFE_INTEGER + 1 throws', () => {
    expect(() => format(Number.MAX_SAFE_INTEGER + 1)).toThrow('MAX_SAFE_INTEGER');
  });

  test('-MAX_SAFE_INTEGER does not throw', () => {
    expect(() => format(-Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  test('format(MAX_TIMEOUT) does not throw', () => {
    expect(() => format(MAX_TIMEOUT)).not.toThrow();
  });

  test('format(MAX_TIMEOUT) returns a week-range string', () => {
    // MAX_TIMEOUT ≈ 24.855 days ≈ 3.55 weeks, which is >= w threshold → "4w"
    const result = format(MAX_TIMEOUT);
    expect(result).toBe('4w');
  });

  test('format(MAX_TIMEOUT, { compound: true }) includes days and hours', () => {
    const result = format(MAX_TIMEOUT, { compound: true });
    expect(result).toContain('d');
    expect(result).toContain('h');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 52. FORMAT — negative zero edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('format: negative zero handling', () => {
  test('format(-0) short = "0ms"', () => {
    expect(format(-0)).toBe('0ms');
  });

  test('format(-0) long = "0 ms"', () => {
    expect(format(-0, { long: true })).toBe('0 ms');
  });

  test('format(-0) compound = "0ms"', () => {
    expect(format(-0, { compound: true })).toBe('0ms');
  });

  test('format(-0) template = no minus prefix', () => {
    expect(format(-0, { template: 'HH:mm:ss' })).toBe('00:00:00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 13. FORMAT — precision edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('format: precision edge cases', () => {
  test('precision: 0 rounds to integer (hour)', () => {
    expect(format(5_400_000, { precision: 0 })).toBe('2h');
  });

  test('precision: 1 at hour level', () => {
    expect(format(5_400_000, { precision: 1 })).toBe('1.5h');
  });

  test('precision: 2 at hour level', () => {
    expect(format(5_400_000, { precision: 2 })).toBe('1.5h');
  });

  test('precision: 3 at hour level', () => {
    expect(format(5_400_000, { precision: 3 })).toBe('1.5h');
  });

  test('precision: 0 at minute level', () => {
    expect(format(90_000, { precision: 0 })).toBe('2m');
  });

  test('precision: 1 at minute level', () => {
    expect(format(90_000, { precision: 1 })).toBe('1.5m');
  });

  test('precision: 0 at second level', () => {
    expect(format(1_500, { precision: 0 })).toBe('2s');
  });

  test('precision: 1 at second level', () => {
    expect(format(1_500, { precision: 1 })).toBe('1.5s');
  });

  test('precision: 0 at day level', () => {
    expect(format(D + D / 2, { precision: 0 })).toBe('2d');
  });

  test('precision: 1 at day level', () => {
    expect(format(D + D / 2, { precision: 1 })).toBe('1.5d');
  });

  test('precision: 2 at week level', () => {
    expect(format(W + W / 2, { precision: 2 })).toBe('1.5w');
  });

  test('precision strips trailing zeros (1.50h becomes 1.5h)', () => {
    // 1.5h exactly → parseFloat('1.50') → 1.5
    expect(format(5_400_000, { precision: 2 })).toBe('1.5h');
  });

  test('precision strips trailing zeros (2.00h becomes 2h)', () => {
    expect(format(7_200_000, { precision: 2 })).toBe('2h');
  });

  test('precision: 1 on exact value (no decimal needed)', () => {
    expect(format(3_600_000, { precision: 1 })).toBe('1h');
  });

  test('precision on ms-range value', () => {
    expect(format(500, { precision: 1 })).toBe('500ms');
  });

  test('precision on negative value', () => {
    expect(format(-5_400_000, { precision: 1 })).toBe('-1.5h');
  });

  test('precision: 0 on negative value', () => {
    expect(format(-5_400_000, { precision: 0 })).toBe('-2h');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 50. FORMAT — precision at year/month/week levels
// ─────────────────────────────────────────────────────────────────────────────
describe('format: precision at year/month/week levels', () => {
  test('precision: 1 at year level', () => {
    expect(format(Y + Y / 2, { precision: 1 })).toBe('1.5y');
  });

  test('precision: 2 at year level', () => {
    expect(format(Y + Y / 4, { precision: 2 })).toBe('1.25y');
  });

  test('precision: 1 at month level', () => {
    expect(format(MO + MO / 2, { precision: 1 })).toBe('1.5mo');
  });

  test('precision: 1 at week level', () => {
    expect(format(W + W / 2, { precision: 1 })).toBe('1.5w');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 51. FORMAT error messages
// ─────────────────────────────────────────────────────────────────────────────
describe('format error messages', () => {
  test('format non-number throws descriptive error', () => {
    expect(() => format('hello' as any)).toThrow('format()');
  });

  test('format NaN throws descriptive error', () => {
    expect(() => format(NaN)).toThrow('format()');
  });

  test('format Infinity throws descriptive error', () => {
    expect(() => format(Infinity)).toThrow('finite number');
  });
});
