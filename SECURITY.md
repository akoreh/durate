# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | Yes       |

## Reporting a Vulnerability

Please report security vulnerabilities by emailing **contact@akoreh.com**. Do not open a public issue.

You should receive a response within 72 hours. If accepted, a fix will be released as a patch version and credited in the changelog (unless you prefer to remain anonymous).

## Known Mitigations

durate includes defenses against the two ReDoS vulnerabilities that affected the `ms` package:

- **CVE-2015-8315** / **CVE-2017-20162** — Input length is capped at 100 characters (`MAX_INPUT_LENGTH`), limiting worst-case regex execution to < 1ms. Inputs exceeding this limit are rejected before reaching the regex engine.
- **Prototype pollution** — Internal lookup maps use `Object.create(null)` to prevent prototype chain injection.
- **Type coercion** — All public functions perform strict `typeof` checks. Boxed primitives, objects with `valueOf`/`toString`, and other coercion vectors are rejected.

## Scope

This policy covers the `durate` npm package. The documentation site (`docs-site/`) is not in scope.
