import type { DurationString, FormatOptions, ParseOptions } from './types';
import { parse } from './parse';
import { format } from './format';

/**
 * Bidirectional duration conversion — pass a string to get milliseconds,
 * pass a number to get a formatted string.
 *
 * Drop-in replacement for `ms()`. Combines {@link parse} and {@link format}
 * into a single overloaded function.
 *
 * @param value - A duration string or a number of milliseconds.
 * @param options - {@link ParseOptions} when `value` is a string, {@link FormatOptions} when a number.
 * @returns Milliseconds (number) when given a string, or a formatted string when given a number.
 *
 * @example
 * ```ts
 * durate('2 days')                     // 172_800_000
 * durate(172_800_000)                  // '2d'
 * durate(172_800_000, { long: true })  // '2 days'
 * ```
 */
export function durate(value: DurationString, options?: ParseOptions): number;
export function durate(value: number, options?: FormatOptions): string;
export function durate(
  value: DurationString | number,
  options?: ParseOptions | FormatOptions,
): number | string {
  if (typeof value === 'string') {
    return parse(value, options as ParseOptions);
  }
  if (typeof value === 'number') {
    return format(value, options as FormatOptions);
  }

  throw new Error(
    `Value provided to durate() must be a string or number. value=${JSON.stringify(value)}`,
  );
}
