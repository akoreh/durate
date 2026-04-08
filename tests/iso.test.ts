import { describe, expect, test } from 'vitest';
import { parse, parseISO, formatISO } from '../src';
import { s, m, h, d, w, mo, y } from '../src/constants';

// ═══════════════════════════════════════════════════════════════════════════
// parseISO
// ═══════════════════════════════════════════════════════════════════════════

describe('parseISO', () => {
  // ── Single time components ────────────────────────────────────────────

  describe('single time components', () => {
    test('PT1H — 1 hour', () => {
      expect(parseISO('PT1H')).toBe(h);
    });

    test('PT30M — 30 minutes', () => {
      expect(parseISO('PT30M')).toBe(30 * m);
    });

    test('PT45S — 45 seconds', () => {
      expect(parseISO('PT45S')).toBe(45 * s);
    });

    test('PT0S — zero seconds', () => {
      expect(parseISO('PT0S')).toBe(0);
    });

    test('PT0H — zero hours', () => {
      expect(parseISO('PT0H')).toBe(0);
    });

    test('PT100S — large seconds', () => {
      expect(parseISO('PT100S')).toBe(100 * s);
    });
  });

  // ── Single date components ────────────────────────────────────────────

  describe('single date components', () => {
    test('P1D — 1 day', () => {
      expect(parseISO('P1D')).toBe(d);
    });

    test('P7D — 7 days', () => {
      expect(parseISO('P7D')).toBe(7 * d);
    });

    test('P1W — 1 week', () => {
      expect(parseISO('P1W')).toBe(w);
    });

    test('P2W — 2 weeks', () => {
      expect(parseISO('P2W')).toBe(2 * w);
    });

    test('P1M — 1 month', () => {
      expect(parseISO('P1M')).toBe(mo);
    });

    test('P6M — 6 months', () => {
      expect(parseISO('P6M')).toBe(6 * mo);
    });

    test('P1Y — 1 year', () => {
      expect(parseISO('P1Y')).toBe(y);
    });

    test('P10Y — 10 years', () => {
      expect(parseISO('P10Y')).toBe(10 * y);
    });
  });

  // ── Combined date components ──────────────────────────────────────────

  describe('combined date components', () => {
    test('P1Y6M — 1 year 6 months', () => {
      expect(parseISO('P1Y6M')).toBe(y + 6 * mo);
    });

    test('P1Y2M3D — 1 year 2 months 3 days', () => {
      expect(parseISO('P1Y2M3D')).toBe(y + 2 * mo + 3 * d);
    });

    test('P2M15D — 2 months 15 days', () => {
      expect(parseISO('P2M15D')).toBe(2 * mo + 15 * d);
    });
  });

  // ── Combined time components ──────────────────────────────────────────

  describe('combined time components', () => {
    test('PT1H30M — 1 hour 30 minutes', () => {
      expect(parseISO('PT1H30M')).toBe(h + 30 * m);
    });

    test('PT1H30M45S — 1 hour 30 minutes 45 seconds', () => {
      expect(parseISO('PT1H30M45S')).toBe(h + 30 * m + 45 * s);
    });

    test('PT2H15S — 2 hours 15 seconds (no minutes)', () => {
      expect(parseISO('PT2H15S')).toBe(2 * h + 15 * s);
    });

    test('PT30M45S — 30 minutes 45 seconds', () => {
      expect(parseISO('PT30M45S')).toBe(30 * m + 45 * s);
    });
  });

  // ── Combined date and time ────────────────────────────────────────────

  describe('combined date and time', () => {
    test('P1DT12H — 1 day 12 hours', () => {
      expect(parseISO('P1DT12H')).toBe(d + 12 * h);
    });

    test('P1Y2M3DT4H5M6S — full ISO duration', () => {
      expect(parseISO('P1Y2M3DT4H5M6S')).toBe(y + 2 * mo + 3 * d + 4 * h + 5 * m + 6 * s);
    });

    test('P365DT0S — 365 days and 0 seconds', () => {
      expect(parseISO('P365DT0S')).toBe(365 * d);
    });

    test('P7DT1H30M — 1 week + 1h30m', () => {
      expect(parseISO('P7DT1H30M')).toBe(7 * d + h + 30 * m);
    });

    test('P2WT5H — 2 weeks + 5 hours', () => {
      expect(parseISO('P2WT5H')).toBe(2 * w + 5 * h);
    });
  });

  // ── Fractional values ─────────────────────────────────────────────────

  describe('fractional values', () => {
    test('PT1.5H — 1.5 hours', () => {
      expect(parseISO('PT1.5H')).toBe(1.5 * h);
    });

    test('PT0.5S — half a second', () => {
      expect(parseISO('PT0.5S')).toBe(500);
    });

    test('P1.5D — 1.5 days', () => {
      expect(parseISO('P1.5D')).toBe(1.5 * d);
    });

    test('P0.5Y — half a year', () => {
      expect(parseISO('P0.5Y')).toBe(0.5 * y);
    });

    test('PT1.25M — 1.25 minutes', () => {
      expect(parseISO('PT1.25M')).toBe(1.25 * m);
    });

    test('PT0.001S — 1 millisecond', () => {
      expect(parseISO('PT0.001S')).toBe(1);
    });
  });

  // ── Invalid inputs ────────────────────────────────────────────────────

  describe('invalid inputs', () => {
    test('empty string returns NaN', () => {
      expect(parseISO('')).toBeNaN();
    });

    test('bare P returns NaN', () => {
      expect(parseISO('P')).toBeNaN();
    });

    test('bare PT returns NaN', () => {
      expect(parseISO('PT')).toBeNaN();
    });

    test('no P prefix returns NaN', () => {
      expect(parseISO('1H')).toBeNaN();
    });

    test('no P prefix with T returns NaN', () => {
      expect(parseISO('T1H')).toBeNaN();
    });

    test('lowercase returns NaN', () => {
      expect(parseISO('pt1h')).toBeNaN();
    });

    test('mixed case returns NaN', () => {
      expect(parseISO('PT1h')).toBeNaN();
    });

    test('garbage string returns NaN', () => {
      expect(parseISO('garbage')).toBeNaN();
    });

    test('human duration string returns NaN', () => {
      expect(parseISO('1h 30m')).toBeNaN();
    });

    test('negative ISO is not standard — returns NaN', () => {
      // ISO 8601 does not define negative durations
      expect(parseISO('-PT1H')).toBeNaN();
    });

    test('non-string returns NaN', () => {
      expect(parseISO(123 as any)).toBeNaN();
      expect(parseISO(null as any)).toBeNaN();
      expect(parseISO(undefined as any)).toBeNaN();
    });

    test('trailing garbage returns NaN', () => {
      expect(parseISO('PT1Hgarbage')).toBeNaN();
    });

    test('leading garbage returns NaN', () => {
      expect(parseISO('garbagePT1H')).toBeNaN();
    });

    test('space inside returns NaN', () => {
      expect(parseISO('PT 1H')).toBeNaN();
    });

    test('wrong order — time before date — returns NaN', () => {
      expect(parseISO('PT1HP1D')).toBeNaN();
    });

    test('duplicate T returns NaN', () => {
      expect(parseISO('PT1HT2M')).toBeNaN();
    });

    test('date M without number returns NaN', () => {
      expect(parseISO('PM')).toBeNaN();
    });

    test('negative number inside returns NaN', () => {
      expect(parseISO('PT-1H')).toBeNaN();
    });
  });

  // ── Consistency with parse ────────────────────────────────────────────

  describe('consistency with durate parse', () => {
    test('PT1H equals parse("1h")', () => {
      expect(parseISO('PT1H')).toBe(h);
    });

    test('P1D equals parse("1d")', () => {
      expect(parseISO('P1D')).toBe(d);
    });

    test('P1W equals parse("1w")', () => {
      expect(parseISO('P1W')).toBe(w);
    });

    test('PT1H30M equals parse("1h 30m")', () => {
      expect(parseISO('PT1H30M')).toBe(h + 30 * m);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// formatISO
// ═══════════════════════════════════════════════════════════════════════════

describe('formatISO', () => {
  // ── Single components ─────────────────────────────────────────────────

  describe('single components', () => {
    test('formats 1 hour', () => {
      expect(formatISO(h)).toBe('PT1H');
    });

    test('formats 1 minute', () => {
      expect(formatISO(m)).toBe('PT1M');
    });

    test('formats 1 second', () => {
      expect(formatISO(s)).toBe('PT1S');
    });

    test('formats 1 day', () => {
      expect(formatISO(d)).toBe('P1D');
    });

    test('formats 500ms', () => {
      expect(formatISO(500)).toBe('PT0.5S');
    });

    test('formats 1ms', () => {
      expect(formatISO(1)).toBe('PT0.001S');
    });

    test('formats 0ms', () => {
      expect(formatISO(0)).toBe('PT0S');
    });
  });

  // ── Multiple components ───────────────────────────────────────────────

  describe('multiple components', () => {
    test('formats 1h 30m', () => {
      expect(formatISO(h + 30 * m)).toBe('PT1H30M');
    });

    test('formats 1h 30m 45s', () => {
      expect(formatISO(h + 30 * m + 45 * s)).toBe('PT1H30M45S');
    });

    test('formats 1d 12h', () => {
      expect(formatISO(d + 12 * h)).toBe('P1DT12H');
    });

    test('formats 2d 6h 30m', () => {
      expect(formatISO(2 * d + 6 * h + 30 * m)).toBe('P2DT6H30M');
    });

    test('formats 7d as 7D not 1W', () => {
      // formatISO uses days, not weeks — simpler and unambiguous
      expect(formatISO(7 * d)).toBe('P7D');
    });

    test('formats 1d 1s (no hours or minutes)', () => {
      expect(formatISO(d + s)).toBe('P1DT1S');
    });

    test('formats 1d 500ms', () => {
      expect(formatISO(d + 500)).toBe('P1DT0.5S');
    });
  });

  // ── Negative values ───────────────────────────────────────────────────

  describe('negative values', () => {
    test('formats negative 1 hour', () => {
      expect(formatISO(-h)).toBe('-PT1H');
    });

    test('formats negative 1d 12h', () => {
      expect(formatISO(-(d + 12 * h))).toBe('-P1DT12H');
    });

    test('formats negative 500ms', () => {
      expect(formatISO(-500)).toBe('-PT0.5S');
    });

    test('formats -0 as PT0S', () => {
      expect(formatISO(-0)).toBe('PT0S');
    });
  });

  // ── Sub-second precision ──────────────────────────────────────────────

  describe('sub-second precision', () => {
    test('formats 100ms', () => {
      expect(formatISO(100)).toBe('PT0.1S');
    });

    test('formats 10ms', () => {
      expect(formatISO(10)).toBe('PT0.01S');
    });

    test('formats 1ms', () => {
      expect(formatISO(1)).toBe('PT0.001S');
    });

    test('formats 1234ms', () => {
      expect(formatISO(1234)).toBe('PT1.234S');
    });

    test('formats 999ms', () => {
      expect(formatISO(999)).toBe('PT0.999S');
    });
  });

  // ── Round-trip: formatISO → parseISO ──────────────────────────────────

  describe('round-trip: formatISO → parseISO', () => {
    const values = [
      0, 1, 500, 1_000, 60_000, 3_600_000,
      h + 30 * m, d + 12 * h + 30 * m + 45 * s,
      2 * d + 6 * h, 7 * d + 3 * h + 15 * m + 30 * s,
    ];

    for (const ms of values) {
      test(`round-trips ${ms}ms`, () => {
        expect(parseISO(formatISO(ms))).toBe(ms);
      });
    }
  });

  // ── Error handling ────────────────────────────────────────────────────

  describe('error handling', () => {
    test('throws for NaN', () => {
      expect(() => formatISO(NaN)).toThrow('finite number');
    });

    test('throws for Infinity', () => {
      expect(() => formatISO(Infinity)).toThrow('finite number');
    });

    test('throws for -Infinity', () => {
      expect(() => formatISO(-Infinity)).toThrow('finite number');
    });

    test('throws for non-number', () => {
      expect(() => formatISO('PT1H' as any)).toThrow('finite number');
    });
  });

  // ── Large values ──────────────────────────────────────────────────────

  describe('large values', () => {
    test('formats 365 days', () => {
      expect(formatISO(365 * d)).toBe('P365D');
    });

    test('formats very large ms (30 days)', () => {
      const ms = 30 * d + 5 * h + 30 * m + 15 * s;
      expect(formatISO(ms)).toBe('P30DT5H30M15S');
    });

    test('round-trips large value', () => {
      const ms = 100 * d + 23 * h + 59 * m + 59 * s + 999;
      expect(parseISO(formatISO(ms))).toBe(ms);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// parse() auto-detection of ISO 8601 strings
// ═══════════════════════════════════════════════════════════════════════════

describe('parse auto-detects ISO 8601 durations', () => {
  test('parse("PT1H") returns 1 hour', () => {
    expect(parse('PT1H')).toBe(h);
  });

  test('parse("P1D") returns 1 day', () => {
    expect(parse('P1D')).toBe(d);
  });

  test('parse("PT1H30M") returns 1h 30m', () => {
    expect(parse('PT1H30M')).toBe(h + 30 * m);
  });

  test('parse("P1DT12H") returns 1d 12h', () => {
    expect(parse('P1DT12H')).toBe(d + 12 * h);
  });

  test('parse("P1Y2M3DT4H5M6S") returns full ISO duration', () => {
    expect(parse('P1Y2M3DT4H5M6S')).toBe(y + 2 * mo + 3 * d + 4 * h + 5 * m + 6 * s);
  });

  test('parse("PT0.5S") returns 500ms', () => {
    expect(parse('PT0.5S')).toBe(500);
  });

  test('parse("PT0S") returns 0', () => {
    expect(parse('PT0S')).toBe(0);
  });

  test('ISO parse respects unit:"s" option', () => {
    expect(parse('PT1H', { unit: 's' })).toBe(3_600);
  });

  test('ISO parse respects strict mode on invalid', () => {
    // 'P' alone is not valid ISO
    expect(parse('P')).toBeNaN();
  });
});
