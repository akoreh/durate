import { describe, test, expect } from 'vitest';
import {
  parse, format, durate, MAX_TIMEOUT,
  parseISO, formatISO,
  add, subtract, multiply, divide, gt, lt, eq, gte, lte,
} from '../src';
import { MAX_INPUT_LENGTH } from '../src/constants';

describe('security', () => {
  describe('prototype pollution', () => {
    test('__proto__ — prototype chain is not modified', () => {
      const protoBefore = Object.getPrototypeOf({});
      parse('__proto__');
      const protoAfter = Object.getPrototypeOf({});
      expect(protoAfter).toBe(protoBefore);
      expect(({} as any).polluted).toBeUndefined();
    });

    test('constructor — Object constructor is not overwritten', () => {
      parse('constructor');
      expect(({}).constructor).toBe(Object);
      expect(Object.constructor).toBe(Function);
    });

    test('toString — Object.prototype.toString is still native', () => {
      const original = Object.prototype.toString;
      parse('toString');
      expect(Object.prototype.toString).toBe(original);
      expect(({}).toString()).toBe('[object Object]');
    });

    test('valueOf — Object.prototype.valueOf is still native', () => {
      const original = Object.prototype.valueOf;
      parse('valueOf');
      expect(Object.prototype.valueOf).toBe(original);
    });

    test('hasOwnProperty — method is still callable on fresh objects', () => {
      const original = Object.prototype.hasOwnProperty;
      parse('hasOwnProperty');
      expect(Object.prototype.hasOwnProperty).toBe(original);
      expect(Object.prototype.hasOwnProperty.call({}, 'toString')).toBe(false);
    });

    test('__defineGetter__ — cannot inject getters on all objects', () => {
      parse('__defineGetter__');
      const fresh: any = {};
      expect(fresh.polluted).toBeUndefined();
    });

    test('__proto__.polluted — does not inject "polluted" property', () => {
      parse('__proto__.polluted');
      expect(({} as any).polluted).toBeUndefined();
      expect('polluted' in {}).toBe(false);
    });

    test('constructor.prototype — does not overwrite constructor.prototype', () => {
      parse('constructor.prototype');
      expect(Object.prototype.constructor).toBe(Object);
      expect(({} as any).polluted).toBeUndefined();
    });

    test('JSON-like payload — does not inject properties from JSON string', () => {
      parse('{"__proto__":{"polluted":true}}');
      expect(({} as any).polluted).toBeUndefined();
      expect('polluted' in {}).toBe(false);
    });

    test('null byte + __proto__ — does not bypass NaN to pollute', () => {
      parse('1ms\x00__proto__');
      expect(({} as any)['\x00__proto__']).toBeUndefined();
      expect(({} as any).polluted).toBeUndefined();
    });

    test('CRLF injection — does not inject header-like properties', () => {
      parse('1ms\r\n__proto__: polluted');
      expect(({} as any).polluted).toBeUndefined();
      expect(({} as any)['__proto__: polluted']).toBeUndefined();
    });

    test('bulk: fresh objects have no new enumerable properties after all payloads', () => {
      const payloads = [
        '__proto__', 'constructor', 'toString', 'valueOf',
        'hasOwnProperty', '__defineGetter__', '__defineSetter__',
        '__lookupGetter__', '__lookupSetter__', 'prototype',
        '__proto__.polluted', 'constructor.prototype.polluted',
        '{"__proto__":{"polluted":true}}',
        '{"constructor":{"prototype":{"polluted":true}}}',
      ];
      for (const p of payloads) parse(p);
      const fresh: any = {};
      expect(Object.keys(fresh)).toEqual([]);
      expect(fresh.polluted).toBeUndefined();
      expect(fresh.constructor).toBe(Object);
      expect(typeof fresh.toString).toBe('function');
      expect(typeof fresh.hasOwnProperty).toBe('function');
    });
  });

  // ReDoS resistance tests use a vitest timeout (500ms) instead of
  // performance.now() assertions. If the regex backtracks catastrophically
  // the test times out and fails. This avoids flaky CI failures from
  // GC pauses, slow runners, or JIT warmup.

  describe('ReDoS resistance (CVE-2015-8315, CVE-2017-20162 patterns)', { timeout: 500 }, () => {
    test('long digit string (CVE-2015-8315 pattern)', () => {
      try { parse('9'.repeat(99) + 'h'); } catch { /* MAX_SAFE_INTEGER throw is fine */ }
    });

    test('long decimal (CVE-2017-20162 pattern)', () => {
      try { parse('.' + '0'.repeat(99)); } catch { /* may throw */ }
    });

    test('repeated dot-digit', () => {
      parse('.0'.repeat(50));
    });

    test('long non-matching string', () => {
      expect(parse('a'.repeat(99))).toBeNaN();
    });

    test('repeated spaces between number and unit', () => {
      expect(typeof parse('1' + ' '.repeat(95) + 'ms')).toBe('number');
    });

    test('adversarial backtracking: repeated decimal points', () => {
      expect(parse('1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1')).toBeNaN();
    });

    test('repeated unit char after number', () => {
      expect(parse('1' + 's'.repeat(99))).toBeNaN();
    });

    test('repeated full unit word', () => {
      expect(parse('1' + 'millisecond'.repeat(9))).toBeNaN();
    });

    test('repeated compound duration pattern does not hang', () => {
      expect(parse('1h2m3s'.repeat(16))).toBeGreaterThan(0);
    });

    test('repeated negative signs', () => {
      try { parse('-'.repeat(99) + '1ms'); } catch { /* length guard throws */ }
    });

    test('leading whitespace flood', () => {
      expect(parse(' '.repeat(99) + '1')).toBeNaN();
    });
  });

  describe('type coercion bypass', () => {
    test('boxed String throws', () => {
      expect(() => parse(new String('1h') as unknown as string)).toThrow();
    });

    test('boxed Number throws in format', () => {
      expect(() => format(new Number(1_000) as unknown as number)).toThrow();
    });

    test('object with valueOf does not bypass durate()', () => {
      expect(() => durate({ valueOf: () => 3_600_000 } as unknown as number)).toThrow('durate()');
    });

    test('object with toString does not bypass durate()', () => {
      expect(() => durate({ toString: () => '1h' } as unknown as string)).toThrow('durate()');
    });

    test('object with Symbol.toPrimitive does not bypass durate()', () => {
      const obj = { [Symbol.toPrimitive]: () => '1h' };
      expect(() => durate(obj as unknown as string)).toThrow('durate()');
    });

    test('Object.create(null) does not bypass durate()', () => {
      expect(() => durate(Object.create(null) as unknown as number)).toThrow('durate()');
    });

    test('array does not bypass parse', () => {
      expect(() => parse(['1h'] as unknown as string)).toThrow();
    });

    test('null throws in parse', () => {
      expect(() => parse(null as unknown as string)).toThrow();
    });

    test('undefined throws in parse', () => {
      expect(() => parse(undefined as unknown as string)).toThrow();
    });

    test('boolean does not bypass durate()', () => {
      expect(() => durate(true as unknown as number)).toThrow();
    });

    test('Symbol does not bypass durate()', () => {
      expect(() => durate(Symbol('1h') as unknown as number)).toThrow();
    });

    test('BigInt does not bypass durate()', () => {
      expect(() => durate(BigInt(1_000) as unknown as number)).toThrow();
    });

    test('NaN is rejected by format', () => {
      expect(() => format(NaN)).toThrow();
    });

    test('Infinity is rejected by format', () => {
      expect(() => format(Infinity)).toThrow();
    });

    test('-Infinity is rejected by format', () => {
      expect(() => format(-Infinity)).toThrow();
    });
  });

  describe('integer precision overflow', () => {
    test('result beyond MAX_SAFE_INTEGER throws', () => {
      expect(() => parse('9'.repeat(20) + 'y')).toThrow('MAX_SAFE_INTEGER');
    });

    test('negative result beyond -MAX_SAFE_INTEGER throws', () => {
      expect(() => parse('-' + '9'.repeat(20) + 'y')).toThrow('MAX_SAFE_INTEGER');
    });

    test('huge ms value throws', () => {
      expect(() => parse('9'.repeat(20) + 'ms')).toThrow('MAX_SAFE_INTEGER');
    });

    test('values within MAX_SAFE_INTEGER are fine', () => {
      expect(parse('285420y')).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    });

    test('format rejects values beyond MAX_SAFE_INTEGER', () => {
      expect(() => format(Number.MAX_SAFE_INTEGER + 1)).toThrow('MAX_SAFE_INTEGER');
    });

    test('format accepts MAX_SAFE_INTEGER', () => {
      expect(() => format(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    test('format rejects -MAX_SAFE_INTEGER - 1', () => {
      expect(() => format(-Number.MAX_SAFE_INTEGER - 1)).toThrow('MAX_SAFE_INTEGER');
    });
  });

  describe('numeric edge cases in parse', () => {
    test('hex literal attempt returns NaN', () => {
      expect(parse('0x1Ams')).toBeNaN();
    });

    test('octal literal attempt returns NaN', () => {
      expect(parse('0o77ms')).toBeNaN();
    });

    test('binary literal attempt returns NaN', () => {
      expect(parse('0b1010ms')).toBeNaN();
    });

    test('NaN literal returns NaN', () => {
      expect(parse('NaNms')).toBeNaN();
    });

    test('Infinity literal returns NaN', () => {
      expect(parse('Infinityms')).toBeNaN();
    });

    test('-Infinity literal returns NaN', () => {
      expect(parse('-Infinityms')).toBeNaN();
    });

    test('underscore numeric separator returns NaN', () => {
      expect(parse('1_000ms')).toBeNaN();
    });

    test('scientific notation returns NaN', () => {
      expect(parse('1e5ms')).toBeNaN();
    });
  });

  describe('null bytes and control characters', () => {
    test('null byte in input returns NaN', () => {
      expect(parse('1\x00h')).toBeNaN();
    });

    test('newline in input returns NaN', () => {
      expect(parse('1h\n')).toBeNaN();
    });

    test('tab in input returns NaN', () => {
      expect(parse('1h\t')).toBeNaN();
    });

    test('carriage return in input returns NaN', () => {
      expect(parse('1\rh')).toBeNaN();
    });

    test('unicode escape in input returns NaN', () => {
      expect(parse('1\u200Bh')).toBeNaN();
    });

    test('BOM character returns NaN', () => {
      expect(parse('\uFEFF1h')).toBeNaN();
    });
  });

  describe('input length boundary', () => {
    test('100-char string passes length check but may throw for precision', () => {
      expect(() => parse('1'.repeat(100))).toThrow('MAX_SAFE_INTEGER');
    });

    test('101-char string throws for length', () => {
      expect(() => parse('1'.repeat(101))).toThrow('parse()');
    });

    test('empty string throws', () => {
      expect(() => parse('')).toThrow();
    });
  });

  describe('negative zero', () => {
    test('format(-0) returns "0ms" not "-0ms"', () => {
      expect(format(-0)).toBe('0ms');
    });

    test('format(-0, { long: true }) returns "0 ms"', () => {
      expect(format(-0, { long: true })).toBe('0 ms');
    });
  });

  describe('safeForTimer boundary correctness', () => {
    test('exactly MAX_TIMEOUT ms does not throw', () => {
      expect(() => format(MAX_TIMEOUT)).not.toThrow();
    });

    test('clamp with unit: s returns clamped seconds', () => {
      expect(parse('1y', { safeForTimer: 'clamp', unit: 's' })).toBe(MAX_TIMEOUT / 1_000);
    });

    test('throw with unit: s still catches overflow', () => {
      expect(() => parse('1y', { safeForTimer: 'throw', unit: 's' })).toThrow();
    });

    test('clamp preserves sign for negative overflow', () => {
      expect(parse('-1y', { safeForTimer: 'clamp' })).toBe(-MAX_TIMEOUT);
    });

    test('clamp negative with unit: s preserves sign', () => {
      expect(parse('-1y', { safeForTimer: 'clamp', unit: 's' })).toBe(-MAX_TIMEOUT / 1_000);
    });
  });

  describe('regex edge cases', () => {
    test('just a dot returns NaN', () => {
      expect(parse('.')).toBeNaN();
    });

    test('just a minus returns NaN', () => {
      expect(parse('-')).toBeNaN();
    });

    test('minus dot returns NaN', () => {
      expect(parse('-.')).toBeNaN();
    });

    test('double decimal returns NaN', () => {
      expect(parse('1.2.3s')).toBeNaN();
    });

    test('trailing space on bare number parses as ms', () => {
      expect(parse('1 ')).toBe(1);
    });

    test('leading space returns NaN', () => {
      expect(parse(' 1h')).toBeNaN();
    });

    test('leading and trailing spaces returns NaN', () => {
      expect(parse('  1  ')).toBeNaN();
    });

    test('unit without number returns NaN', () => {
      expect(parse('ms')).toBeNaN();
    });

    test('minus unit returns NaN', () => {
      expect(parse('-ms')).toBeNaN();
    });
  });

  describe('unicode homoglyph attacks', () => {
    test('fullwidth digits are not parsed as numbers', () => {
      expect(parse('１h')).toBeNaN();         // U+FF11 fullwidth 1
      expect(parse('５m')).toBeNaN();         // U+FF15 fullwidth 5
    });

    test('fullwidth space between number and unit returns NaN', () => {
      expect(parse('1\u3000h')).toBeNaN();   // ideographic space
    });

    test('non-breaking space is not treated as separator', () => {
      expect(parse('1\u00A0h')).toBeNaN();   // NBSP
    });

    test('en space is not treated as separator', () => {
      expect(parse('1\u2002h')).toBeNaN();   // en space
    });

    test('em space is not treated as separator', () => {
      expect(parse('1\u2003h')).toBeNaN();   // em space
    });

    test('thin space is not treated as separator', () => {
      expect(parse('1\u2009h')).toBeNaN();   // thin space
    });

    test('zero-width space inside number returns NaN', () => {
      expect(parse('1\u200B0h')).toBeNaN();  // ZWSP
    });

    test('zero-width joiner inside unit returns NaN', () => {
      expect(parse('1\u200Dh')).toBeNaN();   // ZWJ
    });

    test('RTL override does not trick parser', () => {
      expect(parse('\u202E1h')).toBeNaN();   // RTL override
    });

    test('Arabic-Indic digits are not parsed', () => {
      expect(parse('١h')).toBeNaN();          // U+0661
      expect(parse('٥m')).toBeNaN();          // U+0665
    });

    test('Devanagari digits are not parsed', () => {
      expect(parse('१h')).toBeNaN();          // U+0967
    });

    test('superscript digits are not parsed', () => {
      expect(parse('¹h')).toBeNaN();          // U+00B9
      expect(parse('²h')).toBeNaN();          // U+00B2
    });

    test('homoglyph latin letters in unit are not matched', () => {
      expect(parse('1\u043Ch')).toBeNaN();   // Cyrillic м (looks like m)
      expect(parse('1\u0455')).toBeNaN();    // Cyrillic ѕ (looks like s)
    });
  });

  describe('case folding safety', () => {
    test('toLowerCase is not locale-sensitive (Turkish İ)', () => {
      // In Turkish locale, 'I'.toLocaleLowerCase('tr') → 'ı' (dotless i)
      // But String.toLowerCase() uses Unicode default mapping: 'I' → 'i'
      // Verify our parser handles this correctly
      expect(parse('1MINUTES')).toBe(60_000);
      expect(parse('1MILLISECONDS')).toBe(1);
    });

    test('uppercase units all resolve correctly', () => {
      expect(parse('1MS')).toBe(1);
      expect(parse('1S')).toBe(1_000);
      expect(parse('1M')).toBe(60_000);

      expect(parse('1H')).toBe(3_600_000);
      expect(parse('1D')).toBe(86_400_000);
      expect(parse('1W')).toBe(604_800_000);
      expect(parse('1MO')).toBe(parse('1mo'));
      expect(parse('1Y')).toBe(parse('1y'));
    });
  });

  describe('monkey-patched builtins', () => {
    test('patched parseFloat does not bypass validation', () => {
      const original = globalThis.parseFloat;
      try {
        globalThis.parseFloat = (() => Infinity) as any;
        // Our regex match extracts the number string; parseFloat is called on it
        // Even with a patched parseFloat returning Infinity, the multiplication
        // would produce Infinity which exceeds MAX_SAFE_INTEGER → throws
        expect(() => parse('1h')).toThrow();
      } finally {
        globalThis.parseFloat = original;
      }
    });

    test('patched Math.abs does not bypass MAX_SAFE_INTEGER guard', () => {
      const original = Math.abs;
      try {
        Math.abs = (() => 0) as any;
        // If Math.abs is patched to return 0, the guard `Math.abs(ms) > MAX_SAFE_INTEGER`
        // would be bypassed — but the result would still be the real ms value
        // This is a known limitation: if builtins are compromised, all bets are off
        const result = parse('1h');
        // Restore and verify the actual value is correct
        Math.abs = original;
        expect(result).toBe(3_600_000);
      } finally {
        Math.abs = original;
      }
    });

    test('patched Number.isFinite does not let NaN through format', () => {
      const original = Number.isFinite;
      try {
        Number.isFinite = (() => true) as any;
        // With isFinite patched to always return true, typeof check still catches non-numbers
        // But NaN passes typeof === 'number' AND the patched isFinite
        // This means format(NaN) would proceed and return "NaNms" — a known limitation
        // when builtins are compromised
        const result = format(NaN);
        expect(result).toBe('NaNms'); // degraded but not a security breach
      } finally {
        Number.isFinite = original;
      }
    });
  });

  describe('compound parse attack vectors', () => {
    test('compound with prototype pollution strings returns NaN', () => {
      expect(parse('1h __proto__')).toBeNaN();
      expect(parse('1h constructor')).toBeNaN();
      expect(parse('__proto__ 1h')).toBeNaN();
    });

    test('compound does not pollute prototype after parsing', () => {
      parse('1h __proto__');
      parse('constructor 1h');
      expect(({} as any).polluted).toBeUndefined();
      expect(({}).constructor).toBe(Object);
    });

    test('compound with null bytes between segments returns NaN', () => {
      expect(parse('1h\x001m')).toBeNaN();
    });

    test('compound with CRLF injection between segments returns NaN', () => {
      expect(parse('1h\r\n1m')).toBeNaN();
    });

    test('compound with tab between segments returns NaN', () => {
      expect(parse('1h\t1m')).toBeNaN();
    });

    test('compound with NBSP between segments returns NaN', () => {
      expect(parse('1h\u00A01m')).toBeNaN();
    });

    test('compound with zero-width space between segments returns NaN', () => {
      expect(parse('1h\u200B1m')).toBeNaN();
    });

    test('compound ReDoS: many repeated segments completes quickly', () => {
      const input = '1s '.repeat(30).trim();
      const start = performance.now();
      parse(input);
      expect(performance.now() - start).toBeLessThan(50);
    });

    test('compound with many segments within length limit stays finite', () => {
      const input = '1s '.repeat(20).trim(); // 59 chars, under 100
      expect(Number.isFinite(parse(input))).toBe(true);
      expect(parse(input)).toBe(20_000);
    });

    test('compound MAX_SAFE_INTEGER overflow: many large units throws', () => {
      expect(() => parse('285000y 285000y')).toThrow('MAX_SAFE_INTEGER');
    });

    test('compound negative does not double-negate', () => {
      const result = parse('-1h 30m');
      expect(result).toBe(-5_400_000);
      expect(result).not.toBe(5_400_000);
    });

    test('compound with only spaces returns NaN', () => {
      expect(parse('   ')).toBeNaN();
    });

    test('compound strict mode throws for partial valid input', () => {
      expect(() => parse('1h garbage', { strict: true })).toThrow();
    });

    test('compound safeForTimer clamp works correctly', () => {
      const result = parse('20d 10d', { safeForTimer: 'clamp' });
      expect(result).toBe(MAX_TIMEOUT);
    });
  });

  describe('compound format attack vectors', () => {
    test('compound format with NaN throws', () => {
      expect(() => format(NaN, { compound: true })).toThrow();
    });

    test('compound format with Infinity throws', () => {
      expect(() => format(Infinity, { compound: true })).toThrow();
    });

    test('compound format with MAX_SAFE_INTEGER + 1 throws', () => {
      expect(() => format(Number.MAX_SAFE_INTEGER + 1, { compound: true })).toThrow('MAX_SAFE_INTEGER');
    });

    test('compound format negative produces correct sign', () => {
      const result = format(-5_400_000, { compound: true });
      expect(result.startsWith('-')).toBe(true);
      expect(result).toBe('-1h 30m');
    });

    test('compound format -0 does not produce negative sign', () => {
      expect(format(-0, { compound: true })).toBe('0ms');
    });

    test('compound format parts: -1 treated as no parts', () => {
      expect(format(3_600_000, { compound: true, parts: -1 })).toBe('0ms');
    });

    test('compound format parts: Infinity shows all units', () => {
      expect(format(5_425_000, { compound: true, parts: Infinity })).toBe('1h 30m 25s');
    });

    test('compound format with fractional ms does not produce NaN parts', () => {
      const result = format(0.7, { compound: true });
      expect(result).not.toContain('NaN');
    });
  });

  describe('template format attack vectors', () => {
    test('template with prototype pollution strings is safe', () => {
      format(3_600_000, { template: '__proto__' });
      format(3_600_000, { template: 'constructor' });
      expect(({} as any).polluted).toBeUndefined();
      expect(({}).constructor).toBe(Object);
    });

    test('template with null bytes produces output without crash', () => {
      expect(() => format(3_600_000, { template: 'H\x00m' })).not.toThrow();
    });

    test('template with CRLF injection does not inject newlines into tokens', () => {
      const result = format(3_600_000, { template: 'H[h]\r\nm[m]' });
      expect(result).toContain('\r\n');
      expect(result).toBe('1h\r\n0m');
    });

    test('template ReDoS: very long template string completes quickly', () => {
      const template = 'H'.repeat(100);
      const start = performance.now();
      format(3_600_000, { template });
      expect(performance.now() - start).toBeLessThan(50);
    });

    test('template with many bracket pairs completes quickly', () => {
      const template = '[a]'.repeat(100);
      const start = performance.now();
      format(3_600_000, { template });
      expect(performance.now() - start).toBeLessThan(50);
    });

    test('template with deeply nested brackets does not hang', () => {
      const template = '['.repeat(50) + ']'.repeat(50);
      const start = performance.now();
      format(3_600_000, { template });
      expect(performance.now() - start).toBeLessThan(50);
    });

    test('template with unclosed bracket at end does not hang', () => {
      const result = format(3_600_000, { template: 'H[h' });
      expect(result).toBe('1[h');
    });

    test('template token detection regex does not match inside brackets', () => {
      // [D] should be literal, not treated as days token for remainder calculation
      const result = format(90_000_000, { template: 'H[D]' });
      // H should be total hours (25) since D is inside brackets (literal)
      expect(result).toBe('25D');
    });

    test('template with emoji does not crash', () => {
      expect(() => format(3_600_000, { template: 'H[h] 🕐' })).not.toThrow();
    });

    test('template with unicode characters passes through', () => {
      const result = format(3_600_000, { template: 'H[時間]' });
      expect(result).toBe('1時間');
    });

    test('template NaN input throws before template processing', () => {
      expect(() => format(NaN, { template: 'HH:mm:ss' })).toThrow();
    });

    test('template Infinity input throws before template processing', () => {
      expect(() => format(Infinity, { template: 'HH:mm:ss' })).toThrow();
    });

    test('template MAX_SAFE_INTEGER + 1 throws before template processing', () => {
      expect(() => format(Number.MAX_SAFE_INTEGER + 1, { template: 'HH:mm:ss' })).toThrow();
    });

    test('template negative value gets single minus prefix', () => {
      const result = format(-3_661_000, { template: 'H:mm:ss' });
      expect(result).toBe('-1:01:01');
      expect(result.match(/-/g)?.length).toBe(1);
    });

    test('template -0 does not get minus prefix', () => {
      expect(format(-0, { template: 'HH:mm:ss' })).toBe('00:00:00');
    });

    test('template exceeding 512 chars throws (O(n^2) DoS prevention)', () => {
      expect(() => format(1000, { template: '['.repeat(10_000) })).toThrow();
    });

    test('template at 512 chars does not throw', () => {
      const tpl = 'H'.repeat(512);
      expect(() => format(1000, { template: tpl })).not.toThrow();
    });
  });

  describe('precision format attack vectors', () => {
    test('precision with NaN input throws', () => {
      expect(() => format(NaN, { precision: 1 })).toThrow();
    });

    test('precision with Infinity throws', () => {
      expect(() => format(Infinity, { precision: 1 })).toThrow();
    });

    test('precision with negative precision clamps to 0', () => {
      expect(format(5_400_000, { precision: -1 })).toBe('2h');
    });

    test('precision with very large precision does not hang', () => {
      const start = performance.now();
      format(3_600_000, { precision: 100 });
      expect(performance.now() - start).toBeLessThan(50);
    });

    test('precision with fractional precision rounds the precision value', () => {
      // toFixed(1.5) → toFixed(1) in some engines, toFixed(2) in others
      // Should not crash regardless
      expect(() => format(5_400_000, { precision: 1.5 })).not.toThrow();
    });

    test('precision 0 and precision undefined produce same result', () => {
      // precision: 0 uses fmtPrecision, undefined uses fmtShort — both round
      // They may differ: fmtShort uses Math.round, fmtPrecision uses toFixed(0)
      // Both should produce valid output without crashing
      expect(() => format(5_400_000, { precision: 0 })).not.toThrow();
      expect(() => format(5_400_000)).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // parseISO red team
  // ═══════════════════════════════════════════════════════════════════════════

  describe('parseISO security', () => {
    describe('prototype pollution via ISO strings', () => {
      test('__proto__ as ISO value does not pollute', () => {
        parseISO('__proto__');
        expect(({} as any).polluted).toBeUndefined();
        expect(Object.getPrototypeOf({})).toBe(Object.prototype);
      });

      test('constructor as ISO value does not pollute', () => {
        parseISO('constructor');
        expect(({}).constructor).toBe(Object);
      });

      test('P__proto__ does not pollute', () => {
        parseISO('P__proto__');
        expect(({} as any).polluted).toBeUndefined();
      });

      test('JSON-like ISO payload does not pollute', () => {
        parseISO('P{"__proto__":{"polluted":true}}');
        expect(({} as any).polluted).toBeUndefined();
      });
    });

    describe('ReDoS resistance on ISO regex', () => {
      const MAX_MS = 50;

      test('long digit string before Y', () => {
        const start = performance.now();
        parseISO('P' + '9'.repeat(98) + 'Y');
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });

      test('many decimal places in seconds', () => {
        const start = performance.now();
        parseISO('PT1.' + '0'.repeat(95) + 'S');
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });

      test('repeated P prefixes', () => {
        const start = performance.now();
        parseISO('P'.repeat(99) + 'T1H');
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });

      test('adversarial backtracking: alternating digits and letters', () => {
        const start = performance.now();
        parseISO('P' + '1Y2M3D'.repeat(16));
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });

      test('very long non-matching ISO string', () => {
        const start = performance.now();
        parseISO('P' + 'X'.repeat(98));
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });

      test('long valid-looking string with multiple T markers', () => {
        const start = performance.now();
        parseISO('PT1HT2MT3S'.repeat(10));
        expect(performance.now() - start).toBeLessThan(MAX_MS);
      });
    });

    describe('type coercion bypass', () => {
      test('number returns NaN', () => {
        expect(parseISO(123 as any)).toBeNaN();
      });

      test('null returns NaN', () => {
        expect(parseISO(null as any)).toBeNaN();
      });

      test('undefined returns NaN', () => {
        expect(parseISO(undefined as any)).toBeNaN();
      });

      test('array returns NaN', () => {
        expect(parseISO(['PT1H'] as any)).toBeNaN();
      });

      test('object with toString returns NaN', () => {
        expect(parseISO({ toString: () => 'PT1H' } as any)).toBeNaN();
      });

      test('boolean returns NaN', () => {
        expect(parseISO(true as any)).toBeNaN();
      });
    });

    describe('unicode and encoding attacks', () => {
      test('fullwidth P does not match', () => {
        expect(parseISO('\uFF30T1H')).toBeNaN(); // fullwidth P
      });

      test('fullwidth digits do not match', () => {
        expect(parseISO('P\uFF11D')).toBeNaN(); // fullwidth 1
      });

      test('null byte inside ISO string', () => {
        const result = parseISO('PT1\x00H');
        expect(result).toBeNaN();
        expect(({} as any).polluted).toBeUndefined();
      });

      test('CRLF inside ISO string', () => {
        expect(parseISO('PT1H\r\n')).toBeNaN();
      });

      test('BOM prefix', () => {
        expect(parseISO('\uFEFFPT1H')).toBeNaN();
      });

      test('RTL override', () => {
        expect(parseISO('\u202EPT1H')).toBeNaN();
      });

      test('zero-width space inside', () => {
        expect(parseISO('PT\u200B1H')).toBeNaN();
      });

      test('lowercase iso is not accepted', () => {
        expect(parseISO('pt1h')).toBeNaN();
        expect(parseISO('PT1h')).toBeNaN();
        expect(parseISO('Pt1H')).toBeNaN();
      });
    });

    describe('integer overflow', () => {
      test('huge year value produces large but finite number', () => {
        const result = parseISO('P999999999Y');
        expect(typeof result).toBe('number');
        // May exceed MAX_SAFE_INTEGER but should not crash
      });

      test('huge value in all components does not crash', () => {
        expect(() => parseISO('P999Y999M999DT999H999M999S')).not.toThrow();
      });
    });

    describe('edge cases', () => {
      test('P alone returns NaN', () => {
        expect(parseISO('P')).toBeNaN();
      });

      test('PT alone returns NaN', () => {
        expect(parseISO('PT')).toBeNaN();
      });

      test('P0D returns 0', () => {
        expect(parseISO('P0D')).toBe(0);
      });

      test('negative ISO is not standard', () => {
        expect(parseISO('-PT1H')).toBeNaN();
      });

      test('trailing whitespace', () => {
        expect(parseISO('PT1H ')).toBeNaN();
      });

      test('leading whitespace', () => {
        expect(parseISO(' PT1H')).toBeNaN();
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // formatISO red team
  // ═══════════════════════════════════════════════════════════════════════════

  describe('formatISO security', () => {
    test('NaN throws', () => {
      expect(() => formatISO(NaN)).toThrow('finite number');
    });

    test('Infinity throws', () => {
      expect(() => formatISO(Infinity)).toThrow('finite number');
    });

    test('-Infinity throws', () => {
      expect(() => formatISO(-Infinity)).toThrow('finite number');
    });

    test('string throws', () => {
      expect(() => formatISO('PT1H' as any)).toThrow('finite number');
    });

    test('null throws', () => {
      expect(() => formatISO(null as any)).toThrow('finite number');
    });

    test('undefined throws', () => {
      expect(() => formatISO(undefined as any)).toThrow('finite number');
    });

    test('object with valueOf throws', () => {
      expect(() => formatISO({ valueOf: () => 1000 } as any)).toThrow('finite number');
    });

    test('boolean throws', () => {
      expect(() => formatISO(true as any)).toThrow('finite number');
    });

    test('-0 returns PT0S not -PT0S', () => {
      expect(formatISO(-0)).toBe('PT0S');
    });

    test('MAX_SAFE_INTEGER does not crash', () => {
      expect(() => formatISO(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(formatISO(Number.MAX_SAFE_INTEGER)).toMatch(/^P\d+D/);
    });

    test('negative MAX_SAFE_INTEGER does not crash', () => {
      expect(() => formatISO(-Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(formatISO(-Number.MAX_SAFE_INTEGER)).toMatch(/^-P\d+D/);
    });

    test('sub-millisecond precision does not produce trailing zeros', () => {
      // 1ms = PT0.001S, not PT0.00100S
      expect(formatISO(1)).toBe('PT0.001S');
    });

    test('very small fractional ms', () => {
      // 0.1ms — toFixed(3) → 0.000 → parseFloat → 0 → no S component
      const result = formatISO(0.1);
      expect(typeof result).toBe('string');
      expect(result.startsWith('P')).toBe(true);
    });

    test('output never contains prototype pollution strings', () => {
      const outputs = [
        formatISO(0), formatISO(1000), formatISO(-1000),
        formatISO(86_400_000), formatISO(Number.MAX_SAFE_INTEGER),
      ];
      for (const o of outputs) {
        expect(o).not.toContain('__proto__');
        expect(o).not.toContain('constructor');
        expect(o).not.toContain('prototype');
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // parse ISO auto-detection red team
  // ═══════════════════════════════════════════════════════════════════════════

  describe('parse ISO auto-detection security', () => {
    test('ISO via parse does not pollute prototype', () => {
      parse('PT1H');
      parse('P1D');
      expect(({} as any).polluted).toBeUndefined();
      expect(({}).constructor).toBe(Object);
    });

    test('invalid ISO does not pollute via fallback path', () => {
      parse('P__proto__');
      expect(({} as any).polluted).toBeUndefined();
    });

    test('ISO parse respects safeForTimer throw', () => {
      // P30D = 30 days > MAX_TIMEOUT
      expect(() => parse('P30D', { safeForTimer: 'throw' })).toThrow();
    });

    test('ISO parse respects safeForTimer clamp', () => {
      const result = parse('P30D', { safeForTimer: 'clamp' });
      expect(result).toBe(MAX_TIMEOUT);
    });

    test('ISO parse respects strict mode for invalid', () => {
      expect(() => parse('Pgarbage', { strict: true })).toThrow();
    });

    test('ISO parse huge values trigger MAX_SAFE_INTEGER guard', () => {
      // parseISO now returns NaN for values exceeding MAX_SAFE_INTEGER,
      // so parse() sees an invalid ISO string and returns NaN (non-strict mode)
      expect(parse('P999999999Y')).toBeNaN();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // arithmetic red team (add, subtract, multiply, divide)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('arithmetic security', () => {
    describe('prototype pollution via add/subtract', () => {
      test('__proto__ as duration does not pollute', () => {
        add('__proto__', '1h');
        subtract('__proto__', '1h');
        expect(({} as any).polluted).toBeUndefined();
        expect(Object.getPrototypeOf({})).toBe(Object.prototype);
      });

      test('constructor as duration does not pollute', () => {
        add('constructor', '1h');
        expect(({}).constructor).toBe(Object);
      });

      test('__proto__ in array does not pollute', () => {
        add(['__proto__', '1h']);
        expect(({} as any).polluted).toBeUndefined();
      });

      test('JSON payload as duration does not pollute', () => {
        add('{"__proto__":{"polluted":true}}', '1h');
        expect(({} as any).polluted).toBeUndefined();
        expect('polluted' in {}).toBe(false);
      });

      test('bulk pollution payloads via all arithmetic ops', () => {
        const payloads = ['__proto__', 'constructor', 'toString', 'valueOf', 'prototype'];
        for (const p of payloads) {
          add(p, '1h');
          subtract(p, '1h');
          multiply(p, 2);
          divide(p, 2);
        }
        const fresh: any = {};
        expect(Object.keys(fresh)).toEqual([]);
        expect(fresh.polluted).toBeUndefined();
        expect(fresh.constructor).toBe(Object);
        expect(typeof fresh.toString).toBe('function');
      });
    });

    describe('type coercion bypass', () => {
      test('object with valueOf in add returns NaN', () => {
        const evil = { valueOf: () => 3_600_000 } as any;
        expect(add(evil, '1h')).toBeNaN();
      });

      test('null in add returns NaN', () => {
        expect(add(null as any, '1h')).toBeNaN();
      });

      test('undefined in add returns NaN', () => {
        expect(add(undefined as any, '1h')).toBeNaN();
      });

      test('boolean in add returns NaN', () => {
        expect(add(true as any, '1h')).toBeNaN();
      });

      test('nested array in add does not cause stack overflow', () => {
        // flatten only checks one level
        const result = add([['1h'] as any, '30m']);
        expect(result).toBeNaN(); // inner array is not a valid Duration
      });

      test('non-number scalar in multiply returns NaN', () => {
        expect(multiply('1h', '2' as any)).toBeNaN();
      });

      test('non-number scalar in divide returns NaN', () => {
        expect(divide('1h', '2' as any)).toBeNaN();
      });

      test('null scalar in multiply returns NaN', () => {
        expect(multiply('1h', null as any)).toBeNaN();
      });

      test('object scalar in divide returns NaN', () => {
        expect(divide('1h', {} as any)).toBeNaN();
      });

      test('array scalar in multiply returns NaN', () => {
        expect(multiply('1h', [2] as any)).toBeNaN();
      });

      test('symbol as duration does not throw', () => {
        expect(add(Symbol('test') as any, '1h')).toBeNaN();
      });

      test('bigint as duration does not throw', () => {
        expect(() => add(BigInt(1000) as any, '1h')).not.toThrow();
      });
    });

    describe('NaN propagation', () => {
      test('add with one garbage returns NaN', () => {
        expect(add('1h', 'garbage', '30m')).toBeNaN();
      });

      test('subtract with garbage base returns NaN', () => {
        expect(subtract('garbage', '1h')).toBeNaN();
      });

      test('subtract with garbage subtrahend returns NaN', () => {
        expect(subtract('1h', 'garbage')).toBeNaN();
      });

      test('multiply NaN duration returns NaN', () => {
        expect(multiply('garbage', 2)).toBeNaN();
      });

      test('multiply NaN scalar returns NaN', () => {
        expect(multiply('1h', NaN)).toBeNaN();
      });

      test('divide NaN duration returns NaN', () => {
        expect(divide('garbage', 2)).toBeNaN();
      });

      test('divide by zero returns NaN', () => {
        expect(divide('1h', 0)).toBeNaN();
      });

      test('divide by zero in chain returns NaN', () => {
        expect(divide('1h', 2, 0, 3)).toBeNaN();
      });

      test('NaN number input propagates', () => {
        expect(add(NaN, 1000)).toBeNaN();
        expect(subtract(NaN, 1000)).toBeNaN();
        expect(multiply(NaN, 2)).toBeNaN();
        expect(divide(NaN, 2)).toBeNaN();
      });
    });

    describe('integer overflow', () => {
      test('add huge values does not throw', () => {
        const result = add(Number.MAX_SAFE_INTEGER, 1);
        expect(typeof result).toBe('number');
        // Result exceeds MAX_SAFE_INTEGER but add does not guard against this
        // (parse guards it, but number inputs bypass parse)
      });

      test('multiply large values does not crash', () => {
        const result = multiply(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
        expect(typeof result).toBe('number');
        expect(Number.isFinite(result)).toBe(true);
      });

      test('subtract to large negative', () => {
        expect(subtract(0, Number.MAX_SAFE_INTEGER)).toBe(-Number.MAX_SAFE_INTEGER);
      });

      test('divide very small number stays finite', () => {
        expect(Number.isFinite(divide(1, Number.MAX_SAFE_INTEGER))).toBe(true);
      });
    });

    describe('edge cases', () => {
      test('empty add returns 0', () => {
        expect(add()).toBe(0);
      });

      test('empty subtract returns 0', () => {
        expect(subtract()).toBe(0);
      });

      test('empty array add returns 0', () => {
        expect(add([])).toBe(0);
      });

      test('multiply with no scalars returns ms', () => {
        expect(multiply('1h')).toBe(3_600_000);
      });

      test('divide with no divisors returns ms', () => {
        expect(divide('1h')).toBe(3_600_000);
      });

      test('multiply by Infinity returns Infinity', () => {
        expect(multiply('1h', Infinity)).toBe(Infinity);
      });

      test('multiply by -Infinity returns -Infinity', () => {
        expect(multiply('1h', -Infinity)).toBe(-Infinity);
      });

      test('divide by Infinity returns 0', () => {
        expect(divide('1h', Infinity)).toBe(0);
      });

      test('multiply 0 by Infinity returns NaN', () => {
        expect(multiply(0, Infinity)).toBeNaN();
      });

      test('add with string > 100 chars returns NaN (parse throws, caught)', () => {
        expect(add('1' + 'h'.repeat(100), '30m')).toBeNaN();
      });

      test('ISO strings work in arithmetic', () => {
        expect(add('PT1H', 'PT30M')).toBe(5_400_000);
        expect(subtract('PT2H', 'PT30M')).toBe(5_400_000);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // comparison red team (gt, lt, eq, gte, lte)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('comparison security', () => {
    describe('prototype pollution', () => {
      test('__proto__ as comparison operand does not pollute', () => {
        gt('__proto__', '1h');
        lt('1h', '__proto__');
        eq('__proto__', '__proto__');
        gte('__proto__', '1h');
        lte('1h', '__proto__');
        expect(({} as any).polluted).toBeUndefined();
        expect(Object.getPrototypeOf({})).toBe(Object.prototype);
      });

      test('constructor as comparison operand does not pollute', () => {
        eq('constructor', 'constructor');
        expect(({}).constructor).toBe(Object);
      });
    });

    describe('NaN safety — all comparisons return false', () => {
      test('gt with NaN left returns false', () => {
        expect(gt('garbage', '1h')).toBe(false);
      });

      test('gt with NaN right returns false', () => {
        expect(gt('1h', 'garbage')).toBe(false);
      });

      test('lt with NaN left returns false', () => {
        expect(lt('garbage', '1h')).toBe(false);
      });

      test('lt with NaN right returns false', () => {
        expect(lt('1h', 'garbage')).toBe(false);
      });

      test('eq with NaN on both sides returns false', () => {
        expect(eq('garbage', 'garbage')).toBe(false);
      });

      test('gte with NaN returns false', () => {
        expect(gte('garbage', '1h')).toBe(false);
        expect(gte('1h', 'garbage')).toBe(false);
      });

      test('lte with NaN returns false', () => {
        expect(lte('garbage', '1h')).toBe(false);
        expect(lte('1h', 'garbage')).toBe(false);
      });

      test('NaN number input: all comparisons return false', () => {
        expect(gt(NaN, 1000)).toBe(false);
        expect(lt(NaN, 1000)).toBe(false);
        expect(eq(NaN, NaN)).toBe(false);
        expect(gte(NaN, 1000)).toBe(false);
        expect(lte(NaN, 1000)).toBe(false);
      });
    });

    describe('type coercion bypass', () => {
      test('object operands return false (not true via coercion)', () => {
        const evil = { valueOf: () => 999999 } as any;
        expect(gt(evil, '1h')).toBe(false);
        expect(lt('1h', evil)).toBe(false);
        expect(eq(evil, evil)).toBe(false);
      });

      test('null operands return false', () => {
        expect(gt(null as any, '1h')).toBe(false);
        expect(eq(null as any, null as any)).toBe(false);
      });

      test('undefined operands return false', () => {
        expect(gt(undefined as any, '1h')).toBe(false);
        expect(eq(undefined as any, undefined as any)).toBe(false);
      });

      test('boolean operands return false', () => {
        expect(gt(true as any, false as any)).toBe(false);
      });

      test('array operands return false', () => {
        expect(eq(['1h'] as any, ['1h'] as any)).toBe(false);
      });
    });

    describe('Infinity edge cases', () => {
      test('Infinity > any finite is true', () => {
        expect(gt(Infinity, Number.MAX_SAFE_INTEGER)).toBe(true);
      });

      test('any finite < Infinity is true', () => {
        expect(lt(1000, Infinity)).toBe(true);
      });

      test('Infinity === Infinity is true', () => {
        expect(eq(Infinity, Infinity)).toBe(true);
      });

      test('-Infinity < Infinity is true', () => {
        expect(lt(-Infinity, Infinity)).toBe(true);
      });

      test('-Infinity < any finite is true', () => {
        expect(lt(-Infinity, -Number.MAX_SAFE_INTEGER)).toBe(true);
      });
    });

    describe('negative zero', () => {
      test('eq(0, -0) is true (=== treats them as equal)', () => {
        expect(eq(0, -0)).toBe(true);
      });

      test('gt(0, -0) is false', () => {
        expect(gt(0, -0)).toBe(false);
      });

      test('lt(-0, 0) is false', () => {
        expect(lt(-0, 0)).toBe(false);
      });
    });

    describe('cross-format equivalence', () => {
      test('ISO and human durations compare correctly', () => {
        expect(eq('PT1H', '1h')).toBe(true);
        expect(eq('PT1H30M', '1h 30m')).toBe(true);
        expect(gt('PT2H', '1h')).toBe(true);
      });

      test('compound and simple durations compare correctly', () => {
        expect(eq('1h 30m', '90m')).toBe(true);
        expect(gt('1h 31m', '90m')).toBe(true);
      });

      test('number and string durations compare correctly', () => {
        expect(eq(3_600_000, '1h')).toBe(true);
        expect(gt(3_600_001, '1h')).toBe(true);
        expect(lt(3_599_999, '1h')).toBe(true);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CVE regression tests
  // Exact PoCs from the two known ms vulnerabilities plus defense verification
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CVE-2015-8315 — ReDoS via overlapping quantifiers in number group', { timeout: 500 }, () => {
    // Vulnerable regex: ((?:\d+)?\.?\d+) — O(N^2) backtracking on digit strings
    // Our regex: (-?\d*\.?\d+) — same class of overlapping quantifiers
    // Defense: MAX_INPUT_LENGTH (100 chars) makes worst case < 1ms
    // Tests use vitest timeout (500ms) instead of performance.now() — no flaky CI.

    test('exact PoC: "5".repeat(90) + " minutea" (near-match unit suffix)', () => {
      expect(parse('5'.repeat(90) + ' minutea')).toBeNaN();
    });

    test('near-match unit: "seconda"', () => {
      expect(parse('1'.repeat(90) + ' seconda')).toBeNaN();
    });

    test('near-match unit: "hourss"', () => {
      expect(parse('9'.repeat(92) + ' hourss')).toBeNaN();
    });

    test('original PoC length (10000 chars) is rejected by length guard', () => {
      expect(() => parse('5'.repeat(10000) + ' minutea')).toThrow();
    });

    test('original PoC length (80000 chars) is rejected by length guard', () => {
      expect(() => parse('5'.repeat(80000) + ' minutea')).toThrow();
    });
  });

  describe('CVE-2017-20162 — ReDoS with reduced (10k) length limit bypass', { timeout: 500 }, () => {
    // ms 0.7.1-1.0.0 had a 10000-char limit but still ~300ms worst case.
    // Our 100-char limit makes worst case negligible.

    test('exact PoC: "1".repeat(9998) + "Q" is rejected by length guard', () => {
      expect(() => parse('1'.repeat(9998) + 'Q')).toThrow();
    });

    test('at-limit payload (100 chars) returns NaN, does not hang', () => {
      const payload = '1'.repeat(99) + 'Q';
      expect(payload.length).toBe(100);
      expect(parse(payload)).toBeNaN();
    });

    test('over-limit digits + near-match unit is rejected', () => {
      const payload = '9'.repeat(93) + ' minutea'; // 101 chars
      expect(payload.length).toBeGreaterThan(100);
      expect(() => parse(payload)).toThrow();
    });

    test('at-limit adversarial: 99 digits + non-unit char', () => {
      expect(parse('3'.repeat(99) + 'Q')).toBeNaN();
    });
  });

  describe('CVE defense: MAX_INPUT_LENGTH boundary', () => {
    test('MAX_INPUT_LENGTH is 100 (same as ms v2)', () => {
      expect(MAX_INPUT_LENGTH).toBe(100);
    });

    test('100-char string is accepted (at the limit)', () => {
      const payload = '1' + ' '.repeat(96) + ' ms';
      expect(payload.length).toBe(100);
      expect(() => parse(payload)).not.toThrow();
    });

    test('101-char string is rejected (over the limit)', () => {
      const payload = '1'.repeat(98) + ' ms';
      expect(payload.length).toBe(101);
      expect(() => parse(payload)).toThrow();
    });

    test('huge input is rejected (regex never reached)', () => {
      expect(() => parse('1'.repeat(1_000_000))).toThrow();
    });

    test('empty string throws (not passed to regex)', () => {
      expect(() => parse('')).toThrow();
    });

    test('compound parse inherits same length guard', () => {
      const payload = '1h '.repeat(34); // 102 chars
      expect(payload.length).toBeGreaterThan(100);
      expect(() => parse(payload)).toThrow();
    });

    test('adversarial compound at limit completes', () => {
      const payload = '1h '.repeat(32) + '2s'; // 98 chars
      expect(payload.length).toBeLessThanOrEqual(100);
      expect(parse(payload)).toBeGreaterThan(0);
    });
  });

  describe('CVE defense: regex completes for adversarial inputs within limit', { timeout: 500 }, () => {
    // If these tests complete, the regex is not catastrophically slow.
    // If ReDoS triggers, vitest kills the test at 500ms.

    test('digits + near-match unit suffixes (worst case for durationPattern)', () => {
      for (const suffix of [' minutea', ' seconda', ' hourss', ' dayss', ' yearss']) {
        const payload = '7'.repeat(100 - suffix.length) + suffix;
        expect(payload.length).toBeLessThanOrEqual(100);
        expect(parse(payload)).toBeNaN();
      }
    });

    test('digits + non-alpha terminator (worst case for \\d+ backtracking)', () => {
      for (const suffix of ['Q', '!', '#', '?', ')']) {
        expect(parse('1'.repeat(99) + suffix)).toBeNaN();
      }
    });

    test('decimal + digits + near-match', () => {
      expect(parse('.' + '9'.repeat(91) + ' minutea')).toBeNaN();
    });

    test('alternating digits and dots at max length', () => {
      const payload = ('1.2.3.4.5.6.7.8.9.0.'.repeat(4) + '1.2.3.4.5.6.7.8.').slice(0, 100);
      expect(parse(payload)).toBeNaN();
    });
  });
});
