# parse

Converts a duration string to milliseconds. Supports single units, compound units, and ISO 8601 duration strings (auto-detected).

```ts
import { parse } from 'durate';
```

## Signature

```ts
function parse(str: string, options?: ParseOptions): number
```

## Usage

```ts
parse('1h')              // 3_600_000
parse('5 minutes')       // 300_000
parse('1h 30m')          // 5_400_000 (compound)
parse('2d 6h 30m')       // 196_200_000 (compound)
parse('100')             // 100 (bare number = ms)
parse('.5s')             // 500
parse('-1s')             // -1_000
parse('2HOURS')          // 7_200_000 (case-insensitive)
parse('PT1H30M')         // 5_400_000 (ISO 8601 auto-detected)
parse('P1D')             // 86_400_000 (ISO 8601 auto-detected)
```

## Output Unit

By default returns milliseconds. Pass `{ unit: 's' }` for seconds:

```ts
parse('5m', { unit: 's' })     // 300
parse('500ms', { unit: 's' })  // 0.5
```

## Strict Mode

Throw on invalid input instead of returning `NaN`:

```ts
parse('garbage')                     // NaN
parse('garbage', { strict: true })   // throws
```

## Timer Safety

`setTimeout` / `setInterval` overflow at 2^31 - 1 ms (~24.85 days). Use `safeForTimer` to guard against this:

```ts
parse('1mo', { safeForTimer: 'throw' })   // throws
parse('1mo', { safeForTimer: 'clamp' })   // 2_147_483_647 (MAX_TIMEOUT)
parse('1h', { safeForTimer: 'throw' })    // 3_600_000 (within range, no effect)
```

The `MAX_TIMEOUT` constant is exported for manual checks:

```ts
import { parse, MAX_TIMEOUT } from 'durate';

const ms = parse('30d');
if (ms > MAX_TIMEOUT) { /* too large for setTimeout */ }
```

## Error Handling

```ts
// Returns NaN for unrecognized strings
parse('garbage')                         // NaN
parse('10xyz')                           // NaN
parse('abc1s')                           // NaN

// Throws with strict mode
parse('garbage', { strict: true })       // throws

// Throws for non-string input
parse(null)                              // throws
parse(undefined)                         // throws

// Throws for empty or oversized strings
parse('')                                // throws
parse('x'.repeat(101))                   // throws

// Throws for values beyond MAX_SAFE_INTEGER
parse('9'.repeat(20) + 'y')             // throws

// Timer overflow guard
parse('1mo', { safeForTimer: 'throw' }) // throws
parse('1mo', { safeForTimer: 'clamp' }) // 2_147_483_647 (MAX_TIMEOUT)
```

## Supported Units

| Unit | Short | Aliases |
|------|-------|---------|
| Years | `y` | `yr`, `yrs`, `year`, `years` |
| Months | `mo` | `mon`, `mons`, `month`, `months` |
| Weeks | `w` | `week`, `weeks` |
| Days | `d` | `day`, `days` |
| Hours | `h` | `hr`, `hrs`, `hour`, `hours` |
| Minutes | `m` | `min`, `mins`, `minute`, `minutes` |
| Seconds | `s` | `sec`, `secs`, `second`, `seconds` |
| Milliseconds | `ms` | `msec`, `msecs`, `millisecond`, `milliseconds` |
