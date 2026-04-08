import { toMs } from './parse';
import { unitMap } from './constants';

/**
 * Convert a duration to a specific unit.
 *
 * Accepts a duration string (parsed via {@link parse}) or a raw millisecond
 * number, and divides by the target unit's multiplier.
 *
 * Returns `NaN` if the input is unparseable or the target unit is unrecognised.
 *
 * @param value - Duration string (`"2h"`, `"1h 30m"`) or milliseconds.
 * @param unit  - Target unit name or alias (e.g. `"minutes"`, `"h"`, `"days"`). Case-insensitive.
 * @returns The duration expressed in the target unit.
 *
 * @example
 * ```ts
 * toUnit('2h', 'minutes')   // → 120
 * toUnit(86_400_000, 'h')   // → 24
 * toUnit('1h 30m', 'm')     // → 90
 * ```
 */
export function toUnit(value: string | number, unit: string): number {
  const ms = toMs(value);
  if (Number.isNaN(ms)) {
    return NaN;
  }

  if (typeof unit !== 'string') {
    return NaN;
  }
  const divisor = unitMap[unit.toLowerCase()];
  if (!divisor) {
    return NaN;
  }

  return ms / divisor;
}
