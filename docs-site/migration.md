# Migration from ms

`durate` is a drop-in replacement for `ms`. The API is identical for all inputs `ms` accepts.

## v2 (default export)

```diff
- const ms = require('ms');
+ const durate = require('durate');

- ms('2 days')
+ durate('2 days')
```

Or alias it — zero code changes:

```diff
- const ms = require('ms');
+ const ms = require('durate');
// everything else unchanged
```

## v3 (named exports)

```diff
- import { ms, parse, format } from 'ms';
+ import { durate, parse, format } from 'durate';
```

`parse`, `parseStrict`, and `format` have identical signatures. The only rename is `ms()` to `durate()`.

## Behavioral Differences

| Behavior | ms v2 | durate |
|----------|-------|--------|
| Months support | No | Yes |
| `format` weeks/years/months | No (`7d`, `365d`) | Yes (`1w`, `1y`, `1mo`) |
| TypeScript types | External `@types/ms` | Bundled |
| `DurationString` type | No | Yes |
| CJS support | Yes (only) | Yes (dual) |
| ESM support | No | Yes |
| Browser global | No | Yes |
| Failed parse return | `undefined` | `NaN` |
| `mon`/`mons` aliases | No | Yes |

The format differences (weeks, years, months appearing in output) are the main behavioral change for existing code. If your code compares format output against exact strings like `"7d"`, update those comparisons.
