import { describe, test, expect } from 'vitest';
import durate, { MAX_TIMEOUT } from '../src';

describe('durate (bidirectional)', () => {
  test('should parse string to number', () => {
    expect(durate('5m')).toBe(300_000);
  });

  test('should format number to string', () => {
    expect(durate(300_000)).toBe('5m');
  });

  test('should format number to long string', () => {
    expect(durate(300_000, { long: true })).toBe('5 minutes');
  });

  test('should throw for non-string non-number', () => {
    expect(() => durate(true as unknown as number)).toThrow('durate()');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 26. DURATE — bidirectional with options
// ─────────────────────────────────────────────────────────────────────────────
describe('durate: bidirectional with options', () => {
  test('durate(string) returns ms', () => {
    expect(durate('1h')).toBe(3_600_000);
  });

  test('durate(number) returns short string', () => {
    expect(durate(3_600_000)).toBe('1h');
  });

  test('durate(string, { unit: "s" }) returns seconds', () => {
    expect(durate('1h', { unit: 's' })).toBe(3_600);
  });

  test('durate(number, { compound: true }) returns compound string', () => {
    expect(durate(5_425_000, { compound: true })).toBe('1h 30m 25s');
  });

  test('durate(number, { template: "HH:mm:ss" }) returns template string', () => {
    expect(durate(5_425_000, { template: 'HH:mm:ss' })).toBe('01:30:25');
  });

  test('durate(number, { long: true }) returns long string', () => {
    expect(durate(3_600_000, { long: true })).toBe('1 hour');
  });

  test('durate(number, { precision: 1 }) returns precision string', () => {
    expect(durate(5_400_000, { precision: 1 })).toBe('1.5h');
  });

  test('durate(compound string) returns ms', () => {
    expect(durate('1h 30m')).toBe(5_400_000);
  });

  test('durate(string, { safeForTimer: "clamp" }) clamps', () => {
    expect(durate('30d', { safeForTimer: 'clamp' })).toBe(MAX_TIMEOUT);
  });

  test('durate(string, { safeForTimer: "throw" }) throws', () => {
    expect(() => durate('30d', { safeForTimer: 'throw' })).toThrow('maximum timer');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 51. DURATE error messages
// ─────────────────────────────────────────────────────────────────────────────
describe('durate error messages', () => {
  test('durate non-string non-number throws', () => {
    expect(() => durate(null as any)).toThrow('durate()');
  });
});
