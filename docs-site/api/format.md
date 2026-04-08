# format

Converts milliseconds to a human-readable duration string.

```ts
import { format } from 'durate';
```

## Signature

```ts
function format(ms: number, options?: FormatOptions): string
```

## Short Format (default)

```ts
format(500)             // '500ms'
format(1_000)           // '1s'
format(60_000)          // '1m'
format(3_600_000)       // '1h'
format(86_400_000)      // '1d'
format(604_800_000)     // '1w'
format(2_629_800_000)   // '1mo'
format(31_557_600_000)  // '1y'
format(-3_600_000)      // '-1h'
```

## Long Format

```ts
format(1_000, { long: true })        // '1 second'
format(2_000, { long: true })        // '2 seconds'
format(60_000, { long: true })       // '1 minute'
format(3_600_000, { long: true })    // '1 hour'
format(86_400_000, { long: true })   // '1 day'
```

Pluralization kicks in at >= 1.5x the unit value.

## Compound Format

Output multiple units instead of a single rounded one:

```ts
format(5_425_000, { compound: true })                    // '1h 30m 25s'
format(5_425_000, { compound: true, long: true })        // '1 hour 30 minutes 25 seconds'
format(5_425_000, { compound: true, parts: 2 })          // '1h 30m'
format(5_425_000, { compound: true, long: true, parts: 2 }) // '1 hour 30 minutes'
format(90_000_000, { compound: true })                   // '1d 1h'
format(-5_400_000, { compound: true })                   // '-1h 30m'
```

## Precision

Control decimal places for single-unit output:

```ts
format(5_400_000, { precision: 1 })   // '1.5h'
format(5_425_000, { precision: 2 })   // '1.51h'
format(90_000, { precision: 1 })      // '1.5m'
format(1_500, { precision: 1 })       // '1.5s'
```

## Template Format

Use a format string with tokens. Brackets escape literal text.

```ts
format(5_425_000, { template: 'HH:mm:ss' })          // '01:30:25'
format(5_425_000, { template: 'H:m:s' })              // '1:30:25'
format(5_425_000, { template: 'H[h] m[m] s[s]' })    // '1h 30m 25s'
format(90_061_500, { template: 'D[d] HH:mm:ss' })    // '1d 01:01:01'
format(1_500, { template: 's.SSS' })                  // '1.005'
format(0, { template: 'HH:mm:ss' })                   // '00:00:00'
format(-3_661_000, { template: 'H:mm:ss' })           // '-1:01:01'
```

| Token | Description | Padded | Example |
|-------|-------------|--------|---------|
| `D` / `DD` | Days | `DD` pads to 2 | `1` / `01` |
| `H` / `HH` | Hours | `HH` pads to 2 | `1` / `01` |
| `m` / `mm` | Minutes | `mm` pads to 2 | `1` / `01` |
| `s` / `ss` | Seconds | `ss` pads to 2 | `1` / `01` |
| `S` / `SS` / `SSS` | Milliseconds | `SSS` pads to 3 | `500` / `50` / `005` |
| `[text]` | Literal escape | — | `[h]` → `h` |

Values are remainder-based: if `D` is present, `H` shows hours within the day. If `D` is absent, `H` shows total hours.

## Error Handling

Throws for non-finite numbers:

```ts
format(NaN)       // throws
format(Infinity)  // throws
```
