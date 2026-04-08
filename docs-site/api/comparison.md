# Comparison

Compare two durations. All functions accept `string | number` inputs (strings are parsed via `parse`) and return a `boolean`. Returns `false` if either value is `NaN` (unparseable).

```ts
import { gt, lt, eq, gte, lte } from 'durate';
```

---

## gt

Returns `true` if duration `a` is strictly greater than `b`.

### Signature

```ts
function gt(a: string | number, b: string | number): boolean
```

### Examples

```ts
gt('1h', '30m')               // true
gt('30m', '1h')               // false
gt('1h', '1h')                // false
```

### NaN behavior

Returns `false` if either value is unparseable.

```ts
gt('garbage', '1h')           // false
gt('1h', 'garbage')           // false
```

---

## lt

Returns `true` if duration `a` is strictly less than `b`.

### Signature

```ts
function lt(a: string | number, b: string | number): boolean
```

### Examples

```ts
lt('30m', '1h')               // true
lt('1h', '30m')               // false
lt('1h', '1h')                // false
```

### NaN behavior

Returns `false` if either value is unparseable.

```ts
lt('garbage', '1h')           // false
lt('1h', 'garbage')           // false
```

---

## eq

Returns `true` if durations `a` and `b` are exactly equal in milliseconds.

### Signature

```ts
function eq(a: string | number, b: string | number): boolean
```

### Examples

```ts
eq('60m', '1h')               // true
eq('1h', '30m')               // false
eq(3_600_000, '1h')           // true
```

### NaN behavior

Returns `false` if either value is unparseable (NaN !== NaN).

```ts
eq('garbage', '1h')           // false
eq('garbage', 'garbage')      // false
```

---

## gte

Returns `true` if duration `a` is greater than or equal to `b`.

### Signature

```ts
function gte(a: string | number, b: string | number): boolean
```

### Examples

```ts
gte('1h', '1h')               // true
gte('1h', '30m')              // true
gte('30m', '1h')              // false
```

### NaN behavior

Returns `false` if either value is unparseable.

```ts
gte('garbage', '1h')          // false
gte('1h', 'garbage')          // false
```

---

## lte

Returns `true` if duration `a` is less than or equal to `b`.

### Signature

```ts
function lte(a: string | number, b: string | number): boolean
```

### Examples

```ts
lte('30m', '1h')              // true
lte('1h', '1h')               // true
lte('1h', '30m')              // false
```

### NaN behavior

Returns `false` if either value is unparseable.

```ts
lte('garbage', '1h')          // false
lte('1h', 'garbage')          // false
```
