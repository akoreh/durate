import { describe, test, expect } from 'vitest';
import { parse, format } from '../src';

// ─── Precomputed constants (duplicated on purpose — test must not trust src) ──
const S = 1_000;
const M = 60_000;
const H = 3_600_000;
const D = 86_400_000;
const W = 604_800_000;
const Y = 365.25 * 24 * 60 * 60 * 1_000; // 31_557_600_000
const MO = Y / 12; // 2_629_800_000

describe('compound parse', () => {
  test('should parse "1h 30m"', () => {
    expect(parse('1h 30m')).toBe(5_400_000);
  });

  test('should parse "2d 6h 30m"', () => {
    expect(parse('2d 6h 30m')).toBe(196_200_000);
  });

  test('should parse "1h30m" without spaces', () => {
    expect(parse('1h30m')).toBe(5_400_000);
  });

  test('should parse "1d 2h 3m 4s"', () => {
    expect(parse('1d 2h 3m 4s')).toBe(86_400_000 + 7_200_000 + 180_000 + 4_000);
  });

  test('should parse "1y 6mo"', () => {
    const y = 365.25 * 24 * 60 * 60 * 1_000;
    const mo = y / 12;
    expect(parse('1y 6mo')).toBe(y + 6 * mo);
  });

  test('should parse "500ms"', () => {
    expect(parse('500ms')).toBe(500);
  });

  test('should parse "1m 30s 500ms"', () => {
    expect(parse('1m 30s 500ms')).toBe(90_500);
  });

  test('should parse single unit (backwards compatible)', () => {
    expect(parse('5m')).toBe(300_000);
  });

  test('should parse compound with extra spaces', () => {
    expect(parse('1h  30m')).toBe(5_400_000);
  });

  test('should parse compound with decimal values', () => {
    expect(parse('1.5h 30m')).toBe(5_400_000 + 1_800_000);
  });

  test('should return NaN for compound with invalid unit', () => {
    expect(parse('1h 30x')).toBeNaN();
  });

  test('should parse negative compound', () => {
    expect(parse('-1h 30m')).toBe(-5_400_000);
  });

  test('compound with unit: s option', () => {
    expect(parse('1h 30m', { unit: 's' })).toBe(5_400);
  });

  test('compound with strict throws on invalid', () => {
    expect(() => parse('1h garbage', { strict: true })).toThrow();
  });
});

describe('compound format', () => {
  test('should format with compound: true', () => {
    expect(format(5_425_000, { compound: true })).toBe('1h 30m 25s');
  });

  test('should format with compound + long', () => {
    expect(format(5_425_000, { compound: true, long: true })).toBe('1 hour 30 minutes 25 seconds');
  });

  test('should format with compound + parts limit', () => {
    expect(format(5_425_000, { compound: true, parts: 2 })).toBe('1h 30m');
  });

  test('should format with compound + long + parts limit', () => {
    expect(format(5_425_000, { compound: true, long: true, parts: 2 })).toBe('1 hour 30 minutes');
  });

  test('should format simple values without compound', () => {
    expect(format(3_600_000, { compound: true })).toBe('1h');
  });

  test('should format zero remainder without trailing units', () => {
    expect(format(86_400_000, { compound: true })).toBe('1d');
  });

  test('should format milliseconds in compound', () => {
    expect(format(61_500, { compound: true })).toBe('1m 1s 500ms');
  });

  test('should format days + hours', () => {
    expect(format(90_000_000, { compound: true })).toBe('1d 1h');
  });

  test('should format negative compound', () => {
    expect(format(-5_400_000, { compound: true })).toBe('-1h 30m');
  });

  test('compound with parts: 1 falls back to single unit', () => {
    expect(format(5_425_000, { compound: true, parts: 1 })).toBe('1h');
  });
});

describe('precision format', () => {
  test('should format with precision: 1', () => {
    expect(format(5_400_000, { precision: 1 })).toBe('1.5h');
  });

  test('should format with precision: 2', () => {
    expect(format(5_425_000, { precision: 2 })).toBe('1.51h');
  });

  test('should not add decimals when precision: 0', () => {
    expect(format(5_400_000, { precision: 0 })).toBe('2h');
  });

  test('should format with precision on minutes', () => {
    expect(format(90_000, { precision: 1 })).toBe('1.5m');
  });

  test('should format with precision on seconds', () => {
    expect(format(1_500, { precision: 1 })).toBe('1.5s');
  });

  test('default format (no precision) rounds to integer', () => {
    expect(format(5_400_000)).toBe('2h');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. PARSE — compound edge cases
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound edge cases', () => {
  test('duplicate units: 1h 2h sums to 3h', () => {
    expect(parse('1h 2h')).toBe(3 * H);
  });

  test('reverse order: 30m 1h sums correctly', () => {
    expect(parse('30m 1h')).toBe(H + 30 * M);
  });

  test('single-unit compound is same as single parse', () => {
    expect(parse('5m')).toBe(300_000);
  });

  test('compound with ms: 1s 500ms = 1_500', () => {
    expect(parse('1s 500ms')).toBe(1_500);
  });

  test('compound with all 7 units at once', () => {
    const expected = Y + MO + W + D + H + M + S;
    expect(parse('1y 1mo 1w 1d 1h 1m 1s')).toBe(expected);
  });

  test('compound with all 7 units plus ms', () => {
    const expected = Y + MO + W + D + H + M + S + 500;
    expect(parse('1y 1mo 1w 1d 1h 1m 1s 500ms')).toBe(expected);
  });

  test('compound with decimals: 1.5h 30m = 2h total', () => {
    expect(parse('1.5h 30m')).toBe(1.5 * H + 30 * M);
  });

  test('compound with decimals: 0.5d 12h = 1d', () => {
    expect(parse('0.5d 12h')).toBe(0.5 * D + 12 * H);
  });

  test('compound with space inside "1 h 30 m" parses each segment', () => {
    expect(parse('1 h 30 m')).toBe(H + 30 * M);
  });

  test('compound without spaces: 1h30m25s', () => {
    expect(parse('1h30m25s')).toBe(H + 30 * M + 25 * S);
  });

  test('compound with multiple spaces: 1h   30m   25s', () => {
    expect(parse('1h   30m   25s')).toBe(H + 30 * M + 25 * S);
  });

  test('compound with long units: 1hour 30minutes', () => {
    expect(parse('1hour 30minutes')).toBe(H + 30 * M);
  });

  test('negative compound: -1h 30m', () => {
    expect(parse('-1h 30m')).toBe(-(H + 30 * M));
  });

  test('negative compound: -2d 6h', () => {
    expect(parse('-2d 6h')).toBe(-(2 * D + 6 * H));
  });

  test('compound with trailing spaces: "1h 30m " is valid', () => {
    expect(parse('1h 30m ')).toBe(H + 30 * M);
  });

  test('compound with garbage between segments returns NaN', () => {
    expect(parse('1h garbage 30m')).toBeNaN();
  });

  test('compound with only whitespace between segments is OK', () => {
    expect(parse('1h  30m')).toBe(H + 30 * M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PARSE — compound with output unit: s
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound with unit: s', () => {
  test('1h 30m in seconds = 5_400', () => {
    expect(parse('1h 30m', { unit: 's' })).toBe(5_400);
  });

  test('1d 12h in seconds = 129_600', () => {
    expect(parse('1d 12h', { unit: 's' })).toBe(129_600);
  });

  test('1m 30s 500ms in seconds = 90.5', () => {
    expect(parse('1m 30s 500ms', { unit: 's' })).toBe(90.5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 10. FORMAT — compound with every unit level
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound with every unit level', () => {
  test('value spanning years down to ms', () => {
    const ms = Y + MO + W + D + H + M + S + 500;
    const result = format(ms, { compound: true });
    expect(result).toBe('1y 1mo 1w 1d 1h 1m 1s 500ms');
  });

  test('exact year value', () => {
    expect(format(Y, { compound: true })).toBe('1y');
  });

  test('exact month value', () => {
    expect(format(MO, { compound: true })).toBe('1mo');
  });

  test('exact week value', () => {
    expect(format(W, { compound: true })).toBe('1w');
  });

  test('exact day value', () => {
    expect(format(D, { compound: true })).toBe('1d');
  });

  test('exact hour value', () => {
    expect(format(H, { compound: true })).toBe('1h');
  });

  test('exact minute value', () => {
    expect(format(M, { compound: true })).toBe('1m');
  });

  test('exact second value', () => {
    expect(format(S, { compound: true })).toBe('1s');
  });

  test('exact 1 ms value', () => {
    expect(format(1, { compound: true })).toBe('1ms');
  });

  test('only ms value in compound', () => {
    expect(format(500, { compound: true })).toBe('500ms');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 11. FORMAT — compound skipping zero-value middle units
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound skips zero-value middle units', () => {
  test('1h 0m 25s skips the 0m part', () => {
    const ms = H + 25 * S; // 1h and 25s, no minutes
    expect(format(ms, { compound: true })).toBe('1h 25s');
  });

  test('1d 0h 30m skips the 0h part', () => {
    const ms = D + 30 * M;
    expect(format(ms, { compound: true })).toBe('1d 30m');
  });

  test('1d 0h 0m 1s skips 0h and 0m', () => {
    const ms = D + S;
    expect(format(ms, { compound: true })).toBe('1d 1s');
  });

  test('1y 0mo 0w 0d 0h 0m 1s', () => {
    const ms = Y + S;
    expect(format(ms, { compound: true })).toBe('1y 1s');
  });

  test('2h 500ms skips 0m and 0s', () => {
    const ms = 2 * H + 500;
    expect(format(ms, { compound: true })).toBe('2h 500ms');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 12. FORMAT — compound + long + parts combinations
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound + long + parts combinations', () => {
  test('compound + long: singular and plural', () => {
    const ms = D + 2 * H + M + S;
    expect(format(ms, { compound: true, long: true })).toBe(
      '1 day 2 hours 1 minute 1 second',
    );
  });

  test('compound + long + parts: 1', () => {
    expect(format(D + 2 * H + M, { compound: true, long: true, parts: 1 })).toBe('1 day');
  });

  test('compound + long + parts: 2', () => {
    expect(format(D + 2 * H + M, { compound: true, long: true, parts: 2 })).toBe(
      '1 day 2 hours',
    );
  });

  test('compound + long + parts: 3', () => {
    expect(format(D + 2 * H + M, { compound: true, long: true, parts: 3 })).toBe(
      '1 day 2 hours 1 minute',
    );
  });

  test('compound + parts: 0 returns 0ms (no parts allowed)', () => {
    expect(format(H + 30 * M, { compound: true, parts: 0 })).toBe('0ms');
  });

  test('compound ms value + long', () => {
    expect(format(500, { compound: true, long: true })).toBe('500 ms');
  });

  test('compound 0 + long', () => {
    expect(format(0, { compound: true, long: true })).toBe('0 ms');
  });

  test('compound 0 + short', () => {
    expect(format(0, { compound: true })).toBe('0ms');
  });

  test('negative compound + long', () => {
    expect(format(-(H + 30 * M), { compound: true, long: true })).toBe(
      '-1 hour 30 minutes',
    );
  });

  test('negative compound + long + parts: 1', () => {
    expect(format(-(H + 30 * M + 25 * S), { compound: true, long: true, parts: 1 })).toBe(
      '-1 hour',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 36. FORMAT — compound long pluralization
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound long pluralization', () => {
  test('1 of each unit is singular', () => {
    expect(format(D + H + M + S, { compound: true, long: true })).toBe(
      '1 day 1 hour 1 minute 1 second',
    );
  });

  test('2 of each unit is plural', () => {
    expect(format(2 * D + 2 * H + 2 * M + 2 * S, { compound: true, long: true })).toBe(
      '2 days 2 hours 2 minutes 2 seconds',
    );
  });

  test('1 ms is "1 ms" (ms does not pluralize)', () => {
    expect(format(1, { compound: true, long: true })).toBe('1 ms');
  });

  test('500 ms is "500 ms" (ms does not pluralize)', () => {
    expect(format(500, { compound: true, long: true })).toBe('500 ms');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 46. FORMAT — compound with month and year
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound with month and year', () => {
  test('1 year + 6 months compound', () => {
    expect(format(Y + 6 * MO, { compound: true })).toBe('1y 6mo');
  });

  test('2 years compound', () => {
    expect(format(2 * Y, { compound: true })).toBe('2y');
  });

  test('1 year + 1 month + 1 day compound', () => {
    expect(format(Y + MO + D, { compound: true })).toBe('1y 1mo 1d');
  });

  test('year + month + week + day compound', () => {
    expect(format(Y + MO + W + D, { compound: true })).toBe('1y 1mo 1w 1d');
  });

  test('compound long with year', () => {
    expect(format(Y, { compound: true, long: true })).toBe('1 year');
  });

  test('compound long with 2 years', () => {
    expect(format(2 * Y, { compound: true, long: true })).toBe('2 years');
  });

  test('compound long with month', () => {
    expect(format(MO, { compound: true, long: true })).toBe('1 month');
  });

  test('compound long with 2 months', () => {
    expect(format(2 * MO, { compound: true, long: true })).toBe('2 months');
  });

  test('compound long with week', () => {
    expect(format(W, { compound: true, long: true })).toBe('1 week');
  });

  test('compound long with 2 weeks', () => {
    expect(format(2 * W, { compound: true, long: true })).toBe('2 weeks');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 40. FORMAT — compound with fractional ms remainder
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 1: Regex `?` suffix mutations — singular+plural through compound path
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound singular vs plural unit names (regex ? mutant killers)', () => {
  test('singular long ms + s: "1millisecond 1second"', () => {
    expect(parse('1millisecond 1second')).toBe(1 + S);
  });
  test('plural long ms + s: "1milliseconds 1seconds"', () => {
    expect(parse('1milliseconds 1seconds')).toBe(1 + S);
  });

  test('singular short ms + s: "1msec 1sec"', () => {
    expect(parse('1msec 1sec')).toBe(1 + S);
  });
  test('plural short ms + s: "1msecs 1secs"', () => {
    expect(parse('1msecs 1secs')).toBe(1 + S);
  });

  test('singular long min + hr: "1minute 1hour"', () => {
    expect(parse('1minute 1hour')).toBe(M + H);
  });
  test('plural long min + hr: "1minutes 1hours"', () => {
    expect(parse('1minutes 1hours')).toBe(M + H);
  });

  test('singular short min + hr: "1min 1hr"', () => {
    expect(parse('1min 1hr')).toBe(M + H);
  });
  test('plural short min + hr: "1mins 1hrs"', () => {
    expect(parse('1mins 1hrs')).toBe(M + H);
  });

  test('singular long day + week: "1day 1week"', () => {
    expect(parse('1day 1week')).toBe(D + W);
  });
  test('plural long day + week: "1days 1weeks"', () => {
    expect(parse('1days 1weeks')).toBe(D + W);
  });

  test('singular long month + year: "1month 1year"', () => {
    expect(parse('1month 1year')).toBe(MO + Y);
  });
  test('plural long month + year: "1months 1years"', () => {
    expect(parse('1months 1years')).toBe(MO + Y);
  });

  test('singular short mon + yr: "1mon 1yr"', () => {
    expect(parse('1mon 1yr')).toBe(MO + Y);
  });
  test('plural short mon + yr: "1mons 1yrs"', () => {
    expect(parse('1mons 1yrs')).toBe(MO + Y);
  });
});

describe('parse: compound with leading-dot decimal (\\d* regex mutant killer)', () => {
  test('".5h 30m" — leading dot needs \\d* to match empty before dot', () => {
    expect(parse('.5h 30m')).toBe(0.5 * H + 30 * M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 3: Compound format edge cases (format.ts mutant killers)
// ─────────────────────────────────────────────────────────────────────────────
describe('format: compound edge case mutant killers', () => {
  test('format(0, { compound: true }) does NOT have a negative sign', () => {
    const result = format(0, { compound: true });
    expect(result).toBe('0ms');
    expect(result).not.toContain('-');
  });

  test('format(3_600_000, { compound: true }) does NOT contain "ms"', () => {
    const result = format(3_600_000, { compound: true });
    expect(result).toBe('1h');
    expect(result).not.toContain('ms');
  });
});

describe('format: compound with sub-ms remainder', () => {
  test('1_000.5ms compound: rounds remainder ms', () => {
    // 1000.5ms = 1s + 0.5ms → remaining 0.5ms → Math.round(0.5) = 1ms
    // Actually: remaining = 0.5, count = Math.round(0.5) = 1
    const result = format(1_000.5, { compound: true });
    expect(result).toBe('1s 1ms');
  });

  test('1_000.4ms compound: rounds remainder to 0ms (omitted)', () => {
    // remaining = 0.4, Math.round(0.4) = 0, count <= 0, so no ms part
    const result = format(1_000.4, { compound: true });
    expect(result).toBe('1s');
  });
});
