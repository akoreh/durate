# parseISO

Parse an ISO 8601 duration string into milliseconds.

```ts
import { parseISO } from 'durate';
```

## Signature

```ts
function parseISO(str: string): number
```

## Parameters

| Parameter | Type     | Description                                      |
| --------- | -------- | ------------------------------------------------ |
| `str`     | `string` | An ISO 8601 duration string (e.g. `"PT1H30M"`)  |

## Returns

The duration in milliseconds. Returns `NaN` for invalid or non-ISO input.

## Examples

### Basic usage

```ts
parseISO('PT1H')             // 3_600_000
parseISO('PT30M')            // 1_800_000
parseISO('PT1H30M')         // 5_400_000
parseISO('P1D')              // 86_400_000
parseISO('P1DT12H')         // 129_600_000
```

### All components

```ts
parseISO('P1Y2M3DT4H5M6S') // 37_091_106_000
parseISO('P1Y')              // 31_557_600_000
parseISO('P1M')              // 2_629_800_000
parseISO('P1W')              // 604_800_000
```

### Fractional values

```ts
parseISO('PT0.5S')          // 500
parseISO('PT1.5H')          // 5_400_000
parseISO('P0.5D')           // 43_200_000
```

### Seconds only

```ts
parseISO('PT1S')             // 1_000
parseISO('PT30S')            // 30_000
parseISO('PT0S')             // 0
```

### Zero duration

```ts
parseISO('PT0S')             // 0
parseISO('P0D')              // 0
```

## Error Handling

`parseISO` never throws. It returns `NaN` for all invalid inputs:

```ts
parseISO('not iso')          // NaN
parseISO('')                 // NaN
parseISO('P')                // NaN (no components)
parseISO('1h 30m')           // NaN (not ISO format)
parseISO('garbage')          // NaN
```

Non-string input returns `NaN`:

```ts
parseISO(123)                // NaN
parseISO(null)               // NaN
parseISO(undefined)          // NaN
```

## Auto-detection in parse

`parse()` automatically detects ISO 8601 duration strings, so you can use either:

```ts
import { parse, parseISO } from 'durate';

parse('PT1H30M')            // 5_400_000 (auto-detected)
parseISO('PT1H30M')         // 5_400_000 (explicit)
```

Use `parseISO` when you want to ensure only ISO 8601 format is accepted. Use `parse` when you want to accept any duration format.
