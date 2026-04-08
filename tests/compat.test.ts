import { describe, test, expect } from 'vitest';
import { parse, format } from '../src';

describe('ms v2 compatibility', () => {
  test('should parse "15m" → 900000', () => {
    expect(parse('15m')).toBe(900_000);
  });

  test('should parse "7d" → 604800000', () => {
    expect(parse('7d')).toBe(604_800_000);
  });

  test('should parse "1h" → 3600000', () => {
    expect(parse('1h')).toBe(3_600_000);
  });

  test('should parse "30s" → 30000', () => {
    expect(parse('30s')).toBe(30_000);
  });

  describe('round-trip consistency', () => {
    test('should round-trip "1s" through parse and format', () => {
      const ms = parse('1s');
      expect(format(ms)).toBe('1s');
    });

    test('should round-trip "5m" through parse and format', () => {
      const ms = parse('5m');
      expect(format(ms)).toBe('5m');
    });

    test('should round-trip "1h" through parse and format', () => {
      const ms = parse('1h');
      expect(format(ms)).toBe('1h');
    });

    test('should round-trip "1d" through parse and format', () => {
      const ms = parse('1d');
      expect(format(ms)).toBe('1d');
    });

    test('should round-trip "1w" through parse and format', () => {
      const ms = parse('1w');
      expect(format(ms)).toBe('1w');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 27. ROUND-TRIP: parse(format(x))
// ─────────────────────────────────────────────────────────────────────────────
describe('round-trip: parse(format(x))', () => {
  test('1_000ms (1s)', () => {
    expect(parse(format(1_000))).toBe(1_000);
  });

  test('60_000ms (1m)', () => {
    expect(parse(format(60_000))).toBe(60_000);
  });

  test('3_600_000ms (1h)', () => {
    expect(parse(format(3_600_000))).toBe(3_600_000);
  });

  test('86_400_000ms (1d)', () => {
    expect(parse(format(86_400_000))).toBe(86_400_000);
  });

  test('604_800_000ms (1w)', () => {
    expect(parse(format(604_800_000))).toBe(604_800_000);
  });

  test('500ms', () => {
    expect(parse(format(500))).toBe(500);
  });

  test('0ms', () => {
    expect(parse(format(0))).toBe(0);
  });

  test('negative: -3_600_000ms', () => {
    expect(parse(format(-3_600_000))).toBe(-3_600_000);
  });

  test('large: 31_557_600_000ms (1y)', () => {
    expect(parse(format(31_557_600_000))).toBe(31_557_600_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 28. ROUND-TRIP: format(parse(x))
// ─────────────────────────────────────────────────────────────────────────────
describe('round-trip: format(parse(x))', () => {
  test('"1s"', () => {
    expect(format(parse('1s'))).toBe('1s');
  });

  test('"5m"', () => {
    expect(format(parse('5m'))).toBe('5m');
  });

  test('"2h"', () => {
    expect(format(parse('2h'))).toBe('2h');
  });

  test('"3d"', () => {
    expect(format(parse('3d'))).toBe('3d');
  });

  test('"1w"', () => {
    expect(format(parse('1w'))).toBe('1w');
  });

  test('"500ms"', () => {
    expect(format(parse('500ms'))).toBe('500ms');
  });

  test('"1y"', () => {
    expect(format(parse('1y'))).toBe('1y');
  });

  test('"-1h"', () => {
    expect(format(parse('-1h'))).toBe('-1h');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 29. ROUND-TRIP: compound round-trips
// ─────────────────────────────────────────────────────────────────────────────
describe('round-trip: compound', () => {
  test('format(parse("1h 30m"), { compound: true }) = "1h 30m"', () => {
    expect(format(parse('1h 30m'), { compound: true })).toBe('1h 30m');
  });

  test('format(parse("2d 6h 30m"), { compound: true }) = "2d 6h 30m"', () => {
    expect(format(parse('2d 6h 30m'), { compound: true })).toBe('2d 6h 30m');
  });

  test('format(parse("1m 30s 500ms"), { compound: true }) = "1m 30s 500ms"', () => {
    expect(format(parse('1m 30s 500ms'), { compound: true })).toBe('1m 30s 500ms');
  });

  test('format(parse("1d 2h 3m 4s"), { compound: true }) = "1d 2h 3m 4s"', () => {
    expect(format(parse('1d 2h 3m 4s'), { compound: true })).toBe('1d 2h 3m 4s');
  });

  test('compound long round-trip', () => {
    expect(format(parse('1h 30m'), { compound: true, long: true })).toBe(
      '1 hour 30 minutes',
    );
  });

  test('parse compound output: parse("1h 30m 25s") = 5_425_000', () => {
    const formatted = format(5_425_000, { compound: true });
    expect(parse(formatted)).toBe(5_425_000);
  });
});
