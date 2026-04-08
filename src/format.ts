import type { DurationString, FormatOptions } from './types';
import { s, m, h, d, w, mo, y } from './constants';

const units: [number, string, string][] = [
  [y, 'y', 'year'],
  [mo, 'mo', 'month'],
  [w, 'w', 'week'],
  [d, 'd', 'day'],
  [h, 'h', 'hour'],
  [m, 'm', 'minute'],
  [s, 's', 'second'],
];

function fmtSingle(ms: number, long: boolean): DurationString {
  const msAbs = Math.abs(ms);
  for (const [val, short, name] of units) {
    if (msAbs >= val) {
      const rounded = Math.round(ms / val);
      if (long) {
        return `${rounded} ${name}${msAbs >= val * 1.5 ? 's' : ''}` as DurationString;
      }
      return `${rounded}${short}` as DurationString;
    }
  }
  return (long ? `${ms} ms` : `${ms}ms`) as DurationString;
}

function fmtPrecision(ms: number, precision: number): string {
  const msAbs = Math.abs(ms);
  const safe = Math.max(0, Math.min(100, Math.floor(precision)));
  for (const [val, short] of units) {
    if (msAbs >= val) {
      return `${parseFloat((ms / val).toFixed(safe))}${short}`;
    }
  }
  return `${ms}ms`;
}

function fmtCompound(ms: number, options: FormatOptions): string {
  const neg = ms < 0;
  let remaining = Math.abs(ms);
  const parts: string[] = [];
  const maxParts = options.parts ?? Infinity;
  const long = options.long ?? false;

  for (const [val, short, name] of units) {
    if (remaining >= val && parts.length < maxParts) {
      const count = Math.floor(remaining / val);
      remaining -= count * val;
      parts.push(long ? `${count} ${name}${count >= 2 ? 's' : ''}` : `${count}${short}`);
    }
  }

  if (remaining > 0 && parts.length < maxParts) {
    const count = Math.round(remaining);
    if (count > 0) {
      parts.push(long ? `${count} ms` : `${count}ms`);
    }
  }

  if (parts.length === 0) {
    return long ? '0 ms' : '0ms';
  }
  return (neg ? '-' : '') + parts.join(' ');
}

// ─── Template formatting ────────────────────────────────────────────────────

const tokenPattern = (c: string) => new RegExp(`${c}${c}?(?![^[]*])`);
const tokenD = tokenPattern('D');
const tokenH = tokenPattern('H');
const tokenM = tokenPattern('m');
const tokenS = tokenPattern('s');
const pad = (n: number, w: number) => String(n).padStart(w, '0');

function fmtTemplate(ms: number, template: string): string {
  const neg = ms < 0;
  let remaining = Math.abs(ms);

  // Extract components top-down; mutates `remaining` so each level is a remainder
  const extract = (re: RegExp, divisor: number) => {
    if (!re.test(template)) {
      return 0;
    }
    const val = Math.floor(remaining / divisor);
    remaining %= divisor;
    return val;
  };
  const days = extract(tokenD, d);
  const hours = extract(tokenH, h);
  const minutes = extract(tokenM, m);
  const seconds = extract(tokenS, s);
  const millis = Math.round(remaining);

  // Token table — longest first so "SSS" matches before "SS" before "S"
  const tokens: [string, () => string][] = [
    ['SSS', () => pad(millis, 3)],
    ['SS', () => pad(Math.floor(millis / 10), 2)],
    ['DD', () => pad(days, 2)],
    ['HH', () => pad(hours, 2)],
    ['mm', () => pad(minutes, 2)],
    ['ss', () => pad(seconds, 2)],
    ['S', () => String(millis)],
    ['D', () => String(days)],
    ['H', () => String(hours)],
    ['m', () => String(minutes)],
    ['s', () => String(seconds)],
  ];

  let result = '';
  let i = 0;
  while (i < template.length) {
    // Bracket-escaped literal: [...]
    if (template[i] === '[') {
      const close = template.indexOf(']', i + 1);
      if (close !== -1) {
        result += template.slice(i + 1, close);
        i = close + 1;
        continue;
      }
    }

    let matched = false;
    for (const [tok, fn] of tokens) {
      if (template.startsWith(tok, i)) {
        result += fn();
        i += tok.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += template[i];
      i++;
    }
  }

  return neg ? '-' + result : result;
}

/**
 * Format a millisecond value into a human-readable duration string.
 *
 * Short format by default (`"1h"`), or long with `options.long` (`"1 hour"`).
 * Compound format with `options.compound` (`"1h 30m 25s"`).
 * Precision control with `options.precision` (`"1.5h"`).
 * Pluralization kicks in at >= 1.5x the unit (e.g. 1500ms → `"2 seconds"`).
 *
 * @param ms - The duration in milliseconds.
 * @param options - Optional settings.
 * @returns A formatted duration string.
 *
 * @example
 * ```ts
 * format(3_600_000)                              // '1h'
 * format(3_600_000, { long: true })              // '1 hour'
 * format(5_425_000, { compound: true })          // '1h 30m 25s'
 * format(5_400_000, { precision: 1 })            // '1.5h'
 * ```
 */
export function format(ms: number, options?: FormatOptions): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) {
    throw new Error('Value provided to format() must be a finite number.');
  }

  if (Math.abs(ms) > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      'Value provided to format() exceeds MAX_SAFE_INTEGER and loses integer precision.',
    );
  }

  if (options?.template) {
    if (options.template.length > 512) {
      throw new Error('Template string exceeds maximum length of 512 characters.');
    }
    return fmtTemplate(ms, options.template);
  }

  if (options?.compound) {
    return fmtCompound(ms, options);
  }

  if (options?.precision !== undefined) {
    return fmtPrecision(ms, options.precision);
  }

  return fmtSingle(ms, options?.long ?? false);
}
