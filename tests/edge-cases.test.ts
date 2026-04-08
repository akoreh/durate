import { describe, test, expect } from 'vitest';
import { parse, MAX_TIMEOUT } from '../src';

describe('edge cases and errors', () => {
  test('should return NaN for unparseable string', () => {
    expect(parse('abc')).toBeNaN();
  });

  test('should return NaN for empty unit with letters', () => {
    expect(parse('10xyz')).toBeNaN();
  });

  test('should throw for empty string', () => {
    expect(() => parse('')).toThrow('parse()');
  });

  test('should throw for non-string input', () => {
    expect(() => parse(null as unknown as string)).toThrow('parse()');
  });

  test('should throw for string longer than 100 chars', () => {
    expect(() => parse('1' + 'x'.repeat(100))).toThrow();
  });

  test('should parse "0ms" as 0', () => {
    expect(parse('0ms')).toBe(0);
  });

  test('should parse "0" as 0', () => {
    expect(parse('0')).toBe(0);
  });

  test('should return NaN for string with valid duration preceded by text', () => {
    expect(parse('abc1s')).toBeNaN();
  });

  test('should accept string of exactly 100 characters', () => {
    const str = '1' + 's'.repeat(99);
    expect(parse(str)).toBeNaN();
  });

  describe('strict mode', () => {
    test('should throw for unparseable string', () => {
      expect(() => parse('abc', { strict: true })).toThrow('Invalid duration string');
    });

    test('should throw for empty unit with letters', () => {
      expect(() => parse('10xyz', { strict: true })).toThrow('Invalid duration string');
    });

    test('should still parse valid strings', () => {
      expect(parse('1h', { strict: true })).toBe(3_600_000);
    });

    test('should combine with unit option', () => {
      expect(parse('1m', { strict: true, unit: 's' })).toBe(60);
    });
  });

  describe('safeForTimer: throw', () => {
    test('should throw for durations exceeding MAX_TIMEOUT', () => {
      expect(() => parse('25d', { safeForTimer: 'throw' })).toThrow('maximum timer');
    });

    test('should throw for month duration', () => {
      expect(() => parse('1mo', { safeForTimer: 'throw' })).toThrow('maximum timer');
    });

    test('should throw for year duration', () => {
      expect(() => parse('1y', { safeForTimer: 'throw' })).toThrow('maximum timer');
    });

    test('should allow durations within MAX_TIMEOUT', () => {
      expect(parse('24d', { safeForTimer: 'throw' })).toBe(24 * 86_400_000);
    });

    test('should throw for negative durations exceeding MAX_TIMEOUT', () => {
      expect(() => parse('-25d', { safeForTimer: 'throw' })).toThrow('maximum timer');
    });

    test('should combine with unit option', () => {
      expect(parse('1h', { safeForTimer: 'throw', unit: 's' })).toBe(3_600);
    });
  });

  describe('safeForTimer: clamp', () => {
    test('should clamp durations exceeding MAX_TIMEOUT', () => {
      expect(parse('25d', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
    });

    test('should clamp month duration', () => {
      expect(parse('1mo', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
    });

    test('should clamp year duration', () => {
      expect(parse('1y', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
    });

    test('should not clamp durations within MAX_TIMEOUT', () => {
      expect(parse('24d', { safeForTimer: 'clamp' })).toBe(24 * 86_400_000);
    });

    test('should clamp negative durations to -MAX_TIMEOUT', () => {
      expect(parse('-25d', { safeForTimer: 'clamp' })).toBe(-MAX_TIMEOUT);
    });

    test('should combine with unit option', () => {
      expect(parse('1h', { safeForTimer: 'clamp', unit: 's' })).toBe(3_600);
    });

    test('should clamp in seconds when combined with unit: s', () => {
      expect(parse('1y', { safeForTimer: 'clamp', unit: 's' })).toBe(MAX_TIMEOUT / 1_000);
    });

    test('should clamp negative in seconds when combined with unit: s', () => {
      expect(parse('-1y', { safeForTimer: 'clamp', unit: 's' })).toBe(-MAX_TIMEOUT / 1_000);
    });
  });

  describe('safeForTimer: throw with unit: s', () => {
    test('should throw for durations exceeding MAX_TIMEOUT even in seconds', () => {
      expect(() => parse('1y', { safeForTimer: 'throw', unit: 's' })).toThrow('maximum timer');
    });

    test('should allow durations within MAX_TIMEOUT in seconds', () => {
      expect(parse('1h', { safeForTimer: 'throw', unit: 's' })).toBe(3_600);
    });
  });

  describe('MAX_TIMEOUT constant', () => {
    test('should equal 2^31 - 1', () => {
      expect(MAX_TIMEOUT).toBe(2 ** 31 - 1);
    });
  });
});
