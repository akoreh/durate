type Years = 'years' | 'year' | 'yrs' | 'yr' | 'y';
type Months = 'months' | 'month' | 'mons' | 'mon' | 'mo';
type Weeks = 'weeks' | 'week' | 'w';
type Days = 'days' | 'day' | 'd';
type Hours = 'hours' | 'hour' | 'hrs' | 'hr' | 'h';
type Minutes = 'minutes' | 'minute' | 'mins' | 'min' | 'm';
type Seconds = 'seconds' | 'second' | 'secs' | 'sec' | 's';
type Milliseconds = 'milliseconds' | 'millisecond' | 'msecs' | 'msec' | 'ms';
type Unit = Years | Months | Weeks | Days | Hours | Minutes | Seconds | Milliseconds;
type UnitAnyCase = Capitalize<Unit> | Uppercase<Unit> | Unit;

/**
 * Branded template literal type that catches invalid duration strings at compile time.
 *
 * Accepts bare numbers (`"100"`), numbers with units (`"1h"`), and numbers with
 * a space before the unit (`"1 hour"`). Units are case-insensitive.
 *
 * @example
 * ```ts
 * const a: DurationString = '5m';       // ok
 * const b: DurationString = '1 hour';   // ok
 * const c: DurationString = 'garbage';  // compile error
 * ```
 */
export type DurationString = `${number}` | `${number}${UnitAnyCase}` | `${number} ${UnitAnyCase}`;

/** Options for {@link format}. */
export interface FormatOptions {
  /** Use long names (`"1 minute"`) instead of short (`"1m"`). Default `false`. */
  long?: boolean;
  /** Output multiple units (`"1h 30m 25s"`). Default `false`. */
  compound?: boolean;
  /** Max number of units in compound output. Default: all. */
  parts?: number;
  /** Decimal places for single-unit output (e.g. `1` → `"1.5h"`). Default: `0` (round). */
  precision?: number;
  /**
   * Format string with tokens. Brackets escape literal text.
   *
   * Tokens: `D`/`DD` (days), `H`/`HH` (hours), `m`/`mm` (minutes),
   * `s`/`ss` (seconds), `S`/`SS`/`SSS` (milliseconds).
   * Double-letter tokens zero-pad. Values are remainder-based (not totals)
   * unless the larger unit token is absent.
   *
   * @example `'HH:mm:ss'` → `'01:30:25'`
   * @example `'D[d] H[h]'` → `'1d 1h'`
   */
  template?: string;
}

/** Options for {@link parse} and {@link parseStrict}. */
export interface ParseOptions {
  /** Output unit — `'ms'` (default) or `'s'`. */
  unit?: 'ms' | 's';
  /** Throw on invalid input instead of returning `NaN`. Default `false`. */
  strict?: boolean;
  /**
   * Guard against `setTimeout` / `setInterval` overflow (2^31 - 1 ms, ~24.85 days).
   *
   * - `'throw'` — throw if the result exceeds {@link MAX_TIMEOUT}.
   * - `'clamp'` — cap the result at {@link MAX_TIMEOUT} instead of overflowing.
   */
  safeForTimer?: 'throw' | 'clamp';
}
