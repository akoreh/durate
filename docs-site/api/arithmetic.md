# Arithmetic

Math operations on durations. All functions accept `string | number` inputs (strings are parsed via `parse`) and return milliseconds as a `number`.

```ts
import { add, subtract, multiply, divide } from 'durate';
```

---

## add

Sum any number of durations. Accepts variadic arguments or a single array.

### Signature

```ts
function add(...durations: (string | number | (string | number)[])[]): number
```

### Examples

```ts
add('1h', '30m')              // 5_400_000
add('1h', '30m', '15s')      // 5_415_000
add(['1h', '30m'])            // 5_400_000
add('1h', 1000)              // 3_601_000
```

### Error handling

Returns `NaN` if any duration is unparseable.

```ts
add('1h', 'garbage')          // NaN
add('garbage')                // NaN
```

---

## subtract

Subtract durations from the first value. Accepts variadic arguments or a single array.

### Signature

```ts
function subtract(...durations: (string | number | (string | number)[])[]): number
```

### Examples

```ts
subtract('2d', '6h')          // 151_200_000
subtract('1d', '2h', '30m')  // 77_400_000
subtract(['2d', '6h'])        // 151_200_000
```

### Error handling

Returns `NaN` if any duration is unparseable.

```ts
subtract('2d', 'garbage')     // NaN
subtract('garbage', '1h')     // NaN
```

---

## multiply

Multiply a duration by one or more scalar numbers, applied in order.

### Signature

```ts
function multiply(value: string | number, ...scalars: number[]): number
```

### Parameters

| Parameter  | Type               | Description                                    |
| ---------- | ------------------ | ---------------------------------------------- |
| `value`    | `string \| number` | Duration string or milliseconds               |
| `scalars`  | `number[]`         | One or more scalar multipliers applied in order |

### Examples

```ts
multiply('1h', 2)             // 7_200_000
multiply('1h', 2, 3)          // 21_600_000
multiply('2h', 0.5)          // 3_600_000
```

### Error handling

Returns `NaN` if the duration is unparseable or any scalar is not a number.

```ts
multiply('garbage', 2)        // NaN
```

---

## divide

Divide a duration by one or more scalar numbers, applied in order.

### Signature

```ts
function divide(value: string | number, ...scalars: number[]): number
```

### Parameters

| Parameter  | Type               | Description                                   |
| ---------- | ------------------ | --------------------------------------------- |
| `value`    | `string \| number` | Duration string or milliseconds              |
| `divisors` | `number[]`         | One or more scalar divisors applied in order  |

### Examples

```ts
divide('2h', 2)               // 3_600_000
divide('1d', 2, 3)            // 14_400_000
```

### Error handling

Returns `NaN` if the duration is unparseable, any divisor is not a number, or any divisor is zero.

```ts
divide('1h', 0)               // NaN
divide('garbage', 2)          // NaN
```
