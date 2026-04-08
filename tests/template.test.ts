import { describe, test, expect } from 'vitest';
import { format } from '../src';

// ─── Precomputed constants (duplicated on purpose — test must not trust src) ──
const S = 1_000;
const M = 60_000;
const H = 3_600_000;
const D = 86_400_000;
const W = 604_800_000;
const Y = 365.25 * 24 * 60 * 60 * 1_000; // 31_557_600_000
const MO = Y / 12; // 2_629_800_000

describe('template format', () => {
  describe('basic tokens', () => {
    test('HH:mm:ss', () => {
      expect(format(5_425_000, { template: 'HH:mm:ss' })).toBe('01:30:25');
    });

    test('H:m:s without padding', () => {
      expect(format(5_425_000, { template: 'H:m:s' })).toBe('1:30:25');
    });

    test('mm:ss', () => {
      expect(format(90_500, { template: 'mm:ss' })).toBe('01:30');
    });

    test('D days H hours', () => {
      expect(format(90_000_000, { template: 'D[d] H[h]' })).toBe('1d 1h');
    });

    test('full template with days', () => {
      expect(format(90_061_500, { template: 'D[d] HH:mm:ss' })).toBe('1d 01:01:01');
    });
  });

  describe('padded vs unpadded tokens', () => {
    test('HH pads to 2 digits', () => {
      expect(format(3_600_000, { template: 'HH' })).toBe('01');
    });

    test('H does not pad', () => {
      expect(format(3_600_000, { template: 'H' })).toBe('1');
    });

    test('mm pads to 2 digits', () => {
      expect(format(60_000, { template: 'mm' })).toBe('01');
    });

    test('m does not pad', () => {
      expect(format(60_000, { template: 'm' })).toBe('1');
    });

    test('ss pads to 2 digits', () => {
      expect(format(5_000, { template: 'ss' })).toBe('05');
    });

    test('s does not pad', () => {
      expect(format(5_000, { template: 's' })).toBe('5');
    });

    test('DD pads to 2 digits', () => {
      expect(format(86_400_000, { template: 'DD' })).toBe('01');
    });
  });

  describe('literal escape with brackets', () => {
    test('[h] is literal text', () => {
      expect(format(3_661_000, { template: 'H[h] m[m] s[s]' })).toBe('1h 1m 1s');
    });

    test('[hours] is literal text', () => {
      expect(format(7_200_000, { template: 'H [hours]' })).toBe('2 hours');
    });

    test('empty brackets', () => {
      expect(format(3_600_000, { template: 'H[]' })).toBe('1');
    });
  });

  describe('component extraction (remainder-based)', () => {
    test('hours and minutes are remainders, not total', () => {
      // 25h = 1d 1h, so H should be 1, not 25
      expect(format(90_000_000, { template: 'D[d] H[h]' })).toBe('1d 1h');
    });

    test('minutes are remainder after hours', () => {
      // 90 minutes = 1h 30m
      expect(format(5_400_000, { template: 'H[h] m[m]' })).toBe('1h 30m');
    });

    test('seconds are remainder after minutes', () => {
      // 90s = 1m 30s
      expect(format(90_000, { template: 'm[m] s[s]' })).toBe('1m 30s');
    });

    test('ms are remainder after seconds', () => {
      expect(format(1_500, { template: 's[s] S[ms]' })).toBe('1s 500ms');
    });
  });

  describe('milliseconds token', () => {
    test('S gives raw ms remainder', () => {
      expect(format(1_500, { template: 's.S' })).toBe('1.500');
    });

    test('SSS pads to 3 digits', () => {
      expect(format(1_005, { template: 's.SSS' })).toBe('1.005');
    });

    test('SS pads to 2 digits (truncates)', () => {
      expect(format(1_500, { template: 's.SS' })).toBe('1.50');
    });
  });

  describe('edge cases', () => {
    test('zero duration', () => {
      expect(format(0, { template: 'HH:mm:ss' })).toBe('00:00:00');
    });

    test('negative duration uses absolute value', () => {
      expect(format(-3_661_000, { template: 'H:mm:ss' })).toBe('-1:01:01');
    });

    test('large hours without day token', () => {
      // 2 days = 48h when no D token present
      expect(format(172_800_000, { template: 'H[h] m[m]' })).toBe('48h 0m');
    });

    test('template overrides long/compound options', () => {
      expect(format(3_600_000, { template: 'H[h]', long: true })).toBe('1h');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 14. FORMAT — template: every token in isolation
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template tokens in isolation', () => {
  test('D token: total days', () => {
    expect(format(3 * D, { template: 'D' })).toBe('3');
  });

  test('DD token: zero-padded days', () => {
    expect(format(3 * D, { template: 'DD' })).toBe('03');
  });

  test('H token: total hours (no D)', () => {
    expect(format(25 * H, { template: 'H' })).toBe('25');
  });

  test('HH token: zero-padded hours (no D)', () => {
    expect(format(5 * H, { template: 'HH' })).toBe('05');
  });

  test('m token: total minutes (no H)', () => {
    expect(format(90 * M, { template: 'm' })).toBe('90');
  });

  test('mm token: zero-padded minutes (no H)', () => {
    expect(format(5 * M, { template: 'mm' })).toBe('05');
  });

  test('s token: total seconds (no m)', () => {
    expect(format(90 * S, { template: 's' })).toBe('90');
  });

  test('ss token: zero-padded seconds (no m)', () => {
    expect(format(5 * S, { template: 'ss' })).toBe('05');
  });

  test('S token: raw milliseconds remainder', () => {
    expect(format(1_500, { template: 'S' })).toBe('1500');
  });

  test('SS token: ms divided by 10, zero-padded', () => {
    expect(format(1_500, { template: 'SS' })).toBe('150');
  });

  test('SSS token: total ms zero-padded to 3 digits (no s token → total ms)', () => {
    // Without an s token, remaining = full ms. SSS pads: padStart(3,'0') on "1500" → "1500"
    expect(format(1_500, { template: 'SSS' })).toBe('1500');
  });

  test('SSS token: remainder ms when s token present', () => {
    expect(format(1_500, { template: 's.SSS' })).toBe('1.500');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 15. FORMAT — template: S vs SS vs SSS for various ms values
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template S/SS/SSS for various ms values', () => {
  test('5ms: S=5, SS=00, SSS=005', () => {
    expect(format(5, { template: 'S' })).toBe('5');
    expect(format(5, { template: 'SS' })).toBe('00');
    expect(format(5, { template: 'SSS' })).toBe('005');
  });

  test('50ms: S=50, SS=05, SSS=050', () => {
    expect(format(50, { template: 'S' })).toBe('50');
    expect(format(50, { template: 'SS' })).toBe('05');
    expect(format(50, { template: 'SSS' })).toBe('050');
  });

  test('500ms: S=500, SS=50, SSS=500', () => {
    expect(format(500, { template: 'S' })).toBe('500');
    expect(format(500, { template: 'SS' })).toBe('50');
    expect(format(500, { template: 'SSS' })).toBe('500');
  });

  test('999ms: S=999, SS=99, SSS=999', () => {
    expect(format(999, { template: 'S' })).toBe('999');
    expect(format(999, { template: 'SS' })).toBe('99');
    expect(format(999, { template: 'SSS' })).toBe('999');
  });

  test('0ms: S=0, SS=00, SSS=000', () => {
    expect(format(0, { template: 'S' })).toBe('0');
    expect(format(0, { template: 'SS' })).toBe('00');
    expect(format(0, { template: 'SSS' })).toBe('000');
  });

  test('1_005ms with seconds: s.SSS = 1.005', () => {
    expect(format(1_005, { template: 's.SSS' })).toBe('1.005');
  });

  test('1_050ms with seconds: s.SSS = 1.050', () => {
    expect(format(1_050, { template: 's.SSS' })).toBe('1.050');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 16. FORMAT — template: remainder vs total behavior
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template remainder vs total behavior', () => {
  test('H without D gives total hours', () => {
    // 25 hours = total hours = 25
    expect(format(25 * H, { template: 'H' })).toBe('25');
  });

  test('H with D gives remainder hours', () => {
    // 25 hours = 1d 1h
    expect(format(25 * H, { template: 'D[d] H[h]' })).toBe('1d 1h');
  });

  test('m without H gives total minutes', () => {
    // 90 minutes = 90
    expect(format(90 * M, { template: 'm' })).toBe('90');
  });

  test('m with H gives remainder minutes', () => {
    // 90 minutes = 1h 30m
    expect(format(90 * M, { template: 'H[h] m[m]' })).toBe('1h 30m');
  });

  test('s without m gives total seconds', () => {
    expect(format(90 * S, { template: 's' })).toBe('90');
  });

  test('s with m gives remainder seconds', () => {
    expect(format(90 * S, { template: 'm[m] s[s]' })).toBe('1m 30s');
  });

  test('S without s gives total ms', () => {
    expect(format(1_500, { template: 'S' })).toBe('1500');
  });

  test('SSS with s gives remainder ms', () => {
    expect(format(1_500, { template: 's.SSS' })).toBe('1.500');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 17. FORMAT — template: consecutive tokens without separator
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template consecutive tokens without separator', () => {
  test('HHmmss produces concatenated padded values', () => {
    // 1h 30m 25s
    expect(format(H + 30 * M + 25 * S, { template: 'HHmmss' })).toBe('013025');
  });

  test('DDHHmmss for 1d 2h 3m 4s', () => {
    expect(format(D + 2 * H + 3 * M + 4 * S, { template: 'DDHHmmss' })).toBe('01020304');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 18. FORMAT — template: only literals
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template with only literals', () => {
  test('only literal text in brackets', () => {
    expect(format(3_600_000, { template: '[hello world]' })).toBe('hello world');
  });

  test('multiple literal segments', () => {
    expect(format(3_600_000, { template: '[foo][bar]' })).toBe('foobar');
  });

  test('empty brackets produce nothing', () => {
    expect(format(3_600_000, { template: '[]' })).toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 19. FORMAT — template: nested/malformed brackets
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template nested/malformed brackets', () => {
  test('unclosed bracket includes rest as literal', () => {
    // "[hello" → no close bracket found, so the '[' is not specially handled
    // so it falls through to the else and is output as `[`
    const result = format(3_600_000, { template: '[hello' });
    expect(result).toBe('[hello');
  });

  test('nested brackets: [a[b]] takes first ] as close', () => {
    // "[a[b]" → finds ] at position 4, so literal = "a[b"
    // then "]" at position 5 is output as literal char
    const result = format(3_600_000, { template: '[a[b]]' });
    expect(result).toBe('a[b]');
  });

  test('bracket with token inside: [HH]', () => {
    expect(format(3_600_000, { template: '[HH]' })).toBe('HH');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 20. FORMAT — template: tokens at string boundaries
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template tokens at boundaries', () => {
  test('token at very start', () => {
    expect(format(3_600_000, { template: 'H[h]' })).toBe('1h');
  });

  test('token at very end', () => {
    expect(format(3_600_000, { template: '[hours: ]H' })).toBe('hours: 1');
  });

  test('single-char token at end: s', () => {
    expect(format(5_000, { template: 's' })).toBe('5');
  });

  test('double-char token at end: ss', () => {
    expect(format(5_000, { template: 'ss' })).toBe('05');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 21. FORMAT — template: unknown characters
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template unknown characters', () => {
  test('unknown chars are passed through literally', () => {
    expect(format(3_661_000, { template: 'H:mm:ss xyz' })).toBe('1:01:01 xyz');
  });

  test('digits in template are literal', () => {
    expect(format(3_600_000, { template: 'H 123' })).toBe('1 123');
  });

  test('special chars in template are literal', () => {
    expect(format(3_600_000, { template: 'H!@#$' })).toBe('1!@#$');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 22. FORMAT — template: empty template string
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template empty string', () => {
  test('empty template is falsy — falls through to default short format', () => {
    // '' is falsy in JS, so options?.template is falsy → fmtShort is used
    expect(format(3_600_000, { template: '' })).toBe('1h');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 23. FORMAT — template: negative values
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template with negative values', () => {
  test('negative value gets minus prefix', () => {
    expect(format(-3_661_000, { template: 'H:mm:ss' })).toBe('-1:01:01');
  });

  test('negative value with day template', () => {
    expect(format(-(D + H), { template: 'D[d] H[h]' })).toBe('-1d 1h');
  });

  test('negative zero template', () => {
    expect(format(-0, { template: 'HH:mm:ss' })).toBe('00:00:00');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 31. FORMAT — template: week tokens not supported
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template has no week/month/year tokens', () => {
  test('W is treated as literal character', () => {
    expect(format(W, { template: 'W' })).toBe('W');
  });

  test('Y is treated as literal character', () => {
    expect(format(Y, { template: 'Y' })).toBe('Y');
  });

  test('M (uppercase) is treated as literal character', () => {
    expect(format(MO, { template: 'M' })).toBe('M');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 30. FORMAT — template: S with seconds token (remainder ms)
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template S with s token gives remainder ms', () => {
  test('1_234ms: s.SSS = 1.234', () => {
    expect(format(1_234, { template: 's.SSS' })).toBe('1.234');
  });

  test('61_234ms: m:ss.SSS = 1:01.234', () => {
    expect(format(61_234, { template: 'm:ss.SSS' })).toBe('1:01.234');
  });

  test('3_661_234ms: H:mm:ss.SSS = 1:01:01.234', () => {
    expect(format(3_661_234, { template: 'H:mm:ss.SSS' })).toBe('1:01:01.234');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 43. FORMAT — template: full clock format with days
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template full clock format', () => {
  test('DD:HH:mm:ss.SSS for complex duration', () => {
    const ms = 2 * D + 3 * H + 4 * M + 5 * S + 678;
    expect(format(ms, { template: 'DD:HH:mm:ss.SSS' })).toBe('02:03:04:05.678');
  });

  test('zero duration: DD:HH:mm:ss.SSS', () => {
    expect(format(0, { template: 'DD:HH:mm:ss.SSS' })).toBe('00:00:00:00.000');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 44. FORMAT — template overrides other options
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template takes priority over other options', () => {
  test('template overrides long', () => {
    expect(format(3_600_000, { template: 'H[h]', long: true })).toBe('1h');
  });

  test('template overrides compound', () => {
    expect(format(5_425_000, { template: 'HH:mm:ss', compound: true })).toBe('01:30:25');
  });

  test('template overrides precision', () => {
    expect(format(5_400_000, { template: 'H[h] m[m]', precision: 2 })).toBe('1h 30m');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 48. FORMAT — template with large unpadded values
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY 2: Template token disambiguation (format.ts mutant killers)
// ─────────────────────────────────────────────────────────────────────────────
describe('format: template triple-token disambiguation (i+1 !== X mutant killers)', () => {
  // Use a value with known components: 1d 2h 3m 4s 567ms
  const val = D + 2 * H + 3 * M + 4 * S + 567;

  test('SSSS with s token — first 3 are SSS (padded remainder ms), 4th is standalone S', () => {
    // With s token present, ms becomes remainder (567). s = total secs (no m), SSS = "567", S = "567"
    // Use a simpler value: 4s 567ms = 4567ms
    expect(format(4_567, { template: 'sSSS-S' })).toBe('4567-567');
  });

  test('DDD — first 2 are DD (padded day), 3rd is standalone D (raw day)', () => {
    // DD = pad2(1) = "01", then D = String(1) = "1"
    expect(format(val, { template: 'DDD' })).toBe('011');
  });

  test('HHH with D token — first 2 are HH (padded remainder hr), 3rd is standalone H', () => {
    // With D present, H is remainder hours (2). HH = "02", H = "2"
    expect(format(val, { template: 'D-HHH' })).toBe('1-022');
  });

  test('mmm with H token — first 2 are mm (padded remainder min), 3rd is standalone m', () => {
    // With H present, m is remainder minutes (3). mm = "03", m = "3"
    expect(format(val, { template: 'H-mmm' })).toBe('26-033');
  });

  test('sss with m token — first 2 are ss (padded remainder sec), 3rd is standalone s', () => {
    // With m present, s is remainder seconds (4). ss = "04", s = "4"
    expect(format(val, { template: 'm-sss' })).toBe('1563-044');
  });
});

describe('format: template with large values', () => {
  test('100 days: D token = 100', () => {
    expect(format(100 * D, { template: 'D' })).toBe('100');
  });

  test('100 days: DD token = 100 (not truncated)', () => {
    expect(format(100 * D, { template: 'DD' })).toBe('100');
  });

  test('100 hours without D: H = 100', () => {
    expect(format(100 * H, { template: 'H' })).toBe('100');
  });

  test('100 hours without D: HH = 100 (not truncated)', () => {
    expect(format(100 * H, { template: 'HH' })).toBe('100');
  });
});
