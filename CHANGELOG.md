# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-08

### Added

- **Core:** `parse()` — duration string to milliseconds, supports single units (`"1h"`), compound strings (`"1h 30m"`), bare numbers (`"100"`), and ISO 8601 auto-detection (`"PT1H30M"`)
- **Core:** `format()` — milliseconds to human-readable string with short, long, compound, precision, and template modes
- **Core:** `durate()` — bidirectional default export (string in → number out, number in → string out), drop-in `ms` replacement
- **Core:** `parseStrict()` — compile-time typed input via `DurationString` branded type
- **Unit conversion:** `toUnit()` — convert a duration to a specific unit (`toUnit('2h', 'minutes')` → `120`)
- **ISO 8601:** `parseISO()` / `formatISO()` — dedicated ISO 8601 duration parse and format
- **Arithmetic:** `add()`, `subtract()`, `multiply()`, `divide()` — duration math with variadic and array inputs
- **Comparison:** `gt()`, `lt()`, `eq()`, `gte()`, `lte()` — compare durations directly
- **Types:** `DurationString` branded template literal type catches invalid strings at compile time
- **Safety:** `safeForTimer` option guards against `setTimeout` overflow (clamp or throw)
- **Constant:** `MAX_TIMEOUT` exported for manual timer-safety checks
- **Template formatting:** token-based format strings (`"HH:mm:ss"`, `"D[d] H[h]"`)
- **Units:** years, months, weeks, days, hours, minutes, seconds, milliseconds — all case-insensitive with multiple aliases
- **Builds:** ESM, CJS, and IIFE browser global from a single package
- **Zero runtime dependencies**

[1.0.0]: https://github.com/akoreh/durate/releases/tag/v1.0.0
