/** Milliseconds in one second. */
export const s = 1_000;
/** Milliseconds in one minute. */
export const m = s * 60;
/** Milliseconds in one hour. */
export const h = m * 60;
/** Milliseconds in one day. */
export const d = h * 24;
/** Milliseconds in one week. */
export const w = d * 7;
/** Milliseconds in one year (365.25 days). */
export const y = d * 365.25;
/** Milliseconds in one month (year / 12). */
export const mo = y / 12;

/**
 * Maximum value accepted by `setTimeout` / `setInterval` before overflow.
 * Equal to 2^31 - 1 ms (~24.85 days). Values above this cause the timer to fire immediately.
 */
export const MAX_TIMEOUT = 2_147_483_647;

/** Maximum input string length accepted by {@link parse}. Same limit as `ms`. */
export const MAX_INPUT_LENGTH = 100;

/**
 * Prototype-safe lookup from any unit alias (lowercase) to its millisecond multiplier.
 * Single source of truth — used by both parse and toUnit.
 */
export const unitMap: Record<string, number> = Object.assign(Object.create(null), {
  ms: 1,
  millisecond: 1,
  milliseconds: 1,
  msec: 1,
  msecs: 1,
  s,
  second: s,
  seconds: s,
  sec: s,
  secs: s,
  m,
  minute: m,
  minutes: m,
  min: m,
  mins: m,
  h,
  hour: h,
  hours: h,
  hr: h,
  hrs: h,
  d,
  day: d,
  days: d,
  w,
  week: w,
  weeks: w,
  mo,
  month: mo,
  months: mo,
  mon: mo,
  mons: mo,
  y,
  year: y,
  years: y,
  yr: y,
  yrs: y,
});

/** Regex that matches a single duration segment: number + optional unit. */
export const durationPattern =
  /^(-?\d*\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|months?|mons?|mo|years?|yrs?|y)?$/i;

/** Regex that matches compound duration segments globally: number + unit pairs. Longer units first to avoid partial matches (e.g. `mo` before `m`). */
export const compoundPattern =
  /(\d*\.?\d+) *(milliseconds?|msecs?|ms|months?|mons?|mo|minutes?|mins?|m|seconds?|secs?|s|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)/gi;
