# Getting Started

## Install

```sh
npm install durate
```

## Quick Start

```ts
import durate from 'durate';

durate('2 days')     // 172_800_000
durate(172_800_000)  // '2d'
```

## What It Does

`durate` converts between human-readable duration strings and milliseconds. Pass a string, get a number. Pass a number, get a string. That's it.

The default export is a bidirectional function — it detects the input type and calls [`parse`](/api/parse) or [`format`](/api/format) under the hood.

## Named Exports

For explicit control, use the named exports:

```ts
import { parse, parseStrict, format, toUnit, parseISO, formatISO, add, subtract, gt, eq } from 'durate';

parse('5 minutes')                    // 300_000
parse('garbage')                      // NaN
parseStrict('5m')                     // 300_000 (compile-time checked)
format(300_000)                       // '5m'
format(300_000, { long: true })       // '5 minutes'
toUnit('2h', 'minutes')              // 120
toUnit(86_400_000, 'h')              // 24
parseISO('PT1H30M')                  // 5_400_000
formatISO(5_400_000)                 // 'PT1H30M'
add('1h', '30m')                     // 5_400_000
subtract('2d', '6h')                 // 151_200_000
gt('1h', '30m')                      // true
eq('60m', '1h')                      // true
```

## Browser

```html
<script src="https://unpkg.com/durate"></script>
<script>
  durate('1h')  // 3_600_000
</script>
```

## Next Steps

- [parse](/api/parse) — full parsing API
- [format](/api/format) — full formatting API
- [toUnit](/api/toUnit) — convert durations to specific units
- [parseISO](/api/parseISO) — parse ISO 8601 duration strings
- [formatISO](/api/formatISO) — format ms as ISO 8601 strings
- [Arithmetic](/api/arithmetic) — add, subtract, multiply, divide durations
- [Comparison](/api/comparison) — gt, lt, eq, gte, lte duration comparisons
- [Types](/api/types) — `DurationString`, `FormatOptions`, `ParseOptions`
- [Migration from ms](/migration) — drop-in replacement guide
