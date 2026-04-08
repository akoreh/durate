# Contributing

Thanks for your interest in contributing to durate.

## Setup

```bash
git clone https://github.com/akoreh/durate.git
cd durate
npm install
```

## Development Workflow

### 1. Pick or open an issue

Check [existing issues](https://github.com/akoreh/durate/issues) first. For non-trivial changes, open an issue to discuss the approach before writing code.

### 2. Create a branch

```bash
git checkout -b my-change
```

### 3. Write a failing test

Every change starts with a test. Add your test to the relevant file in `tests/` (or create a new one if adding a new module).

```bash
npx vitest run tests/parse.test.ts   # run a single test file
npm test                              # run all tests
npm run test:watch                    # watch mode
```

### 4. Write minimal code to pass

Implement the simplest thing that makes the test green. Don't add features, options, or abstractions beyond what the test requires.

### 5. Verify everything passes

```bash
npm test              # 1207+ tests must pass
npm run typecheck     # no TypeScript errors
npm run lint          # no ESLint errors
npm run build         # builds ESM, CJS, IIFE
npm run size          # must stay under 3 kB brotli
```

All four checks run in CI. A pre-commit hook runs `lint-staged` (prettier + eslint on staged files) automatically.

### 6. Open a PR

PRs should be focused — one feature or fix per PR. The [PR template](/.github/pull_request_template.md) will guide you.

## Project Structure

```
src/
  constants.ts   Unit multipliers, regex patterns, shared unit map
  types.ts       DurationString branded type, FormatOptions, ParseOptions
  parse.ts       parse(), parseStrict(), toMs()
  format.ts      format() with short/long/compound/precision/template modes
  durate.ts      Bidirectional default export
  toUnit.ts      toUnit() — convert to a specific unit
  iso.ts         parseISO(), formatISO()
  math.ts        add, subtract, multiply, divide, gt, lt, eq, gte, lte
  index.ts       Public API surface (re-exports only)
tests/
  *.test.ts      Unit tests (vitest)
  security.test.ts  Red-team security tests
docs/
  design.md              Architecture decisions
  equivalent-mutants.md  Stryker triage guide
docs-site/               VitePress documentation site
```

## Key Constraints

- **< 3 kB brotli.** Run `npm run size` after changes. If you're over budget, optimize before adding flags or options.
- **ms v2 compatibility.** The default export must behave identically to `ms@2.1.3`. See `tests/compat.test.ts`.
- **Zero dependencies.** No runtime deps. Dev deps are fine.
- **Universal output.** ESM + CJS + IIFE must all work. Never break either import style.
- **Input length capped at 100 characters.** Same as ms.
- **Year = 365.25 days, Month = year/12.** Matches ms v3 constants.

## Testing

### Unit tests

Tests live in `tests/` and use [Vitest](https://vitest.dev/). Each source module has a corresponding test file plus shared test files for cross-cutting concerns (compat, security, edge cases).

Test constants are intentionally duplicated from source — tests must not trust `src/constants.ts`.

### Mutation testing

```bash
npm run test:mutate    # Stryker mutation testing
```

Current score: ~92%. The break threshold is 90%. Before chasing surviving mutants, check [`docs/equivalent-mutants.md`](docs/equivalent-mutants.md) — most survivors are provably unkillable (NaN propagation, regex fallback paths, unreachable guards).

### Security tests

`tests/security.test.ts` covers prototype pollution, ReDoS, type coercion bypass, unicode attacks, integer overflow, and monkey-patched builtins. New parsing or formatting functions should get corresponding security tests.

## Code Style

Enforced automatically:

- **Prettier:** single quotes, trailing commas, 100-char width
- **ESLint:** typescript-eslint strict + prettier
- **Pre-commit hook:** `lint-staged` runs prettier + eslint on staged files

Run `npm run lint:fix` and `npm run format` to auto-fix.

## Adding a New Unit Alias

Unit aliases are defined in one place: `unitMap` in `src/constants.ts`. Add the alias there. Then update the two regex patterns (`durationPattern`, `compoundPattern`) in the same file, and the `DurationString` type unions in `src/types.ts`.

## Adding a New Public Function

1. Add the implementation in the appropriate `src/` module (or create a new one)
2. Export it from `src/index.ts`
3. Add comprehensive tests in `tests/`
4. Add security tests in `tests/security.test.ts`
5. Add a JSDoc comment on the export
6. Update `README.md`, `docs-site/`, and `docs-site/public/llms.txt`
7. Run `npm run size` to verify bundle budget
