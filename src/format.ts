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

function plural(ms: number, msAbs: number, n: number, name: string): DurationString {
  const isPlural = msAbs >= n * 1.5;
  return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}` as DurationString;
}

function fmtShort(ms: number): DurationString {
  const msAbs = Math.abs(ms);

  for (const [val, short] of units) {
    if (msAbs >= val) return `${Math.round(ms / val)}${short}` as DurationString;
  }

  return `${ms}ms`;
}

function fmtLong(ms: number): DurationString {
  const msAbs = Math.abs(ms);

  for (const [val, , long] of units) {
    if (msAbs >= val) return plural(ms, msAbs, val, long);
  }

  return `${ms} ms` as DurationString;
}

function fmtPrecision(ms: number, precision: number): string {
  const msAbs = Math.abs(ms);
  const safePrecision = Math.max(0, Math.min(100, Math.floor(precision)));

  for (const [val, short] of units) {
    if (msAbs >= val) {
      const n = ms / val;
      return `${parseFloat(n.toFixed(safePrecision))}${short}`;
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
      if (long) {
        parts.push(`${count} ${name}${count >= 2 ? 's' : ''}`);
      } else {
        parts.push(`${count}${short}`);
      }
    }
  }

  if (remaining > 0 && parts.length < maxParts) {
    const count = Math.round(remaining);
    if (count > 0) {
      if (long) {
        parts.push(`${count} ms`);
      } else {
        parts.push(`${count}ms`);
      }
    }
  }

  if (parts.length === 0) return long ? '0 ms' : '0ms';

  return (neg ? '-' : '') + parts.join(' ');
}

const tokenD = /DD?(?![^[]*])/;
const tokenH = /HH?(?![^[]*])/;
const tokenM = /mm?(?![^[]*])/;
const tokenS = /ss?(?![^[]*])/;
const pad2 = (n: number) => String(n).padStart(2, '0');
const pad3 = (n: number) => String(n).padStart(3, '0');

function fmtTemplate(ms: number, template: string): string {
  const neg = ms < 0;
  let remaining = Math.abs(ms);

  // Detect which tokens are present to decide remainder vs total behavior
  const hasD = tokenD.test(template);
  const hasH = tokenH.test(template);
  const hasM = tokenM.test(template);
  const hasS = tokenS.test(template);

  // Extract components as remainders (top-down)
  let days = 0;
  if (hasD) {
    days = Math.floor(remaining / d);
    remaining %= d;
  }

  let hours = 0;
  if (hasH) {
    hours = Math.floor(remaining / h);
    remaining %= h;
  }

  let minutes = 0;
  if (hasM) {
    minutes = Math.floor(remaining / m);
    remaining %= m;
  }

  let seconds = 0;
  if (hasS) {
    seconds = Math.floor(remaining / s);
    remaining %= s;
  }

  const millis = Math.round(remaining);

  // Process template: replace tokens, preserve bracket-escaped literals
  let result = '';
  let i = 0;
  while (i < template.length) {
    // Escaped literal: [...]
    if (template[i] === '[') {
      const close = template.indexOf(']', i + 1);
      if (close !== -1) {
        result += template.slice(i + 1, close);
        i = close + 1;
        continue;
      }
    }

    // Tokens (check longest first)
    if (template.slice(i, i + 3) === 'SSS') {
      result += pad3(millis);
      i += 3;
    } else if (template.slice(i, i + 2) === 'SS') {
      result += pad2(Math.floor(millis / 10));
      i += 2;
    } else if (template[i] === 'S' && template[i + 1] !== 'S') {
      result += String(millis);
      i += 1;
    } else if (template.slice(i, i + 2) === 'DD') {
      result += pad2(days);
      i += 2;
    } else if (template[i] === 'D' && template[i + 1] !== 'D') {
      result += String(days);
      i += 1;
    } else if (template.slice(i, i + 2) === 'HH') {
      result += pad2(hours);
      i += 2;
    } else if (template[i] === 'H' && template[i + 1] !== 'H') {
      result += String(hours);
      i += 1;
    } else if (template.slice(i, i + 2) === 'mm') {
      result += pad2(minutes);
      i += 2;
    } else if (template[i] === 'm' && template[i + 1] !== 'm') {
      result += String(minutes);
      i += 1;
    } else if (template.slice(i, i + 2) === 'ss') {
      result += pad2(seconds);
      i += 2;
    } else if (template[i] === 's' && template[i + 1] !== 's') {
      result += String(seconds);
      i += 1;
    } else {
      result += template[i];
      i += 1;
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
    throw new Error('Value provided to format() exceeds MAX_SAFE_INTEGER and loses integer precision.');
  }

  if (options?.template) {
    return fmtTemplate(ms, options.template);
  }

  if (options?.compound) {
    return fmtCompound(ms, options);
  }

  if (options?.precision !== undefined) {
    return fmtPrecision(ms, options.precision);
  }

  return options?.long ? fmtLong(ms) : fmtShort(ms);
}
