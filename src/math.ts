import { toMs } from './parse';

type Duration = string | number;

function flatten(args: (Duration | Duration[])[]): Duration[] {
  return args.length === 1 && Array.isArray(args[0]) ? args[0] : (args as Duration[]);
}

/**
 * Add durations together. Accepts any number of duration strings or
 * millisecond numbers, or a single array of them.
 *
 * Returns `NaN` if any value is unparseable.
 *
 * @example
 * ```ts
 * add('1h', '30m')            // 5_400_000
 * add('1h', '30m', '15s')     // 5_415_000
 * add(['1h', '30m'])          // 5_400_000
 * add('1h', 1000)             // 3_601_000
 * ```
 */
export function add(...args: (Duration | Duration[])[]): number {
  const values = flatten(args);
  let total = 0;
  for (const v of values) {
    const ms = toMs(v);
    if (Number.isNaN(ms)) return NaN;
    total += ms;
  }
  return total;
}

/**
 * Subtract durations from the first value. Accepts any number of duration
 * strings or millisecond numbers, or a single array of them.
 *
 * Returns `NaN` if any value is unparseable.
 *
 * @example
 * ```ts
 * subtract('2d', '6h')        // 151_200_000
 * subtract('1d', '2h', '30m') // 77_400_000
 * subtract(['2d', '6h'])      // 151_200_000
 * ```
 */
export function subtract(...args: (Duration | Duration[])[]): number {
  const values = flatten(args);
  if (values.length === 0) return 0;
  let total = toMs(values[0]);
  if (Number.isNaN(total)) return NaN;
  for (let i = 1; i < values.length; i++) {
    const ms = toMs(values[i]);
    if (Number.isNaN(ms)) return NaN;
    total -= ms;
  }
  return total;
}

/**
 * Multiply a duration by one or more scalar numbers.
 *
 * Returns `NaN` if the duration is unparseable or any multiplier is not a number.
 *
 * @param value - Duration string or milliseconds.
 * @param multipliers - One or more scalar multipliers applied in order.
 *
 * @example
 * ```ts
 * multiply('1h', 2)       // 7_200_000
 * multiply('1h', 2, 3)    // 21_600_000
 * multiply('2h', 0.5)     // 3_600_000
 * ```
 */
export function multiply(value: Duration, ...multipliers: number[]): number {
  let result = toMs(value);
  if (Number.isNaN(result)) return NaN;
  for (const n of multipliers) {
    if (typeof n !== 'number') return NaN;
    result *= n;
  }
  return result;
}

/**
 * Divide a duration by one or more scalar numbers.
 *
 * Returns `NaN` if the duration is unparseable, any divisor is not a number,
 * or any divisor is zero.
 *
 * @param value - Duration string or milliseconds.
 * @param divisors - One or more scalar divisors applied in order.
 *
 * @example
 * ```ts
 * divide('2h', 2)         // 3_600_000
 * divide('1d', 2, 3)      // 14_400_000
 * divide('1h', 0)          // NaN
 * ```
 */
export function divide(value: Duration, ...divisors: number[]): number {
  let result = toMs(value);
  if (Number.isNaN(result)) return NaN;
  for (const n of divisors) {
    if (typeof n !== 'number' || n === 0) return NaN;
    result /= n;
  }
  return result;
}

/**
 * Returns `true` if duration `a` is strictly greater than `b`.
 * Returns `false` if either value is unparseable.
 *
 * @example
 * ```ts
 * gt('1h', '30m')   // true
 * gt('30m', '1h')   // false
 * ```
 */
export function gt(a: Duration, b: Duration): boolean {
  return toMs(a) > toMs(b);
}

/**
 * Returns `true` if duration `a` is strictly less than `b`.
 * Returns `false` if either value is unparseable.
 *
 * @example
 * ```ts
 * lt('30m', '1h')   // true
 * lt('1h', '30m')   // false
 * ```
 */
export function lt(a: Duration, b: Duration): boolean {
  return toMs(a) < toMs(b);
}

/**
 * Returns `true` if durations `a` and `b` are exactly equal in milliseconds.
 * Returns `false` if either value is unparseable (NaN !== NaN).
 *
 * @example
 * ```ts
 * eq('60m', '1h')   // true
 * eq('1h', '30m')   // false
 * ```
 */
export function eq(a: Duration, b: Duration): boolean {
  return toMs(a) === toMs(b);
}

/**
 * Returns `true` if duration `a` is greater than or equal to `b`.
 * Returns `false` if either value is unparseable.
 *
 * @example
 * ```ts
 * gte('1h', '1h')   // true
 * gte('1h', '30m')  // true
 * gte('30m', '1h')  // false
 * ```
 */
export function gte(a: Duration, b: Duration): boolean {
  return toMs(a) >= toMs(b);
}

/**
 * Returns `true` if duration `a` is less than or equal to `b`.
 * Returns `false` if either value is unparseable.
 *
 * @example
 * ```ts
 * lte('1h', '1h')   // true
 * lte('30m', '1h')  // true
 * lte('1h', '30m')  // false
 * ```
 */
export function lte(a: Duration, b: Duration): boolean {
  return toMs(a) <= toMs(b);
}
