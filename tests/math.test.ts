import { describe, expect, test } from 'vitest';
import { add, subtract, multiply, divide, gt, lt, eq, gte, lte } from '../src';
import { h, m, s, d } from '../src/constants';

// ═══════════════════════════════════════════════════════════════════════════
// add
// ═══════════════════════════════════════════════════════════════════════════

describe('add', () => {
  describe('variadic strings', () => {
    test('adds two duration strings', () => {
      expect(add('1h', '30m')).toBe(h + 30 * m);
    });

    test('adds three duration strings', () => {
      expect(add('1h', '30m', '15s')).toBe(h + 30 * m + 15 * s);
    });

    test('adds many durations', () => {
      expect(add('1d', '2h', '30m', '45s', '500ms')).toBe(d + 2 * h + 30 * m + 45 * s + 500);
    });

    test('adds compound strings', () => {
      expect(add('1h 30m', '2h 15m')).toBe(3 * h + 45 * m);
    });
  });

  describe('variadic numbers (ms)', () => {
    test('adds two numbers', () => {
      expect(add(1000, 2000)).toBe(3000);
    });

    test('adds multiple numbers', () => {
      expect(add(100, 200, 300)).toBe(600);
    });
  });

  describe('mixed string and number', () => {
    test('adds string and number', () => {
      expect(add('1h', 1000)).toBe(h + 1000);
    });

    test('adds number and string', () => {
      expect(add(5000, '30s')).toBe(5000 + 30 * s);
    });
  });

  describe('array input', () => {
    test('accepts array of strings', () => {
      expect(add(['1h', '30m'])).toBe(h + 30 * m);
    });

    test('accepts array of numbers', () => {
      expect(add([1000, 2000, 3000])).toBe(6000);
    });

    test('accepts mixed array', () => {
      expect(add(['1h', 1000, '30m'])).toBe(h + 1000 + 30 * m);
    });
  });

  describe('edge cases', () => {
    test('single value returns that value in ms', () => {
      expect(add('1h')).toBe(h);
    });

    test('single number returns that number', () => {
      expect(add(42)).toBe(42);
    });

    test('no arguments returns 0', () => {
      expect(add()).toBe(0);
    });

    test('empty array returns 0', () => {
      expect(add([])).toBe(0);
    });

    test('adding zero', () => {
      expect(add('1h', 0)).toBe(h);
    });

    test('negative durations', () => {
      expect(add('-1h', '30m')).toBe(-h + 30 * m);
    });

    test('negative numbers', () => {
      expect(add(1000, -500)).toBe(500);
    });

    test('returns NaN if any value is invalid', () => {
      expect(add('1h', 'garbage')).toBeNaN();
    });

    test('returns NaN if any value in array is invalid', () => {
      expect(add(['1h', 'garbage'])).toBeNaN();
    });

    test('ISO 8601 strings work', () => {
      expect(add('PT1H', 'PT30M')).toBe(h + 30 * m);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// subtract
// ═══════════════════════════════════════════════════════════════════════════

describe('subtract', () => {
  describe('variadic strings', () => {
    test('subtracts two durations', () => {
      expect(subtract('2d', '6h')).toBe(2 * d - 6 * h);
    });

    test('subtracts three durations', () => {
      expect(subtract('1d', '2h', '30m')).toBe(d - 2 * h - 30 * m);
    });
  });

  describe('variadic numbers', () => {
    test('subtracts numbers', () => {
      expect(subtract(10000, 3000, 2000)).toBe(5000);
    });
  });

  describe('mixed', () => {
    test('subtracts string from number', () => {
      expect(subtract(d, '6h')).toBe(d - 6 * h);
    });
  });

  describe('array input', () => {
    test('accepts array', () => {
      expect(subtract(['2d', '6h'])).toBe(2 * d - 6 * h);
    });

    test('accepts mixed array', () => {
      expect(subtract(['1d', 3_600_000])).toBe(d - h);
    });
  });

  describe('edge cases', () => {
    test('single value returns that value', () => {
      expect(subtract('1h')).toBe(h);
    });

    test('no arguments returns 0', () => {
      expect(subtract()).toBe(0);
    });

    test('empty array returns 0', () => {
      expect(subtract([])).toBe(0);
    });

    test('result can be negative', () => {
      expect(subtract('30m', '1h')).toBe(30 * m - h);
    });

    test('returns NaN if any value is invalid', () => {
      expect(subtract('1h', 'garbage')).toBeNaN();
    });

    test('returns NaN if first value is invalid', () => {
      expect(subtract('garbage', '1h')).toBeNaN();
    });

    test('subtracting zero', () => {
      expect(subtract('1h', 0)).toBe(h);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// multiply
// ═══════════════════════════════════════════════════════════════════════════

describe('multiply', () => {
  describe('basic', () => {
    test('multiplies string duration by scalar', () => {
      expect(multiply('1h', 2)).toBe(2 * h);
    });

    test('multiplies number duration by scalar', () => {
      expect(multiply(1000, 3)).toBe(3000);
    });

    test('multiplies by fractional scalar', () => {
      expect(multiply('2h', 0.5)).toBe(h);
    });

    test('multiplies by zero', () => {
      expect(multiply('1h', 0)).toBe(0);
    });
  });

  describe('chained multipliers', () => {
    test('multiplies by two scalars', () => {
      expect(multiply('1h', 2, 3)).toBe(6 * h);
    });

    test('multiplies by three scalars', () => {
      expect(multiply('1h', 2, 3, 4)).toBe(24 * h);
    });
  });

  describe('edge cases', () => {
    test('single argument (no multiplier) returns ms', () => {
      expect(multiply('1h')).toBe(h);
    });

    test('negative multiplier', () => {
      expect(multiply('1h', -1)).toBe(-h);
    });

    test('negative duration', () => {
      expect(multiply('-1h', 2)).toBe(-2 * h);
    });

    test('returns NaN for invalid duration', () => {
      expect(multiply('garbage', 2)).toBeNaN();
    });

    test('returns NaN for NaN multiplier', () => {
      expect(multiply('1h', NaN)).toBeNaN();
    });

    test('Infinity multiplier returns Infinity', () => {
      expect(multiply('1h', Infinity)).toBe(Infinity);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// divide
// ═══════════════════════════════════════════════════════════════════════════

describe('divide', () => {
  describe('basic', () => {
    test('divides string duration by scalar', () => {
      expect(divide('2h', 2)).toBe(h);
    });

    test('divides number duration by scalar', () => {
      expect(divide(6000, 3)).toBe(2000);
    });

    test('divides with fractional result', () => {
      expect(divide('1h', 4)).toBe(h / 4);
    });
  });

  describe('chained divisors', () => {
    test('divides by two scalars', () => {
      expect(divide('1d', 2, 3)).toBe(d / 6);
    });

    test('divides by three scalars', () => {
      expect(divide('24h', 2, 3, 4)).toBe(h);
    });
  });

  describe('edge cases', () => {
    test('single argument (no divisor) returns ms', () => {
      expect(divide('1h')).toBe(h);
    });

    test('divide by zero returns NaN', () => {
      expect(divide('1h', 0)).toBeNaN();
    });

    test('second divisor is zero returns NaN', () => {
      expect(divide('1h', 2, 0)).toBeNaN();
    });

    test('negative divisor', () => {
      expect(divide('2h', -2)).toBe(-h);
    });

    test('returns NaN for invalid duration', () => {
      expect(divide('garbage', 2)).toBeNaN();
    });

    test('returns NaN for NaN divisor', () => {
      expect(divide('1h', NaN)).toBeNaN();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// gt
// ═══════════════════════════════════════════════════════════════════════════

describe('gt', () => {
  test('1h > 30m is true', () => {
    expect(gt('1h', '30m')).toBe(true);
  });

  test('30m > 1h is false', () => {
    expect(gt('30m', '1h')).toBe(false);
  });

  test('1h > 1h is false', () => {
    expect(gt('1h', '1h')).toBe(false);
  });

  test('works with numbers', () => {
    expect(gt(5000, 3000)).toBe(true);
  });

  test('works with mixed types', () => {
    expect(gt('1h', 1000)).toBe(true);
  });

  test('equivalent durations in different units', () => {
    expect(gt('60m', '1h')).toBe(false);
  });

  test('returns false when either is NaN', () => {
    expect(gt('garbage', '1h')).toBe(false);
    expect(gt('1h', 'garbage')).toBe(false);
  });

  test('negative vs positive', () => {
    expect(gt('1h', '-1h')).toBe(true);
    expect(gt('-1h', '1h')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// lt
// ═══════════════════════════════════════════════════════════════════════════

describe('lt', () => {
  test('30m < 1h is true', () => {
    expect(lt('30m', '1h')).toBe(true);
  });

  test('1h < 30m is false', () => {
    expect(lt('1h', '30m')).toBe(false);
  });

  test('1h < 1h is false', () => {
    expect(lt('1h', '1h')).toBe(false);
  });

  test('works with numbers', () => {
    expect(lt(1000, 5000)).toBe(true);
  });

  test('returns false when either is NaN', () => {
    expect(lt('garbage', '1h')).toBe(false);
    expect(lt('1h', 'garbage')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// eq
// ═══════════════════════════════════════════════════════════════════════════

describe('eq', () => {
  test('1h == 1h is true', () => {
    expect(eq('1h', '1h')).toBe(true);
  });

  test('60m == 1h is true', () => {
    expect(eq('60m', '1h')).toBe(true);
  });

  test('1h == 30m is false', () => {
    expect(eq('1h', '30m')).toBe(false);
  });

  test('3600000 == 1h is true', () => {
    expect(eq(3_600_000, '1h')).toBe(true);
  });

  test('number and number', () => {
    expect(eq(1000, 1000)).toBe(true);
  });

  test('returns false when either is NaN', () => {
    expect(eq('garbage', '1h')).toBe(false);
    expect(eq('1h', 'garbage')).toBe(false);
  });

  test('NaN is not equal to NaN', () => {
    expect(eq('garbage', 'garbage')).toBe(false);
  });

  test('equivalent compound', () => {
    expect(eq('1h 30m', '90m')).toBe(true);
  });

  test('ISO and human duration', () => {
    expect(eq('PT1H', '1h')).toBe(true);
  });

  test('zero variants', () => {
    expect(eq(0, '0ms')).toBe(true);
    expect(eq('0s', '0')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// gte
// ═══════════════════════════════════════════════════════════════════════════

describe('gte', () => {
  test('1h >= 30m is true', () => {
    expect(gte('1h', '30m')).toBe(true);
  });

  test('1h >= 1h is true', () => {
    expect(gte('1h', '1h')).toBe(true);
  });

  test('30m >= 1h is false', () => {
    expect(gte('30m', '1h')).toBe(false);
  });

  test('returns false when either is NaN', () => {
    expect(gte('garbage', '1h')).toBe(false);
    expect(gte('1h', 'garbage')).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// lte
// ═══════════════════════════════════════════════════════════════════════════

describe('lte', () => {
  test('30m <= 1h is true', () => {
    expect(lte('30m', '1h')).toBe(true);
  });

  test('1h <= 1h is true', () => {
    expect(lte('1h', '1h')).toBe(true);
  });

  test('1h <= 30m is false', () => {
    expect(lte('1h', '30m')).toBe(false);
  });

  test('returns false when either is NaN', () => {
    expect(lte('garbage', '1h')).toBe(false);
    expect(lte('1h', 'garbage')).toBe(false);
  });
});
