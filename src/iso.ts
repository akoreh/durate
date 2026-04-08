import { s, m, h, d, w, mo, y } from './constants';

const num = '(\\d+(?:\\.\\d+)?)';
const isoPattern = new RegExp(
  `^P(?:${num}Y)?(?:${num}M)?(?:${num}W)?(?:${num}D)?(?:T(?:${num}H)?(?:${num}M)?(?:${num}S)?)?$`,
);

const toNum = (v: string | undefined) => +(v || 0);

/**
 * Parse an ISO 8601 duration string (`P1DT12H`, `PT1H30M`) into milliseconds.
 *
 * Returns `NaN` for invalid or non-ISO strings. Does not support negative
 * durations (not part of ISO 8601).
 *
 * @param str - An ISO 8601 duration string starting with `P`.
 * @returns The duration in milliseconds, or `NaN` if invalid.
 *
 * @example
 * ```ts
 * parseISO('PT1H30M')         // → 5_400_000
 * parseISO('P1DT12H')         // → 129_600_000
 * parseISO('P1Y2M3DT4H5M6S') // → 37_091_106_000
 * parseISO('not iso')         // → NaN
 * ```
 */
export function parseISO(str: string): number {
  if (typeof str !== 'string') {
    return NaN;
  }
  const p = isoPattern.exec(str);
  if (!p || !p.slice(1).some(Boolean)) {
    return NaN;
  }

  const result =
    toNum(p[1]) * y +
    toNum(p[2]) * mo +
    toNum(p[3]) * w +
    toNum(p[4]) * d +
    toNum(p[5]) * h +
    toNum(p[6]) * m +
    toNum(p[7]) * s;

  if (Math.abs(result) > Number.MAX_SAFE_INTEGER) {
    return NaN;
  }
  return result;
}

/**
 * Format a millisecond value as an ISO 8601 duration string.
 *
 * Output uses days as the largest unit (no weeks/months/years) for
 * unambiguous round-tripping. Negative values are prefixed with `-`.
 *
 * @param ms - The duration in milliseconds.
 * @returns An ISO 8601 duration string (e.g. `"P1DT12H"`, `"PT1H30M"`).
 * @throws If the input is not a finite number.
 *
 * @example
 * ```ts
 * formatISO(5_400_000)   // → 'PT1H30M'
 * formatISO(129_600_000) // → 'P1DT12H'
 * formatISO(500)         // → 'PT0.5S'
 * formatISO(0)           // → 'PT0S'
 * ```
 */
export function formatISO(ms: number): string {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) {
    throw new Error('Value provided to formatISO() must be a finite number.');
  }

  if (Math.abs(ms) > Number.MAX_SAFE_INTEGER) {
    throw new Error(
      'Value provided to formatISO() exceeds MAX_SAFE_INTEGER and loses integer precision.',
    );
  }

  if (ms === 0) {
    return 'PT0S';
  }

  const neg = ms < 0;
  let remaining = Math.abs(ms);

  const days = Math.floor(remaining / d);
  remaining %= d;
  const hours = Math.floor(remaining / h);
  remaining %= h;
  const minutes = Math.floor(remaining / m);
  remaining %= m;
  const seconds = remaining / s;

  let out = neg ? '-P' : 'P';
  if (days > 0) {
    out += `${days}D`;
  }

  if (hours > 0 || minutes > 0 || seconds > 0) {
    out += 'T';
    if (hours > 0) {
      out += `${hours}H`;
    }
    if (minutes > 0) {
      out += `${minutes}M`;
    }
    if (seconds > 0) {
      out += `${parseFloat(seconds.toFixed(3))}S`;
    }
  }

  return out;
}
