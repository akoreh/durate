# parseStrict

Identical to [`parse`](/api/parse) but with a compile-time typed input — invalid strings cause TypeScript errors.

```ts
import { parseStrict } from 'durate';
```

## Signature

```ts
function parseStrict(str: DurationString, options?: ParseOptions): number
```

## Usage

```ts
parseStrict('5m')          // 300_000
parseStrict('1 hour')      // 3_600_000
parseStrict('garbage')     // TypeScript compile error
```

## When to Use

Use `parseStrict` when the input is a string literal or a value you control. Use [`parse`](/api/parse) when the input comes from user input or external data where you need runtime `NaN` handling.
