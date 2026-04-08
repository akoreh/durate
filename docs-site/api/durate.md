# durate

Bidirectional duration conversion — the default export.

```ts
import durate from 'durate';
// or
import { durate } from 'durate';
```

## Signature

```ts
function durate(value: DurationString, options?: ParseOptions): number
function durate(value: number, options?: FormatOptions): string
```

## Usage

Pass a string to get milliseconds, pass a number to get a formatted string:

```ts
durate('2 days')                     // 172_800_000
durate(172_800_000)                  // '2d'
durate(172_800_000, { long: true })  // '2 days'
```

## How It Works

- String input calls [`parse`](/api/parse) with [`ParseOptions`](/api/types#parseoptions)
- Number input calls [`format`](/api/format) with [`FormatOptions`](/api/types#formatoptions)
- Anything else throws

This is a convenience wrapper. Use `parse` and `format` directly when you want explicit control over input/output types.
