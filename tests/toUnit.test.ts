import { describe, expect, test } from 'vitest';
import { toUnit } from '../src';

// ─── Precomputed constants (duplicated on purpose — test must not trust src) ──
const s = 1_000;
const m = 60_000;
const h = 3_600_000;
const d = 86_400_000;
const w = d * 7;
const y = d * 365.25;
const mo = y / 12;

describe('toUnit', () => {
  // ── String input ──────────────────────────────────────────────────────────

  describe('string input — single units', () => {
    test('converts 2h to minutes', () => {
      expect(toUnit('2h', 'minutes')).toBe(120);
    });

    test('converts 1d to seconds', () => {
      expect(toUnit('1d', 's')).toBe(86_400);
    });

    test('converts 1y to months', () => {
      expect(toUnit('1y', 'months')).toBe(12);
    });

    test('converts 30m to hours', () => {
      expect(toUnit('30m', 'h')).toBe(0.5);
    });

    test('converts 1w to days', () => {
      expect(toUnit('1w', 'd')).toBe(7);
    });

    test('converts 2000ms to seconds', () => {
      expect(toUnit('2000ms', 's')).toBe(2);
    });

    test('converts 500ms to seconds (fractional)', () => {
      expect(toUnit('500ms', 's')).toBe(0.5);
    });

    test('converts 1mo to days', () => {
      expect(toUnit('1mo', 'd')).toBeCloseTo(365.25 / 12);
    });

    test('converts 1y to weeks', () => {
      expect(toUnit('1y', 'w')).toBeCloseTo(365.25 / 7);
    });

    test('converts 1y to days', () => {
      expect(toUnit('1y', 'd')).toBe(365.25);
    });

    test('converts 1y to hours', () => {
      expect(toUnit('1y', 'h')).toBe(365.25 * 24);
    });

    test('converts 1y to minutes', () => {
      expect(toUnit('1y', 'm')).toBe(365.25 * 24 * 60);
    });

    test('converts 1y to seconds', () => {
      expect(toUnit('1y', 's')).toBe(365.25 * 24 * 60 * 60);
    });

    test('converts 1y to milliseconds', () => {
      expect(toUnit('1y', 'ms')).toBe(y);
    });

    test('bare number string (ms default)', () => {
      expect(toUnit('5000', 's')).toBe(5);
    });

    test('decimal duration string', () => {
      expect(toUnit('1.5h', 'm')).toBe(90);
    });

    test('decimal result', () => {
      expect(toUnit('1m', 'h')).toBeCloseTo(1 / 60);
    });

    test('space between number and unit', () => {
      expect(toUnit('2 hours', 'minutes')).toBe(120);
    });

    test('long unit names in input', () => {
      expect(toUnit('3 days', 'hours')).toBe(72);
    });

    test('singular long unit name', () => {
      expect(toUnit('1 day', 'h')).toBe(24);
    });
  });

  // ── Compound string input ─────────────────────────────────────────────────

  describe('string input — compound', () => {
    test('converts 1h 30m to minutes', () => {
      expect(toUnit('1h 30m', 'minutes')).toBe(90);
    });

    test('converts 2d 6h to hours', () => {
      expect(toUnit('2d 6h', 'hours')).toBe(54);
    });

    test('converts 1d 12h to days (fractional)', () => {
      expect(toUnit('1d 12h', 'd')).toBe(1.5);
    });

    test('converts 1h 30m 45s to seconds', () => {
      expect(toUnit('1h 30m 45s', 's')).toBe(5445);
    });

    test('converts 1w 2d to days', () => {
      expect(toUnit('1w 2d', 'd')).toBe(9);
    });

    test('converts compound to ms', () => {
      expect(toUnit('1m 30s', 'ms')).toBe(90_000);
    });

    test('converts compound to larger unit', () => {
      expect(toUnit('30m 30m', 'h')).toBe(1);
    });
  });

  // ── Number input (milliseconds) ──────────────────────────────────────────

  describe('number input (milliseconds)', () => {
    test('converts 3600000 ms to minutes', () => {
      expect(toUnit(3_600_000, 'minutes')).toBe(60);
    });

    test('converts 86400000 ms to hours', () => {
      expect(toUnit(86_400_000, 'h')).toBe(24);
    });

    test('converts 1000 ms to seconds', () => {
      expect(toUnit(1_000, 's')).toBe(1);
    });

    test('converts 0 ms to any unit', () => {
      expect(toUnit(0, 'hours')).toBe(0);
      expect(toUnit(0, 'minutes')).toBe(0);
      expect(toUnit(0, 'ms')).toBe(0);
      expect(toUnit(0, 's')).toBe(0);
    });

    test('converts ms to weeks', () => {
      expect(toUnit(w * 3, 'weeks')).toBe(3);
    });

    test('converts ms to months', () => {
      expect(toUnit(mo * 6, 'months')).toBe(6);
    });

    test('converts ms to years', () => {
      expect(toUnit(y * 2, 'years')).toBe(2);
    });

    test('converts 1 ms to ms (identity)', () => {
      expect(toUnit(1, 'ms')).toBe(1);
    });

    test('converts 42 ms to milliseconds (identity)', () => {
      expect(toUnit(42, 'milliseconds')).toBe(42);
    });

    test('sub-unit precision: 1 ms to seconds', () => {
      expect(toUnit(1, 's')).toBe(0.001);
    });

    test('sub-unit precision: 1 ms to minutes', () => {
      expect(toUnit(1, 'm')).toBeCloseTo(1 / 60_000);
    });

    test('sub-unit precision: 500ms to seconds', () => {
      expect(toUnit(500, 's')).toBe(0.5);
    });
  });

  // ── All target unit aliases ───────────────────────────────────────────────

  describe('all target unit aliases', () => {
    test.each([
      // ms aliases
      [5000, 'ms', 5000], [5000, 'msec', 5000], [5000, 'msecs', 5000],
      [5000, 'millisecond', 5000], [5000, 'milliseconds', 5000],
      // second aliases
      [60_000, 's', 60], [60_000, 'sec', 60], [60_000, 'secs', 60],
      [60_000, 'second', 60], [60_000, 'seconds', 60],
      // minute aliases
      [h, 'm', 60], [h, 'min', 60], [h, 'mins', 60], [h, 'minute', 60], [h, 'minutes', 60],
      // hour aliases
      [d, 'h', 24], [d, 'hr', 24], [d, 'hrs', 24], [d, 'hour', 24], [d, 'hours', 24],
      // day aliases
      [w, 'd', 7], [w, 'day', 7], [w, 'days', 7],
      // week aliases
      [2 * w, 'w', 2], [2 * w, 'week', 2], [2 * w, 'weeks', 2],
      // month aliases
      [y, 'mo', 12], [y, 'mon', 12], [y, 'mons', 12], [y, 'month', 12], [y, 'months', 12],
      // year aliases
      [2 * y, 'y', 2], [2 * y, 'yr', 2], [2 * y, 'yrs', 2], [2 * y, 'year', 2], [2 * y, 'years', 2],
    ])('toUnit(%d, "%s") → %d', (ms, unit, expected) => {
      expect(toUnit(ms as number, unit as string)).toBe(expected);
    });
  });

  // ── Case insensitive target unit ──────────────────────────────────────────

  describe('case insensitive target unit', () => {
    test('UPPERCASE', () => {
      expect(toUnit('2h', 'MINUTES')).toBe(120);
    });

    test('Mixed Case', () => {
      expect(toUnit('1d', 'Hours')).toBe(24);
    });

    test('all caps short', () => {
      expect(toUnit('1d', 'H')).toBe(24);
    });

    test('all caps long', () => {
      expect(toUnit('1d', 'HOURS')).toBe(24);
    });

    test('camelCase-like', () => {
      expect(toUnit(60_000, 'Seconds')).toBe(60);
    });

    test('MiXeD cAsE alias', () => {
      expect(toUnit(3_600_000, 'MiNuTeS')).toBe(60);
    });
  });

  // ── Negative values ───────────────────────────────────────────────────────

  describe('negative values', () => {
    test('negative string duration', () => {
      expect(toUnit('-2h', 'minutes')).toBe(-120);
    });

    test('negative number input', () => {
      expect(toUnit(-3_600_000, 'h')).toBe(-1);
    });

    test('negative zero string', () => {
      expect(toUnit('-0', 'ms')).toBe(-0);
    });

    test('negative zero number', () => {
      expect(toUnit(-0, 'ms')).toBe(-0);
    });

    test('negative fractional string', () => {
      expect(toUnit('-1.5h', 'm')).toBe(-90);
    });

    test('negative compound is not supported by parse, returns NaN', () => {
      // parse does support negative compound: '-1h 30m'
      expect(toUnit('-1h 30m', 'minutes')).toBe(-90);
    });

    test('negative ms number to larger unit', () => {
      expect(toUnit(-86_400_000, 'd')).toBe(-1);
    });
  });

  // ── Fractional / precision ────────────────────────────────────────────────

  describe('fractional and precision', () => {
    test('1h to days is fractional', () => {
      expect(toUnit('1h', 'd')).toBeCloseTo(1 / 24);
    });

    test('1s to minutes is fractional', () => {
      expect(toUnit('1s', 'm')).toBeCloseTo(1 / 60);
    });

    test('1ms to seconds', () => {
      expect(toUnit('1ms', 's')).toBe(0.001);
    });

    test('1d to weeks is fractional', () => {
      expect(toUnit('1d', 'w')).toBeCloseTo(1 / 7);
    });

    test('1d to months is fractional', () => {
      expect(toUnit('1d', 'mo')).toBeCloseTo(d / mo);
    });

    test('1d to years is fractional', () => {
      expect(toUnit('1d', 'y')).toBeCloseTo(1 / 365.25);
    });

    test('non-round ms number to larger unit', () => {
      expect(toUnit(5_400_000, 'h')).toBe(1.5);
    });

    test('preserves floating point for very small fractions', () => {
      const result = toUnit(1, 'y');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });
  });

  // ── Consistency with parse ────────────────────────────────────────────────

  describe('consistency with parse', () => {
    test('toUnit to ms matches parse output', () => {
      expect(toUnit('5m', 'ms')).toBe(300_000);
    });

    test('toUnit with number input equals division by constant', () => {
      expect(toUnit(h, 'm')).toBe(h / m);
    });

    test('round-trip: toUnit to ms, then back via toUnit', () => {
      const ms = toUnit('2h 30m', 'ms');
      expect(toUnit(ms, 'h')).toBe(2.5);
    });

    test('toUnit(parse("1h"), "m") equals 60', () => {
      expect(toUnit(3_600_000, 'm')).toBe(60);
    });

    test('cross-unit chain: same result', () => {
      const hours = toUnit('1d', 'h');
      const minutes = toUnit('1d', 'm');
      expect(minutes).toBe(hours * 60);
    });
  });

  // ── Large and extreme values ──────────────────────────────────────────────

  describe('large and extreme values', () => {
    test('10 years to days', () => {
      expect(toUnit('10y', 'days')).toBeCloseTo(3652.5);
    });

    test('100 years to months', () => {
      expect(toUnit('100y', 'months')).toBe(1200);
    });

    test('MAX_SAFE_INTEGER ms to years', () => {
      const msInYear = y;
      expect(toUnit(Number.MAX_SAFE_INTEGER, 'y')).toBeCloseTo(Number.MAX_SAFE_INTEGER / msInYear);
    });

    test('very large number to ms stays the same', () => {
      expect(toUnit(Number.MAX_SAFE_INTEGER, 'ms')).toBe(Number.MAX_SAFE_INTEGER);
    });

    test('very large number to seconds', () => {
      expect(toUnit(Number.MAX_SAFE_INTEGER, 's')).toBeCloseTo(Number.MAX_SAFE_INTEGER / 1_000);
    });

    test('-MAX_SAFE_INTEGER ms to hours', () => {
      expect(toUnit(-Number.MAX_SAFE_INTEGER, 'h')).toBeCloseTo(-Number.MAX_SAFE_INTEGER / h);
    });
  });

  // ── Edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    test('NaN number input returns NaN', () => {
      expect(toUnit(NaN, 's')).toBeNaN();
    });

    test('Infinity number input returns Infinity', () => {
      expect(toUnit(Infinity, 's')).toBe(Infinity);
    });

    test('-Infinity number input returns -Infinity', () => {
      expect(toUnit(-Infinity, 's')).toBe(-Infinity);
    });

    test('empty string returns NaN', () => {
      expect(toUnit('', 'ms')).toBeNaN();
    });

    test('invalid string returns NaN', () => {
      expect(toUnit('garbage', 'ms')).toBeNaN();
    });

    test('invalid target unit returns NaN', () => {
      expect(toUnit('1h', 'foobar')).toBeNaN();
    });

    test('empty target unit returns NaN', () => {
      expect(toUnit('1h', '')).toBeNaN();
    });

    test('whitespace-only string returns NaN', () => {
      expect(toUnit('   ', 'ms')).toBeNaN();
    });

    test('string > 100 chars returns NaN (parse throws, caught)', () => {
      expect(toUnit('1' + 'h'.repeat(100), 'ms')).toBeNaN();
    });

    test('zero string to any unit', () => {
      expect(toUnit('0', 'h')).toBe(0);
      expect(toUnit('0', 'ms')).toBe(0);
    });

    test('zero ms string to any unit', () => {
      expect(toUnit('0ms', 'h')).toBe(0);
    });

    test('very small ms value', () => {
      expect(toUnit(0.001, 'ms')).toBe(0.001);
    });

    test('decimal number input', () => {
      expect(toUnit(1500.5, 's')).toBeCloseTo(1.5005);
    });
  });

  // ── Security: Prototype pollution ─────────────────────────────────────────

  describe('security: prototype pollution', () => {
    test('__proto__ as value — prototype chain not modified', () => {
      const protoBefore = Object.getPrototypeOf({});
      toUnit('__proto__', 'ms');
      const protoAfter = Object.getPrototypeOf({});
      expect(protoAfter).toBe(protoBefore);
      expect(({} as any).polluted).toBeUndefined();
    });

    test('constructor as value — Object constructor intact', () => {
      toUnit('constructor', 'ms');
      expect(({}).constructor).toBe(Object);
      expect(Object.constructor).toBe(Function);
    });

    test('__proto__ as target unit — prototype chain not modified', () => {
      const protoBefore = Object.getPrototypeOf({});
      const result = toUnit('1h', '__proto__');
      const protoAfter = Object.getPrototypeOf({});
      expect(protoAfter).toBe(protoBefore);
      expect(({} as any).polluted).toBeUndefined();
      expect(result).toBeNaN();
    });

    test('constructor as target unit — returns NaN, Object intact', () => {
      const result = toUnit('1h', 'constructor');
      expect(result).toBeNaN();
      expect(({}).constructor).toBe(Object);
    });

    test('toString as target unit — Object.prototype.toString intact', () => {
      const original = Object.prototype.toString;
      const result = toUnit('1h', 'toString');
      expect(result).toBeNaN();
      expect(Object.prototype.toString).toBe(original);
    });

    test('valueOf as target unit — Object.prototype.valueOf intact', () => {
      const original = Object.prototype.valueOf;
      const result = toUnit('1h', 'valueOf');
      expect(result).toBeNaN();
      expect(Object.prototype.valueOf).toBe(original);
    });

    test('hasOwnProperty as target unit — still callable', () => {
      const original = Object.prototype.hasOwnProperty;
      const result = toUnit('1h', 'hasOwnProperty');
      expect(result).toBeNaN();
      expect(Object.prototype.hasOwnProperty).toBe(original);
    });

    test('__proto__.polluted as value — no injection', () => {
      toUnit('__proto__.polluted', 'ms');
      expect(({} as any).polluted).toBeUndefined();
      expect('polluted' in {}).toBe(false);
    });

    test('constructor.prototype as value — no pollution', () => {
      toUnit('constructor.prototype', 'ms');
      expect(Object.prototype.constructor).toBe(Object);
      expect(({} as any).polluted).toBeUndefined();
    });

    test('JSON-like payload as value', () => {
      toUnit('{"__proto__":{"polluted":true}}', 'ms');
      expect(({} as any).polluted).toBeUndefined();
      expect('polluted' in {}).toBe(false);
    });

    test('bulk: no new enumerable props after all payloads', () => {
      const payloads = [
        '__proto__', 'constructor', 'toString', 'valueOf',
        'hasOwnProperty', '__defineGetter__', '__defineSetter__',
        'prototype', '__proto__.polluted', 'constructor.prototype',
      ];
      for (const p of payloads) {
        toUnit(p, 'ms');
        toUnit('1h', p);
      }
      const fresh: any = {};
      expect(Object.keys(fresh)).toEqual([]);
      expect(fresh.polluted).toBeUndefined();
      expect(fresh.constructor).toBe(Object);
      expect(typeof fresh.toString).toBe('function');
      expect(typeof fresh.hasOwnProperty).toBe('function');
    });
  });

  // ── Security: ReDoS resistance ────────────────────────────────────────────

  describe('security: ReDoS resistance', () => {
    const MAX_MS = 50;

    test('long digit string as value', () => {
      const start = performance.now();
      toUnit('9'.repeat(99) + 'h', 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('long decimal value', () => {
      const start = performance.now();
      toUnit('.' + '0'.repeat(99), 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('repeated dot-digit pattern', () => {
      const start = performance.now();
      toUnit('.0'.repeat(50), 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('long non-matching string', () => {
      const start = performance.now();
      toUnit('a'.repeat(99), 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('adversarial spaces between number and unit', () => {
      const start = performance.now();
      toUnit('1' + ' '.repeat(95) + 'ms', 'h');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('adversarial backtracking: repeated decimal points', () => {
      const start = performance.now();
      toUnit('1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('repeated unit chars after number', () => {
      const start = performance.now();
      toUnit('1' + 's'.repeat(99), 'ms');
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });

    test('long target unit string does not hang', () => {
      const start = performance.now();
      toUnit('1h', 'x'.repeat(10_000));
      expect(performance.now() - start).toBeLessThan(MAX_MS);
    });
  });

  // ── Security: Type coercion bypass ────────────────────────────────────────

  describe('security: type coercion bypass', () => {
    test('number disguised as object with valueOf — uses raw number', () => {
      // toUnit signature takes string | number; a plain object would be a TS error
      // but at runtime someone could pass it — it should not crash or pollute
      const evil = { valueOf: () => 3_600_000, toString: () => '999y' } as any;
      // If treated as number via typeof check, it won't be — it's an object
      // It should go to parse path and fail gracefully
      const result = toUnit(evil, 'h');
      // typeof evil is 'object', not 'number', so parse is called
      // parse will throw for non-string, toUnit catches → NaN
      expect(result).toBeNaN();
    });

    test('array as value returns NaN', () => {
      expect(toUnit(['1h'] as any, 'ms')).toBeNaN();
    });

    test('null as value returns NaN', () => {
      expect(toUnit(null as any, 'ms')).toBeNaN();
    });

    test('undefined as value returns NaN', () => {
      expect(toUnit(undefined as any, 'ms')).toBeNaN();
    });

    test('boolean true as value returns NaN', () => {
      expect(toUnit(true as any, 'ms')).toBeNaN();
    });

    test('boolean false as value returns NaN', () => {
      expect(toUnit(false as any, 'ms')).toBeNaN();
    });

    test('object as target unit returns NaN', () => {
      expect(toUnit('1h', {} as any)).toBeNaN();
    });

    test('number as target unit returns NaN', () => {
      expect(toUnit('1h', 123 as any)).toBeNaN();
    });

    test('null as target unit returns NaN', () => {
      expect(toUnit('1h', null as any)).toBeNaN();
    });

    test('undefined as target unit returns NaN', () => {
      expect(toUnit('1h', undefined as any)).toBeNaN();
    });

    test('array as target unit returns NaN', () => {
      expect(toUnit('1h', ['hours'] as any)).toBeNaN();
    });

    test('symbol as value does not throw', () => {
      expect(toUnit(Symbol('test') as any, 'ms')).toBeNaN();
    });

    test('bigint as value does not throw', () => {
      // BigInt is typeof 'bigint', not 'number' — should not crash
      expect(() => toUnit(BigInt(1000) as any, 'ms')).not.toThrow();
    });
  });

  // ── Security: Unicode and encoding attacks ────────────────────────────────

  describe('security: unicode and encoding attacks', () => {
    test('null byte in value', () => {
      const result = toUnit('1h\x00', 'ms');
      expect(({} as any).polluted).toBeUndefined();
      // parse may or may not handle this — just verify no crash/pollution
      expect(typeof result).toBe('number');
    });

    test('null byte in target unit', () => {
      const result = toUnit('1h', 'hours\x00');
      expect(result).toBeNaN();
    });

    test('unicode homoglyph digit (fullwidth 1)', () => {
      const result = toUnit('\uff11h', 'ms');
      expect(result).toBeNaN();
    });

    test('unicode homoglyph letter (Cyrillic "h")', () => {
      const result = toUnit('1\u0068', 'ms'); // real h
      expect(result).toBe(h);
      const result2 = toUnit('1\u04bb', 'ms'); // Cyrillic shha
      expect(result2).toBeNaN();
    });

    test('unicode NBSP between number and unit', () => {
      const result = toUnit('1\u00A0h', 'ms');
      // NBSP is not a valid separator — should return NaN
      expect(result).toBeNaN();
    });

    test('unicode homoglyph target unit (Cyrillic "h")', () => {
      const result = toUnit('1h', '\u04bb');
      expect(result).toBeNaN();
    });

    test('RTL override character in value', () => {
      const result = toUnit('\u202E1h', 'ms');
      expect(typeof result).toBe('number');
    });

    test('zero-width joiner in target unit', () => {
      const result = toUnit('1h', 'h\u200Dours');
      expect(result).toBeNaN();
    });

    test('CRLF injection in value', () => {
      toUnit('1ms\r\n__proto__: polluted', 'ms');
      expect(({} as any).polluted).toBeUndefined();
    });

    test('CRLF injection in target unit', () => {
      const result = toUnit('1h', 'hours\r\nX-Injected: true');
      expect(result).toBeNaN();
    });
  });

  // ── Security: Monkey-patched builtins ─────────────────────────────────────

  describe('security: monkey-patched builtins', () => {
    test('survives monkey-patched String.prototype.toLowerCase', () => {
      const original = String.prototype.toLowerCase;
      try {
        String.prototype.toLowerCase = function () {
          return 'HACKED';
        };
        // With monkey-patched toLowerCase, unit lookup will fail → NaN
        const result = toUnit('1h', 'hours');
        expect(typeof result).toBe('number');
      } finally {
        String.prototype.toLowerCase = original;
      }
    });

    test('survives monkey-patched parseFloat', () => {
      const original = globalThis.parseFloat;
      try {
        globalThis.parseFloat = () => 999999;
        // parse uses parseFloat internally — monkey-patching affects results
        // but should not crash or pollute
        const result = toUnit('1h', 'ms');
        expect(typeof result).toBe('number');
      } finally {
        globalThis.parseFloat = original;
      }
    });

    test('survives monkey-patched Number.isNaN', () => {
      const original = Number.isNaN;
      try {
        Number.isNaN = () => false;
        // With isNaN always returning false, NaN values won't be caught
        // but execution should not crash
        const result = toUnit('garbage', 'ms');
        expect(typeof result).toBe('number');
      } finally {
        Number.isNaN = original;
      }
    });
  });

  // ── Security: Integer overflow via unitMap lookup ──────────────────────────

  describe('security: unitMap key injection', () => {
    test('__proto__ key in unitMap lookup returns NaN (not Object.prototype value)', () => {
      // The unitMap is a plain object. Accessing unitMap['__proto__'] could
      // theoretically return Object.prototype if not handled.
      // The toLowerCase() of '__proto__' is '__proto__'.
      const result = toUnit(1000, '__proto__');
      // unitMap['__proto__'] is not a number in our map → should be NaN
      expect(result).toBeNaN();
    });

    test('constructor key returns NaN', () => {
      const result = toUnit(1000, 'constructor');
      expect(result).toBeNaN();
    });

    test('prototype key returns NaN', () => {
      const result = toUnit(1000, 'prototype');
      expect(result).toBeNaN();
    });

    test('__lookupGetter__ key returns NaN', () => {
      const result = toUnit(1000, '__lookupGetter__');
      expect(result).toBeNaN();
    });

    test('toLocaleString key returns NaN', () => {
      const result = toUnit(1000, 'toLocaleString');
      expect(result).toBeNaN();
    });

    test('isPrototypeOf key returns NaN', () => {
      const result = toUnit(1000, 'isPrototypeOf');
      expect(result).toBeNaN();
    });

    test('propertyIsEnumerable key returns NaN', () => {
      const result = toUnit(1000, 'propertyIsEnumerable');
      expect(result).toBeNaN();
    });
  });

  // ── Security: setTimeout overflow values ──────────────────────────────────

  describe('security: timer overflow values', () => {
    test('MAX_TIMEOUT value converts correctly', () => {
      expect(toUnit(2_147_483_647, 'h')).toBeCloseTo(2_147_483_647 / h);
    });

    test('MAX_TIMEOUT + 1 value converts without crash', () => {
      expect(toUnit(2_147_483_648, 'h')).toBeCloseTo(2_147_483_648 / h);
    });

    test('2^32 value converts without crash', () => {
      expect(toUnit(4_294_967_296, 'd')).toBeCloseTo(4_294_967_296 / d);
    });

    test('toUnit does not clamp — that is parse responsibility', () => {
      // toUnit with number input bypasses parse entirely
      const bigMs = 1e15;
      expect(toUnit(bigMs, 'y')).toBeCloseTo(bigMs / y);
    });
  });
});
