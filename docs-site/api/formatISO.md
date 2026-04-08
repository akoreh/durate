# formatISO

Format milliseconds as an ISO 8601 duration string.

```ts
import { formatISO } from 'durate';
```

## Signature

```ts
function formatISO(ms: number): string
```

## Parameters

| Parameter | Type     | Description                  |
| --------- | -------- | ---------------------------- |
| `ms`      | `number` | The duration in milliseconds |

## Returns

An ISO 8601 duration string (e.g. `"P1DT12H"`, `"PT1H30M"`).

## Examples

### Basic usage

```ts
formatISO(3_600_000)        // 'PT1H'
formatISO(5_400_000)        // 'PT1H30M'
formatISO(86_400_000)       // 'P1D'
formatISO(129_600_000)      // 'P1DT12H'
```

### Zero

```ts
formatISO(0)                // 'PT0S'
```

### Sub-second precision

Sub-second values are formatted to up to 3 decimal places:

```ts
formatISO(500)              // 'PT0.5S'
formatISO(1_500)            // 'PT1.5S'
formatISO(100)              // 'PT0.1S'
formatISO(1)                // 'PT0.001S'
```

### Negative values

Negative durations are prefixed with `-`:

```ts
formatISO(-3_600_000)       // '-PT1H'
formatISO(-86_400_000)      // '-P1D'
formatISO(-5_400_000)       // '-PT1H30M'
```

### Multi-component output

```ts
formatISO(90_061_500)       // 'P1DT1H1M1.5S'
formatISO(90_000_000)       // 'P1DT1H'
formatISO(5_425_000)        // 'PT1H30M25S'
```

### Largest unit is days

Output uses days as the largest unit (no weeks, months, or years) for unambiguous round-tripping:

```ts
formatISO(604_800_000)      // 'P7D' (not 'P1W')
formatISO(2_592_000_000)    // 'P30D' (not 'P1M')
```

## Error Handling

Throws for non-finite numbers:

```ts
formatISO(NaN)              // throws
formatISO(Infinity)         // throws
formatISO(-Infinity)        // throws
```

Throws for non-number input:

```ts
formatISO('1h')             // throws
formatISO(null)             // throws
formatISO(undefined)        // throws
```
