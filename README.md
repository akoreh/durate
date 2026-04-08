<p align="center">
  <a href="https://github.com/akoreh/durate/actions"><img src="https://github.com/akoreh/durate/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.npmjs.com/package/durate"><img src="https://img.shields.io/npm/v/durate" alt="npm"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/npm/l/durate" alt="license"></a>
  <img src="https://img.shields.io/badge/dependencies-0-brightgreen" alt="zero dependencies">
</p>

Tiny millisecond conversion utility. A drop-in [`ms`](https://github.com/vercel/ms) replacement with better types and more units. < 3 kB brotli.

- **Drop-in compatible** — swap `ms` for `durate`, everything works
- **TypeScript-first** — `DurationString` branded type catches invalid strings at compile time
- **More units** — months, weeks, and years in both parse and format
- **Universal** — ESM, CJS, and IIFE browser global from a single package
- **Zero dependencies**
- **< 3 kB** brotli compressed

## Install

```
npm install durate
```

## Quick Start

```ts
import durate from 'durate';

durate('2 days')                     // 172_800_000
durate(172_800_000)                  // '2d'
durate(172_800_000, { long: true })  // '2 days'
```

## API

### parse

Converts a duration string to milliseconds. Supports single units, compound units, and ISO 8601 duration strings (auto-detected). Returns `NaN` on failure (or throws with `{ strict: true }`).

```ts
import { parse } from 'durate';

parse('1h')                          // 3_600_000
parse('5 minutes')                   // 300_000
parse('1h 30m')                      // 5_400_000
parse('2d 6h 30m')                   // 196_200_000
parse('.5s')                         // 500
parse('-3h')                         // -10_800_000
parse('garbage')                     // NaN
parse('garbage', { strict: true })   // throws

// ISO 8601 durations are auto-detected
parse('PT1H30M')                     // 5_400_000
parse('P1D')                         // 86_400_000

// Bare numbers without a unit default to milliseconds
parse('100')                         // 100 (treated as 100ms, NOT seconds)
```

### parseStrict

**Compile-time type strictness with runtime validation** — the input is typed as `DurationString` so TypeScript rejects invalid string literals before the code runs. At runtime, `parseStrict` delegates to `parse()`, which throws an `Error` for empty strings, non-string input, strings over 100 characters, and values that exceed `Number.MAX_SAFE_INTEGER`. Unrecognized-but-valid-looking strings return `NaN` as usual. The "strict" in the name refers to type-level strictness, but runtime guards are still active.

```ts
import { parseStrict } from 'durate';

parseStrict('5m')        // 300_000
parseStrict('garbage')   // TypeScript compile error
```

### format

Converts milliseconds to a human-readable string. Supports compound and precision output.

```ts
import { format } from 'durate';

format(3_600_000)                                // '1h'
format(3_600_000, { long: true })                // '1 hour'
format(7_200_000, { long: true })                // '2 hours'
format(500)                                      // '500ms'

// Compound — multiple units
format(5_425_000, { compound: true })            // '1h 30m 25s'
format(5_425_000, { compound: true, long: true }) // '1 hour 30 minutes 25 seconds'
format(5_425_000, { compound: true, parts: 2 })  // '1h 30m'

// Precision — decimal places
format(5_400_000, { precision: 1 })              // '1.5h'
format(5_425_000, { precision: 2 })              // '1.51h'

// Template — format string with tokens
format(5_425_000, { template: 'HH:mm:ss' })     // '01:30:25'
format(5_425_000, { template: 'H[h] m[m] s[s]' }) // '1h 30m 25s'
format(90_061_500, { template: 'D[d] HH:mm:ss' }) // '1d 01:01:01'
```

### durate (default export)

Bidirectional — string in, number out; number in, string out. Same as the default export.

```ts
import durate from 'durate';
// or
import { durate } from 'durate';

durate('2 days')                     // 172_800_000
durate(172_800_000)                  // '2d'
durate(172_800_000, { long: true })  // '2 days'
```

### toUnit

Convert a duration to a specific unit. Accepts a duration string or milliseconds.

```ts
import { toUnit } from 'durate';

toUnit('2h', 'minutes')       // 120
toUnit(86_400_000, 'h')       // 24
toUnit('1h 30m', 'm')         // 90
toUnit('1w', 'days')          // 7
toUnit('1y', 'months')        // 12
toUnit('garbage', 'ms')       // NaN
```

### parseISO

Parse an ISO 8601 duration string into milliseconds. Returns `NaN` for invalid input, never throws.

```ts
import { parseISO } from 'durate';

parseISO('PT1H30M')         // 5_400_000
parseISO('P1DT12H')         // 129_600_000
parseISO('P1Y2M3DT4H5M6S') // 37_091_106_000
parseISO('PT0.5S')          // 500
parseISO('not iso')          // NaN
```

### formatISO

Format milliseconds as an ISO 8601 duration string. Uses days as the largest unit (no weeks/months/years) for unambiguous round-tripping. Throws for non-finite numbers.

```ts
import { formatISO } from 'durate';

formatISO(5_400_000)        // 'PT1H30M'
formatISO(129_600_000)      // 'P1DT12H'
formatISO(500)              // 'PT0.5S'
formatISO(0)                // 'PT0S'
formatISO(-3_600_000)       // '-PT1H'
```

### Arithmetic

Perform math on durations without manual parsing. All accept `string | number` inputs and return milliseconds. Returns `NaN` if any input is invalid.

```ts
import { add, subtract, multiply, divide } from 'durate';

add('1h', '30m')              // 5_400_000
add('1h', '30m', '15s')      // 5_415_000
add(['1h', '30m'])            // 5_400_000
subtract('2d', '6h')          // 151_200_000
multiply('1h', 2)             // 7_200_000
multiply('1h', 2, 3)          // 21_600_000
divide('2h', 2)               // 3_600_000
divide('1d', 2, 3)            // 14_400_000
```

### Comparison

Compare durations directly. Returns `false` if either value is `NaN`.

```ts
import { gt, lt, eq, gte, lte } from 'durate';

gt('1h', '30m')               // true
lt('30m', '1h')               // true
eq('60m', '1h')               // true
gte('1h', '1h')               // true
lte('30m', '1h')              // true
```

## Options

### ParseOptions

```ts
parse('5m', { unit: 's' })           // 300 (seconds instead of ms)
parse('bad', { strict: true })              // throws instead of NaN
parse('1mo', { safeForTimer: 'throw' })    // throws (exceeds setTimeout max)
parse('1mo', { safeForTimer: 'clamp' })    // returns MAX_TIMEOUT (2_147_483_647)
```

| Option         | Type                      | Default     | Description                                         |
| -------------- | ------------------------- | ----------- | --------------------------------------------------- |
| `unit`         | `'ms' \| 's'`             | `'ms'`      | Output unit                                         |
| `strict`       | `boolean`                 | `false`     | Throw on invalid input instead of NaN               |
| `safeForTimer` | `'throw' \| 'clamp'`      | `undefined` | Guard against `setTimeout`/`setInterval` overflow   |

### FormatOptions

```ts
format(3_600_000, { long: true })                // '1 hour'
format(5_425_000, { compound: true })            // '1h 30m 25s'
format(5_425_000, { compound: true, parts: 2 })  // '1h 30m'
format(5_400_000, { precision: 1 })              // '1.5h'
format(5_425_000, { template: 'HH:mm:ss' })     // '01:30:25'
```

| Option      | Type      | Default     | Description                                          |
| ----------- | --------- | ----------- | ---------------------------------------------------- |
| `long`      | `boolean` | `false`     | Use full words instead of short                      |
| `compound`  | `boolean` | `false`     | Output multiple units (`"1h 30m 25s"`)               |
| `parts`     | `number`  | all         | Max number of units in compound output               |
| `precision` | `number`  | `0` (round) | Decimal places for single-unit output                |
| `template`  | `string`  | `undefined` | Format string with tokens (`"HH:mm:ss"`)            |

#### Template tokens

| Token | Description | Example |
| ----- | ----------- | ------- |
| `D`   | Days        | `1`     |
| `DD`  | Days (padded) | `01`  |
| `H`   | Hours       | `1`     |
| `HH`  | Hours (padded) | `01` |
| `m`   | Minutes     | `1`     |
| `mm`  | Minutes (padded) | `01` |
| `s`   | Seconds     | `1`     |
| `ss`  | Seconds (padded) | `01` |
| `S`   | Milliseconds (remainder) | `500` |
| `SS`  | Centiseconds (ms÷10, padded) | `50` |
| `SSS` | Milliseconds (zero-padded) | `005` |
| `[text]` | Literal text | `[h]` → `h` |

Values are remainder-based. If `D` is absent, `H` shows total hours.

## Supported Units

| Unit         | Short | Aliases                                         |
| ------------ | ----- | ----------------------------------------------- |
| Years        | `y`   | `yr`, `yrs`, `year`, `years`                    |
| Months       | `mo`  | `mon`, `mons`, `month`, `months`                |
| Weeks        | `w`   | `week`, `weeks`                                 |
| Days         | `d`   | `day`, `days`                                   |
| Hours        | `h`   | `hr`, `hrs`, `hour`, `hours`                    |
| Minutes      | `m`   | `min`, `mins`, `minute`, `minutes`              |
| Seconds      | `s`   | `sec`, `secs`, `second`, `seconds`              |
| Milliseconds | `ms`  | `msec`, `msecs`, `millisecond`, `milliseconds`  |

All units are case-insensitive.

## Timer Safety

`setTimeout` and `setInterval` use a 32-bit signed integer internally. Values above `2^31 - 1` (2,147,483,647 ms, ~24.85 days) overflow and the timer fires immediately. This means `parse('1mo')` or `parse('1y')` will silently break if passed directly to a timer.

Use the `safeForTimer` option to guard against this:

```ts
import { parse, MAX_TIMEOUT } from 'durate';

// Throws — 1 month exceeds the timer limit
parse('1mo', { safeForTimer: 'throw' })

// Clamps — returns MAX_TIMEOUT instead of overflowing
parse('1mo', { safeForTimer: 'clamp' })  // 2_147_483_647

// Works — 1 hour is well within range
setTimeout(callback, parse('1h', { safeForTimer: 'throw' }))

// Or check manually
const ms = parse('30d');
if (ms > MAX_TIMEOUT) { /* too large for setTimeout */ }
```

`MAX_TIMEOUT` is exported as a constant (`2_147_483_647`) for manual comparisons.

## TypeScript

The `DurationString` type catches invalid strings at compile time:

```ts
import type { DurationString } from 'durate';

const ttl: DurationString = '15m';       // ok
const bad: DurationString = 'garbage';   // compile error
```

## Migration from ms

```diff
- const ms = require('ms');
+ const ms = require('durate');
// everything else unchanged
```

Or with named exports:

```diff
- import ms from 'ms';
+ import { durate, parse, format, parseISO, formatISO, add, subtract, multiply, divide, gt, lt, eq, gte, lte } from 'durate';
```

`parse` and `format` signatures are identical. See the [full migration guide](https://akoreh.github.io/durate/migration) for behavioral differences.

## Browser

```html
<script src="https://unpkg.com/durate"></script>
<script>
  durate('1h')  // 3_600_000
</script>
```

## License

MIT
