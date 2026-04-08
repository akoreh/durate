import type { DurationString, ParseOptions } from './types';
import {
  MAX_TIMEOUT, MAX_INPUT_LENGTH, durationPattern, compoundPattern, unitMap,
} from './constants';
import { parseISO } from './iso';

function unitToMs(unit: string): number | undefined {
  return unitMap[unit.toLowerCase()];
}

/**
 * Safely convert a duration (string or number) to milliseconds.
 * Unlike {@link parse}, never throws — returns `NaN` for any invalid input.
 * @internal
 */
export function toMs(value: string | number): number {
  if (typeof value === 'number') return value;
  try {
    return parse(value);
  } catch {
    return NaN;
  }
}

function parseCompound(str: string): number {
  compoundPattern.lastIndex = 0;
  let total = 0;
  let consumedLength = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = compoundPattern.exec(str)) !== null) {
    // Check that between last match and this match, only whitespace exists
    const gap = str.slice(lastIndex, match.index);
    if (gap && !/^ *$/.test(gap)) return NaN;

    const n = parseFloat(match[1]);
    const multiplier = unitToMs(match[2]);
    if (multiplier === undefined) return NaN;
    total += n * multiplier;
    consumedLength++;
    lastIndex = match.index + match[0].length;
  }

  if (consumedLength === 0) return NaN;

  // Check trailing content is only whitespace
  const trailing = str.slice(lastIndex);
  if (trailing && !/^ *$/.test(trailing)) return NaN;

  return total;
}

/**
 * Parse a duration string into milliseconds (or seconds with `options.unit`).
 *
 * Supports single units (`"1h"`) and compound strings (`"1h 30m"`).
 * Returns `NaN` for strings that don't match any known pattern.
 * Throws for non-string input, empty strings, strings longer than 100 characters,
 * or results exceeding `Number.MAX_SAFE_INTEGER`.
 *
 * @param str - The duration string to parse (e.g. `"1h"`, `"1h 30m"`, `"5 minutes"`, `"100"`).
 * @param options - Optional settings. `unit: 's'` returns seconds instead of milliseconds.
 * @returns The parsed duration in milliseconds (default) or seconds.
 *
 * @example
 * ```ts
 * parse('2 days')             // 172_800_000
 * parse('1h 30m')             // 5_400_000
 * parse('1.5h')               // 5_400_000
 * parse('5m', { unit: 's' })  // 300
 * parse('garbage')            // NaN
 * ```
 */
export function parse(str: string, options?: ParseOptions): number {
  if (typeof str !== 'string' || str.length === 0 || str.length > MAX_INPUT_LENGTH) {
    throw new Error(
      `Value provided to parse() must be a string with length between 1 and ${MAX_INPUT_LENGTH}. value=${JSON.stringify(str)}`,
    );
  }

  // Try single-unit pattern first (handles bare numbers, negatives, spaces between num and unit)
  const match = durationPattern.exec(str);
  let ms: number;

  if (match) {
    const unit = (match[2] || 'ms').toLowerCase();
    const n = parseFloat(match[1]);
    const multiplier = unitToMs(unit);
    if (multiplier === undefined) {
      throw new Error(`Unknown unit "${unit}" provided to parse(). value=${JSON.stringify(str)}`);
    }
    ms = n * multiplier;
  } else {
    // Try compound pattern (e.g. "1h 30m", "2d 6h 30m")
    // Reject leading whitespace — compound must start with a digit or minus
    if (/^\s/.test(str)) {
      if (options?.strict) {
        throw new Error(`Invalid duration string: ${JSON.stringify(str)}`);
      }
      return NaN;
    }
    // Handle leading negative sign for the whole compound
    const isNeg = str.startsWith('-');
    const input = isNeg ? str.slice(1) : str;
    ms = parseCompound(input);
    if (isNaN(ms)) {
      // Try ISO 8601 duration format (e.g. "PT1H30M", "P1DT12H")
      const isoMs = parseISO(str);
      if (!isNaN(isoMs)) {
        ms = isoMs;
      } else {
        if (options?.strict) {
          throw new Error(`Invalid duration string: ${JSON.stringify(str)}`);
        }
        return NaN;
      }
    } else {
      if (isNeg) ms = -ms;
    }
  }

  if (Math.abs(ms) > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      `Duration exceeds MAX_SAFE_INTEGER and loses integer precision. value=${JSON.stringify(str)}`,
    );
  }

  if (options?.safeForTimer && Math.abs(ms) > MAX_TIMEOUT) {
    if (options.safeForTimer === 'throw') {
      throw new Error(
        `Duration exceeds maximum timer value (${MAX_TIMEOUT}ms ≈ 24.85 days). value=${JSON.stringify(str)}`,
      );
    }
    const clamped = ms < 0 ? -MAX_TIMEOUT : MAX_TIMEOUT;
    return options?.unit === 's' ? clamped / 1_000 : clamped;
  }

  return options?.unit === 's' ? ms / 1_000 : ms;
}

/**
 * Strictly-typed parse — identical to {@link parse} but the input type is
 * {@link DurationString}, so invalid strings are caught at compile time.
 *
 * @param str - A compile-time-checked duration string.
 * @param options - Optional settings. `unit: 's'` returns seconds instead of milliseconds.
 * @returns The parsed duration in milliseconds (default) or seconds.
 *
 * @example
 * ```ts
 * parseStrict('5m')          // 300_000
 * parseStrict('garbage')     // TypeScript compile error
 * ```
 */
export function parseStrict(str: DurationString, options?: ParseOptions): number {
  return parse(str, options);
}
