# toUnit

Convert a duration to a specific unit.

```ts
import { toUnit } from 'durate';
```

## Signature

```ts
function toUnit(value: string | number, unit: string): number
```

## Parameters

| Parameter | Type               | Description                                         |
| --------- | ------------------ | --------------------------------------------------- |
| `value`   | `string \| number` | Duration string (`"2h"`, `"1h 30m"`) or milliseconds |
| `unit`    | `string`           | Target unit name or alias (case-insensitive)        |

## Returns

The duration expressed in the target unit. Returns `NaN` if the input is unparseable or the target unit is unrecognised.

## Examples

### String input

```ts
toUnit('2h', 'minutes')       // 120
toUnit(86_400_000, 'h')       // 24
toUnit('1h 30m', 'm')         // 90
toUnit('1w', 'days')          // 7
toUnit('1y', 'months')        // 12
toUnit('1d', 's')             // 86_400
toUnit('500ms', 's')          // 0.5
toUnit('2000ms', 's')         // 2
```

### Number input (milliseconds)

```ts
toUnit(3_600_000, 'minutes')  // 60
toUnit(86_400_000, 'h')       // 24
toUnit(1_000, 's')            // 1
toUnit(0, 'hours')            // 0
toUnit(500, 's')              // 0.5
```

### Compound strings

```ts
toUnit('1h 30m', 'minutes')   // 90
toUnit('2d 6h', 'hours')      // 54
toUnit('1h 30m 45s', 's')     // 5445
toUnit('1w 2d', 'd')          // 9
```

### Bare number strings

Bare numbers without a unit are treated as milliseconds (same as `parse`):

```ts
toUnit('5000', 's')            // 5
toUnit('60000', 'm')           // 1
```

### Fractional results

Results are not rounded — you get the exact division:

```ts
toUnit('30m', 'h')            // 0.5
toUnit('1h', 'd')             // 0.041666... (1/24)
toUnit('1d', 'w')             // 0.142857... (1/7)
toUnit('1ms', 's')            // 0.001
```

### Decimal input strings

```ts
toUnit('1.5h', 'm')           // 90
toUnit('.5s', 'ms')           // 500
```

### Negative durations

```ts
toUnit('-2h', 'minutes')      // -120
toUnit(-3_600_000, 'h')       // -1
toUnit('-1.5h', 'm')          // -90
```

### Case-insensitive target unit

```ts
toUnit('1h', 'MINUTES')       // 60
toUnit('1h', 'Minutes')       // 60
toUnit('1h', 'min')           // 60
toUnit('1h', 'mins')          // 60
```

## Error handling

`toUnit` never throws. It returns `NaN` for all invalid inputs:

```ts
toUnit('garbage', 'ms')       // NaN (unparseable value)
toUnit('1h', 'foobar')        // NaN (unknown target unit)
toUnit('', 'ms')              // NaN (empty string)
toUnit('   ', 'ms')           // NaN (whitespace-only)
```

When the number input is `NaN`, the result is `NaN`:

```ts
toUnit(NaN, 's')              // NaN
```

`Infinity` is preserved:

```ts
toUnit(Infinity, 's')         // Infinity
toUnit(-Infinity, 's')        // -Infinity
```

## Supported target units

Any unit alias from the [supported units](/api/types#supported-units) table works as a target. All are case-insensitive.

| Unit         | Accepted target strings                              |
| ------------ | ---------------------------------------------------- |
| Milliseconds | `ms`, `msec`, `msecs`, `millisecond`, `milliseconds` |
| Seconds      | `s`, `sec`, `secs`, `second`, `seconds`              |
| Minutes      | `m`, `min`, `mins`, `minute`, `minutes`              |
| Hours        | `h`, `hr`, `hrs`, `hour`, `hours`                    |
| Days         | `d`, `day`, `days`                                   |
| Weeks        | `w`, `week`, `weeks`                                 |
| Months       | `mo`, `mon`, `mons`, `month`, `months`               |
| Years        | `y`, `yr`, `yrs`, `year`, `years`                    |
