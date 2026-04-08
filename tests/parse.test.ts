import { describe, test, expect } from 'vitest';
import { parse, parseStrict, MAX_TIMEOUT } from '../src';

// ─── Precomputed constants (duplicated on purpose — test must not trust src) ──
const M = 60_000;
const H = 3_600_000;
const D = 86_400_000;
const Y = 365.25 * 24 * 60 * 60 * 1_000; // 31_557_600_000
const MO = Y / 12; // 2_629_800_000

describe('parse', () => {
  describe('milliseconds', () => {
    test('should parse "100" as 100ms (bare number defaults to ms)', () => {
      expect(parse('100')).toBe(100);
    });

    test('should parse "500ms"', () => {
      expect(parse('500ms')).toBe(500);
    });

    test('should parse "100msec"', () => {
      expect(parse('100msec')).toBe(100);
    });

    test('should parse "100msecs"', () => {
      expect(parse('100msecs')).toBe(100);
    });

    test('should parse "250millisecond"', () => {
      expect(parse('250millisecond')).toBe(250);
    });

    test('should parse "250milliseconds"', () => {
      expect(parse('250milliseconds')).toBe(250);
    });
  });

  describe('seconds', () => {
    test('should parse "1s" as 1000ms', () => {
      expect(parse('1s')).toBe(1_000);
    });

    test('should parse "5sec"', () => {
      expect(parse('5sec')).toBe(5_000);
    });

    test('should parse "5secs"', () => {
      expect(parse('5secs')).toBe(5_000);
    });

    test('should parse "1second"', () => {
      expect(parse('1second')).toBe(1_000);
    });

    test('should parse "2seconds"', () => {
      expect(parse('2seconds')).toBe(2_000);
    });

    test('should parse "0.5s" as 500ms', () => {
      expect(parse('0.5s')).toBe(500);
    });
  });

  describe('minutes', () => {
    test('should parse "1m" as 60000ms', () => {
      expect(parse('1m')).toBe(60_000);
    });

    test('should parse "5m" as 300000ms', () => {
      expect(parse('5m')).toBe(300_000);
    });

    test('should parse "1min"', () => {
      expect(parse('1min')).toBe(60_000);
    });

    test('should parse "1mins"', () => {
      expect(parse('1mins')).toBe(60_000);
    });

    test('should parse "1minute"', () => {
      expect(parse('1minute')).toBe(60_000);
    });

    test('should parse "2minutes"', () => {
      expect(parse('2minutes')).toBe(120_000);
    });

    test('should parse "15m"', () => {
      expect(parse('15m')).toBe(900_000);
    });
  });

  describe('hours', () => {
    test('should parse "1h" as 3600000ms', () => {
      expect(parse('1h')).toBe(3_600_000);
    });

    test('should parse "1hr"', () => {
      expect(parse('1hr')).toBe(3_600_000);
    });

    test('should parse "1hrs"', () => {
      expect(parse('1hrs')).toBe(3_600_000);
    });

    test('should parse "1hour"', () => {
      expect(parse('1hour')).toBe(3_600_000);
    });

    test('should parse "2hours"', () => {
      expect(parse('2hours')).toBe(7_200_000);
    });

    test('should parse "0.5h" as 1800000ms', () => {
      expect(parse('0.5h')).toBe(1_800_000);
    });
  });

  describe('days', () => {
    test('should parse "1d" as 86400000ms', () => {
      expect(parse('1d')).toBe(86_400_000);
    });

    test('should parse "1day"', () => {
      expect(parse('1day')).toBe(86_400_000);
    });

    test('should parse "2days"', () => {
      expect(parse('2days')).toBe(172_800_000);
    });

    test('should parse "7d"', () => {
      expect(parse('7d')).toBe(604_800_000);
    });
  });

  describe('weeks', () => {
    test('should parse "1w" as 604800000ms', () => {
      expect(parse('1w')).toBe(604_800_000);
    });

    test('should parse "1week"', () => {
      expect(parse('1week')).toBe(604_800_000);
    });

    test('should parse "2weeks"', () => {
      expect(parse('2weeks')).toBe(1_209_600_000);
    });
  });

  describe('months', () => {
    test('should parse "1mo"', () => {
      const expected = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parse('1mo')).toBe(expected);
    });

    test('should parse "1month"', () => {
      const expected = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parse('1month')).toBe(expected);
    });

    test('should parse "3months"', () => {
      const expected = 3 * (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parse('3months')).toBe(expected);
    });

    test('should parse "1mon"', () => {
      const expected = (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parse('1mon')).toBe(expected);
    });

    test('should parse "6mons"', () => {
      const expected = 6 * (365.25 / 12) * 24 * 60 * 60 * 1000;
      expect(parse('6mons')).toBe(expected);
    });
  });

  describe('years', () => {
    test('should parse "1y" as 365.25 days', () => {
      const expected = 365.25 * 24 * 60 * 60 * 1000;
      expect(parse('1y')).toBe(expected);
    });

    test('should parse "1yr"', () => {
      const expected = 365.25 * 24 * 60 * 60 * 1000;
      expect(parse('1yr')).toBe(expected);
    });

    test('should parse "1yrs"', () => {
      const expected = 365.25 * 24 * 60 * 60 * 1000;
      expect(parse('1yrs')).toBe(expected);
    });

    test('should parse "1year"', () => {
      const expected = 365.25 * 24 * 60 * 60 * 1000;
      expect(parse('1year')).toBe(expected);
    });

    test('should parse "2years"', () => {
      const expected = 2 * 365.25 * 24 * 60 * 60 * 1000;
      expect(parse('2years')).toBe(expected);
    });
  });

  describe('case insensitivity', () => {
    test('should parse "1H" (uppercase)', () => {
      expect(parse('1H')).toBe(3_600_000);
    });

    test('should parse "5Min" (mixed case)', () => {
      expect(parse('5Min')).toBe(300_000);
    });

    test('should parse "2HOURS"', () => {
      expect(parse('2HOURS')).toBe(7_200_000);
    });

    test('should parse "1S" (uppercase seconds)', () => {
      expect(parse('1S')).toBe(1_000);
    });
  });

  describe('spaces between value and unit', () => {
    test('should parse "1 h"', () => {
      expect(parse('1 h')).toBe(3_600_000);
    });

    test('should parse "5 minutes"', () => {
      expect(parse('5 minutes')).toBe(300_000);
    });

    test('should parse "100 ms"', () => {
      expect(parse('100 ms')).toBe(100);
    });

    test('should parse "2  days" with extra spaces', () => {
      expect(parse('2  days')).toBe(172_800_000);
    });
  });

  describe('negative values', () => {
    test('should parse "-1s" as -1000ms', () => {
      expect(parse('-1s')).toBe(-1_000);
    });

    test('should parse "-500ms"', () => {
      expect(parse('-500ms')).toBe(-500);
    });

    test('should parse "-3h"', () => {
      expect(parse('-3h')).toBe(-10_800_000);
    });
  });

  describe('decimal values', () => {
    test('should parse "1.5h" as 5400000ms', () => {
      expect(parse('1.5h')).toBe(5_400_000);
    });

    test('should parse ".5s" as 500ms', () => {
      expect(parse('.5s')).toBe(500);
    });

    test('should parse "2.5d"', () => {
      expect(parse('2.5d')).toBe(216_000_000);
    });

    test('should parse "1.25s" as 1250ms', () => {
      expect(parse('1.25s')).toBe(1_250);
    });
  });

  describe('output unit parameter', () => {
    test('should default to milliseconds when no unit specified', () => {
      expect(parse('1s')).toBe(1_000);
    });

    test('should return milliseconds when "ms" unit is explicit', () => {
      expect(parse('1s', { unit: 'ms' })).toBe(1_000);
    });

    test('should return seconds when "s" unit is specified', () => {
      expect(parse('1m', { unit: 's' })).toBe(60);
    });

    test('should return seconds for "1y" with "s" unit', () => {
      expect(parse('1y', { unit: 's' })).toBe(365.25 * 24 * 60 * 60);
    });

    test('should return seconds for "500ms" with "s" unit', () => {
      expect(parse('500ms', { unit: 's' })).toBe(0.5);
    });
  });
});

describe('parseStrict', () => {
  test('should parse valid duration string', () => {
    expect(parseStrict('5m')).toBe(300_000);
  });

  test('should accept parse options', () => {
    expect(parseStrict('1m', { unit: 's' })).toBe(60);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
describe('constants verification', () => {
  test('1 second = 1_000 ms', () => {
    expect(parse('1s')).toBe(1_000);
  });

  test('1 minute = 60_000 ms', () => {
    expect(parse('1m')).toBe(60_000);
  });

  test('1 hour = 3_600_000 ms', () => {
    expect(parse('1h')).toBe(3_600_000);
  });

  test('1 day = 86_400_000 ms', () => {
    expect(parse('1d')).toBe(86_400_000);
  });

  test('1 week = 604_800_000 ms', () => {
    expect(parse('1w')).toBe(604_800_000);
  });

  test('1 year = 365.25 * 86_400_000 ms', () => {
    expect(parse('1y')).toBe(365.25 * 86_400_000);
  });

  test('1 month = 1 year / 12', () => {
    expect(parse('1mo')).toBe((365.25 * 86_400_000) / 12);
  });

  test('week = 7 days exactly', () => {
    expect(parse('1w')).toBe(7 * parse('1d'));
  });

  test('day = 24 hours exactly', () => {
    expect(parse('1d')).toBe(24 * parse('1h'));
  });

  test('hour = 60 minutes exactly', () => {
    expect(parse('1h')).toBe(60 * parse('1m'));
  });

  test('minute = 60 seconds exactly', () => {
    expect(parse('1m')).toBe(60 * parse('1s'));
  });

  test('second = 1000 ms exactly', () => {
    expect(parse('1s')).toBe(1_000 * parse('1ms'));
  });

  test('12 months = 1 year exactly', () => {
    expect(parse('12mo')).toBe(parse('1y'));
  });

  test('MAX_TIMEOUT = 2^31 - 1', () => {
    expect(MAX_TIMEOUT).toBe(2_147_483_647);
  });

  test('MAX_TIMEOUT = 2**31 - 1 (computed)', () => {
    expect(MAX_TIMEOUT).toBe(Math.pow(2, 31) - 1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. PARSE — every unit alias
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: every unit alias', () => {
  describe('millisecond aliases', () => {
    test('ms returns 1 ms per unit', () => {
      expect(parse('7ms')).toBe(7);
    });

    test('msec returns 1 ms per unit', () => {
      expect(parse('7msec')).toBe(7);
    });

    test('msecs returns 1 ms per unit', () => {
      expect(parse('7msecs')).toBe(7);
    });

    test('millisecond returns 1 ms per unit', () => {
      expect(parse('7millisecond')).toBe(7);
    });

    test('milliseconds returns 1 ms per unit', () => {
      expect(parse('7milliseconds')).toBe(7);
    });
  });

  describe('second aliases', () => {
    test('s returns 1_000 ms per unit', () => {
      expect(parse('3s')).toBe(3_000);
    });

    test('sec returns 1_000 ms per unit', () => {
      expect(parse('3sec')).toBe(3_000);
    });

    test('secs returns 1_000 ms per unit', () => {
      expect(parse('3secs')).toBe(3_000);
    });

    test('second returns 1_000 ms per unit', () => {
      expect(parse('3second')).toBe(3_000);
    });

    test('seconds returns 1_000 ms per unit', () => {
      expect(parse('3seconds')).toBe(3_000);
    });
  });

  describe('minute aliases', () => {
    test('m returns 60_000 ms per unit', () => {
      expect(parse('2m')).toBe(120_000);
    });

    test('min returns 60_000 ms per unit', () => {
      expect(parse('2min')).toBe(120_000);
    });

    test('mins returns 60_000 ms per unit', () => {
      expect(parse('2mins')).toBe(120_000);
    });

    test('minute returns 60_000 ms per unit', () => {
      expect(parse('2minute')).toBe(120_000);
    });

    test('minutes returns 60_000 ms per unit', () => {
      expect(parse('2minutes')).toBe(120_000);
    });
  });

  describe('hour aliases', () => {
    test('h returns 3_600_000 ms per unit', () => {
      expect(parse('2h')).toBe(7_200_000);
    });

    test('hr returns 3_600_000 ms per unit', () => {
      expect(parse('2hr')).toBe(7_200_000);
    });

    test('hrs returns 3_600_000 ms per unit', () => {
      expect(parse('2hrs')).toBe(7_200_000);
    });

    test('hour returns 3_600_000 ms per unit', () => {
      expect(parse('2hour')).toBe(7_200_000);
    });

    test('hours returns 3_600_000 ms per unit', () => {
      expect(parse('2hours')).toBe(7_200_000);
    });
  });

  describe('day aliases', () => {
    test('d returns 86_400_000 ms per unit', () => {
      expect(parse('2d')).toBe(172_800_000);
    });

    test('day returns 86_400_000 ms per unit', () => {
      expect(parse('2day')).toBe(172_800_000);
    });

    test('days returns 86_400_000 ms per unit', () => {
      expect(parse('2days')).toBe(172_800_000);
    });
  });

  describe('week aliases', () => {
    test('w returns 604_800_000 ms per unit', () => {
      expect(parse('2w')).toBe(1_209_600_000);
    });

    test('week returns 604_800_000 ms per unit', () => {
      expect(parse('2week')).toBe(1_209_600_000);
    });

    test('weeks returns 604_800_000 ms per unit', () => {
      expect(parse('2weeks')).toBe(1_209_600_000);
    });
  });

  describe('month aliases', () => {
    test('mo returns MO ms per unit', () => {
      expect(parse('2mo')).toBe(2 * MO);
    });

    test('mon returns MO ms per unit', () => {
      expect(parse('2mon')).toBe(2 * MO);
    });

    test('mons returns MO ms per unit', () => {
      expect(parse('2mons')).toBe(2 * MO);
    });

    test('month returns MO ms per unit', () => {
      expect(parse('2month')).toBe(2 * MO);
    });

    test('months returns MO ms per unit', () => {
      expect(parse('2months')).toBe(2 * MO);
    });
  });

  describe('year aliases', () => {
    test('y returns Y ms per unit', () => {
      expect(parse('2y')).toBe(2 * Y);
    });

    test('yr returns Y ms per unit', () => {
      expect(parse('2yr')).toBe(2 * Y);
    });

    test('yrs returns Y ms per unit', () => {
      expect(parse('2yrs')).toBe(2 * Y);
    });

    test('year returns Y ms per unit', () => {
      expect(parse('2year')).toBe(2 * Y);
    });

    test('years returns Y ms per unit', () => {
      expect(parse('2years')).toBe(2 * Y);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. PARSE — decimals with every unit type
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: decimals with every unit', () => {
  test('0.5ms = 0.5', () => {
    expect(parse('0.5ms')).toBe(0.5);
  });

  test('0.5s = 500', () => {
    expect(parse('0.5s')).toBe(500);
  });

  test('1.5m = 90_000', () => {
    expect(parse('1.5m')).toBe(90_000);
  });

  test('2.5h = 9_000_000', () => {
    expect(parse('2.5h')).toBe(9_000_000);
  });

  test('0.5d = 43_200_000', () => {
    expect(parse('0.5d')).toBe(43_200_000);
  });

  test('0.5w = 302_400_000', () => {
    expect(parse('0.5w')).toBe(302_400_000);
  });

  test('0.5mo = MO / 2', () => {
    expect(parse('0.5mo')).toBe(MO / 2);
  });

  test('0.5y = Y / 2', () => {
    expect(parse('0.5y')).toBe(Y / 2);
  });

  test('1.25s = 1_250', () => {
    expect(parse('1.25s')).toBe(1_250);
  });

  test('2.75h = 9_900_000', () => {
    expect(parse('2.75h')).toBe(9_900_000);
  });

  test('.5s (no leading zero) = 500', () => {
    expect(parse('.5s')).toBe(500);
  });

  test('.25m (no leading zero) = 15_000', () => {
    expect(parse('.25m')).toBe(15_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. PARSE — very small values
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: very small values', () => {
  test('0.001ms = 0.001', () => {
    expect(parse('0.001ms')).toBeCloseTo(0.001, 10);
  });

  test('0.1ms = 0.1', () => {
    expect(parse('0.1ms')).toBeCloseTo(0.1, 10);
  });

  test('0.01s = 10', () => {
    expect(parse('0.01s')).toBe(10);
  });

  test('0ms = 0', () => {
    expect(parse('0ms')).toBe(0);
  });

  test('0s = 0', () => {
    expect(parse('0s')).toBe(0);
  });

  test('0h = 0', () => {
    expect(parse('0h')).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. PARSE — safeForTimer clamp returns exact MAX_TIMEOUT
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: safeForTimer clamp precision', () => {
  test('clamp returns exactly MAX_TIMEOUT, not MAX_TIMEOUT+1', () => {
    const result = parse('30d', { safeForTimer: 'clamp' });
    expect(result).toBe(2_147_483_647);
    expect(result).not.toBe(2_147_483_648);
    expect(result).not.toBe(2_147_483_646);
  });

  test('clamp negative returns exactly -MAX_TIMEOUT', () => {
    const result = parse('-30d', { safeForTimer: 'clamp' });
    expect(result).toBe(-2_147_483_647);
    expect(result).not.toBe(-2_147_483_648);
    expect(result).not.toBe(-2_147_483_646);
  });

  test('value exactly at MAX_TIMEOUT is not clamped', () => {
    // MAX_TIMEOUT = 2_147_483_647 ms = ~24.855 days
    // We need a string that parses to exactly MAX_TIMEOUT
    // 2_147_483_647ms would work
    expect(parse('2147483647ms', { safeForTimer: 'clamp' })).toBe(2_147_483_647);
  });

  test('value one ms over MAX_TIMEOUT is clamped', () => {
    expect(parse('2147483648ms', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
  });

  test('value one ms under MAX_TIMEOUT is not clamped', () => {
    expect(parse('2147483646ms', { safeForTimer: 'clamp' })).toBe(2_147_483_646);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 9. PARSE — boundary at MAX_SAFE_INTEGER
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: MAX_SAFE_INTEGER boundary', () => {
  test('value just under MAX_SAFE_INTEGER does not throw', () => {
    // 285420 years in ms ≈ 9.007e15, under MAX_SAFE_INTEGER = 9.0071e15
    expect(() => parse('285420y')).not.toThrow();
  });

  test('value exceeding MAX_SAFE_INTEGER throws', () => {
    expect(() => parse('285421y')).toThrow('MAX_SAFE_INTEGER');
  });

  test('bare number at MAX_SAFE_INTEGER is fine', () => {
    expect(parse('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 32. PARSE — bare number (no unit defaults to ms)
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: bare number defaults to ms', () => {
  test('"100" = 100', () => {
    expect(parse('100')).toBe(100);
  });

  test('"0" = 0', () => {
    expect(parse('0')).toBe(0);
  });

  test('"1" = 1', () => {
    expect(parse('1')).toBe(1);
  });

  test('"-50" = -50', () => {
    expect(parse('-50')).toBe(-50);
  });

  test('"0.5" = 0.5', () => {
    expect(parse('0.5')).toBe(0.5);
  });

  test('".5" = 0.5', () => {
    expect(parse('.5')).toBe(0.5);
  });

  test('"100" with unit: s returns 0.1', () => {
    expect(parse('100', { unit: 's' })).toBe(0.1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 33. PARSE — negative compound with all units
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: negative compound thorough', () => {
  test('negative compound negates the entire sum', () => {
    const pos = parse('1h 30m 25s');
    const neg = parse('-1h 30m 25s');
    expect(neg).toBe(-pos);
  });

  test('negative compound with ms', () => {
    expect(parse('-1s 500ms')).toBe(-1_500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 34. PARSE — leading whitespace in compound
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: leading whitespace handling', () => {
  test('leading space returns NaN (non-strict)', () => {
    expect(parse(' 1h')).toBeNaN();
  });

  test('leading space throws in strict mode', () => {
    expect(() => parse(' 1h', { strict: true })).toThrow('Invalid duration string');
  });

  test('trailing space on compound is OK', () => {
    expect(parse('1h 30m ')).toBe(H + 30 * M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 38. PARSE — case insensitivity on compound
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: case insensitivity on compound', () => {
  test('1H 30M compound', () => {
    expect(parse('1H 30M')).toBe(H + 30 * M);
  });

  test('2DAYS 6HOURS compound', () => {
    expect(parse('2DAYS 6HOURS')).toBe(2 * D + 6 * H);
  });

  test('1Hr 30Min compound (mixed case)', () => {
    expect(parse('1Hr 30Min')).toBe(H + 30 * M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 39. parseStrict — type-checked parse
// ─────────────────────────────────────────────────────────────────────────────
describe('parseStrict: behavior matches parse', () => {
  test('parseStrict returns same as parse for valid input', () => {
    expect(parseStrict('1h')).toBe(parse('1h'));
  });

  test('parseStrict with unit: s', () => {
    expect(parseStrict('5m', { unit: 's' })).toBe(300);
  });

  test('parseStrict with safeForTimer: clamp', () => {
    expect(parseStrict('30d', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
  });

  test('parseStrict with safeForTimer: throw', () => {
    expect(() => parseStrict('30d', { safeForTimer: 'throw' })).toThrow('maximum timer');
  });

  test('parseStrict with strict: true + invalid input throws', () => {
    // Note: parseStrict's type system prevents invalid strings at compile time,
    // but at runtime it delegates to parse() which can still be called with bad data
    expect(() => parseStrict('garbage' as any, { strict: true })).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 42. PARSE — compound regex resets correctly (no stale lastIndex)
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound regex state isolation', () => {
  test('consecutive compound parses do not interfere', () => {
    expect(parse('1h 30m')).toBe(H + 30 * M);
    expect(parse('2h 45m')).toBe(2 * H + 45 * M);
    expect(parse('1h 30m')).toBe(H + 30 * M);
  });

  test('compound after single after compound', () => {
    expect(parse('1h 30m')).toBe(H + 30 * M);
    expect(parse('5m')).toBe(300_000);
    expect(parse('2d 6h')).toBe(2 * D + 6 * H);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 45. PARSE — month/minute ambiguity in compound
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: month/minute disambiguation in compound', () => {
  test('"1mo 30m" — mo=month, m=minute', () => {
    expect(parse('1mo 30m')).toBe(MO + 30 * M);
  });

  test('"1month 30min" — unambiguous long names', () => {
    expect(parse('1month 30min')).toBe(MO + 30 * M);
  });

  test('"3mo" as single parse = 3 months', () => {
    expect(parse('3mo')).toBe(3 * MO);
  });

  test('"3m" as single parse = 3 minutes', () => {
    expect(parse('3m')).toBe(3 * M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 49. PARSE — compound pattern edge: "mo" vs "m" overlap
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound mo vs m overlap', () => {
  test('"1mo" in compound matches month not minute', () => {
    // compoundPattern has months? before minutes? so "mo" should match month
    expect(parse('1mo')).toBe(MO);
  });

  test('"1m" in compound matches minute', () => {
    expect(parse('1m')).toBe(M);
  });

  test('"1mo 1m" resolves correctly', () => {
    expect(parse('1mo 1m')).toBe(MO + M);
  });

  test('"1mon 1min" resolves correctly', () => {
    expect(parse('1mon 1min')).toBe(MO + M);
  });

  test('"1months 1minutes" resolves correctly', () => {
    expect(parse('1months 1minutes')).toBe(MO + M);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 47. PARSE — safeForTimer with compound strings
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: safeForTimer with compound strings', () => {
  test('compound exceeding MAX_TIMEOUT throws with safeForTimer: throw', () => {
    expect(() => parse('25d 1h', { safeForTimer: 'throw' })).toThrow('maximum timer');
  });

  test('compound exceeding MAX_TIMEOUT clamps with safeForTimer: clamp', () => {
    expect(parse('25d 1h', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
  });

  test('compound within MAX_TIMEOUT passes with safeForTimer: throw', () => {
    expect(parse('24d 12h', { safeForTimer: 'throw' })).toBe(24 * D + 12 * H);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. PARSE — strict + safeForTimer combined
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: strict + safeForTimer combined', () => {
  test('strict + safeForTimer throw: invalid string throws strict error', () => {
    expect(() => parse('garbage', { strict: true, safeForTimer: 'throw' })).toThrow(
      'Invalid duration string',
    );
  });

  test('strict + safeForTimer throw: overflow throws timer error', () => {
    expect(() => parse('25d', { strict: true, safeForTimer: 'throw' })).toThrow('maximum timer');
  });

  test('strict + safeForTimer clamp: valid under-limit passes', () => {
    expect(parse('1h', { strict: true, safeForTimer: 'clamp' })).toBe(3_600_000);
  });

  test('strict + safeForTimer clamp: overflow clamps', () => {
    expect(parse('25d', { strict: true, safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
  });

  test('strict + safeForTimer clamp: invalid string throws', () => {
    expect(() => parse('garbage', { strict: true, safeForTimer: 'clamp' })).toThrow(
      'Invalid duration string',
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 51. PARSE error messages
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 4: Parse compound edge cases (parse.ts mutant killers)
// ─────────────────────────────────────────────────────────────────────────────
describe('parse: compound mutant killers', () => {
  test('completely non-matching string returns NaN (consumedLength === 0 guard)', () => {
    expect(parse('no-match-at-all')).toBeNaN();
  });

  test('multiple trailing spaces are valid: "1h  " (regex * vs empty mutant)', () => {
    expect(parse('1h  ')).toBe(H);
  });

  test('lowercase unit "1ms" works (toLowerCase mutant killer)', () => {
    expect(parse('1ms')).toBe(1);
  });

  test('exactly MAX_TIMEOUT is NOT thrown with safeForTimer: throw (> vs >= mutant)', () => {
    expect(parse('2147483647ms', { safeForTimer: 'throw' })).toBe(2_147_483_647);
  });

  test('0ms with safeForTimer: clamp returns 0 (ms < 0 vs ms <= 0 mutant)', () => {
    expect(parse('0ms', { safeForTimer: 'clamp' })).toBe(0);
  });
});

describe('parse error messages', () => {
  test('parse non-string includes value in error', () => {
    expect(() => parse(42 as any)).toThrow('parse()');
  });

  test('parse empty string includes value in error', () => {
    expect(() => parse('')).toThrow('parse()');
  });

  test('parse too-long string includes value in error', () => {
    expect(() => parse('x'.repeat(101))).toThrow('parse()');
  });
});
