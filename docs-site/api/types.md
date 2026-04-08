# Types

All types are exported from the main entry point:

```ts
import type { DurationString, FormatOptions, ParseOptions } from 'durate';
```

## DurationString

Branded template literal type that catches invalid duration strings at compile time.

```ts
type DurationString =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`;
```

Accepts bare numbers (`"100"`), numbers with units (`"1h"`), and numbers with a space before the unit (`"1 hour"`). Units are case-insensitive.

```ts
const a: DurationString = '5m';       // ok
const b: DurationString = '1 hour';   // ok
const c: DurationString = 'garbage';  // compile error
```

## FormatOptions

Options for [`format`](/api/format) and [`durate`](/api/durate) (when called with a number).

```ts
interface FormatOptions {
  long?: boolean;       // 'minute' vs 'm'. Default: false
  compound?: boolean;   // '1h 30m 25s' vs '2h'. Default: false
  parts?: number;       // max units in compound. Default: all
  precision?: number;   // decimal places for single-unit. Default: 0 (round)
  template?: string;    // format string with tokens: 'HH:mm:ss', 'D[d] H[h]', etc.
}
```

## ParseOptions

Options for [`parse`](/api/parse), [`parseStrict`](/api/parse-strict), and [`durate`](/api/durate) (when called with a string).

```ts
interface ParseOptions {
  unit?: 'ms' | 's';    // output unit. Default: 'ms'
  strict?: boolean;      // throw on invalid input instead of NaN. Default: false
  safeForTimer?: 'throw' | 'clamp';  // guard against setTimeout/setInterval overflow
}
```

## MAX_TIMEOUT

Constant equal to `2^31 - 1` (2,147,483,647 ms, ~24.85 days). The maximum value accepted by `setTimeout` / `setInterval` before overflow.

```ts
import { MAX_TIMEOUT } from 'durate';
```
