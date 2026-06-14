# Production Readiness Rubric

> Written before any audit. These are the standards. Audit happens after this is committed.

---

## 1. Environment Configuration

- [ ] **ENV-01** — All required environment variables are documented in `.env.example`
- [ ] **ENV-02** — `.env.example` is committed; `.env` is in `.gitignore`
- [ ] **ENV-03** — App throws (or logs fatally) at startup when a required var is missing — not a silent undefined
- [ ] **ENV-04** — No secrets, API keys, or tokens hardcoded in source files
- [ ] **ENV-05** — Variables that are safe to expose to the client are prefixed `NEXT_PUBLIC_` (and nothing else is)
- [ ] **ENV-06** — README calls out exactly which vars to populate before running

---

## 2. CI Pipeline

- [ ] **CI-01** — A CI config file exists (`.github/workflows/`, etc.)
- [ ] **CI-02** — CI runs `tsc --noEmit` (type check) on every push / PR
- [ ] **CI-03** — CI runs linter (`eslint`, `next lint`) on every push / PR
- [ ] **CI-04** — CI runs `next build` on every push / PR — no broken builds ship
- [ ] **CI-05** — CI runs the test suite on every push / PR
- [ ] **CI-06** — CI fails fast: type errors, lint errors, and test failures each block merge
- [ ] **CI-07** — No secrets in CI config or workflow files

---

## 3. Logging

- [ ] **LOG-01** — `console.log` is absent from production code paths (debug logs removed or gated)
- [ ] **LOG-02** — No PII (names, emails, IDs, tokens) appears in log output
- [ ] **LOG-03** — Errors caught at boundaries include enough context to reproduce (route, action, relevant state shape — not raw user data)
- [ ] **LOG-04** — Unhandled promise rejections are caught — no silent swallows
- [ ] **LOG-05** — Server-side errors are logged server-side; client gets a sanitized message

---

## 4. Security Headers

- [ ] **SEC-01** — `X-Frame-Options: DENY` (or CSP `frame-ancestors`) — prevents clickjacking
- [ ] **SEC-02** — `X-Content-Type-Options: nosniff` — prevents MIME-type sniffing
- [ ] **SEC-03** — `Referrer-Policy: strict-origin-when-cross-origin` (or stricter)
- [ ] **SEC-04** — `Content-Security-Policy` header exists with at least `default-src 'self'`; `'unsafe-inline'` justified if present
- [ ] **SEC-05** — `Permissions-Policy` disables unused browser features (camera, mic, geolocation)
- [ ] **SEC-06** — Headers applied globally (in `next.config.*` or middleware), not page-by-page
- [ ] **SEC-07** — No `Access-Control-Allow-Origin: *` on endpoints that return user data

---

## 5. README / Developer Onboarding

- [ ] **DOC-01** — README states the minimum Node/pnpm/npm version required
- [ ] **DOC-02** — README has a copy-pasteable "fresh clone → running app" sequence (≤6 commands, no ambiguity)
- [ ] **DOC-03** — README explains how to run tests
- [ ] **DOC-04** — README explains how to run a production build locally
- [ ] **DOC-05** — README describes what the app is (one paragraph) — a new hire should know what they're looking at

---

## 6. Type Safety

- [ ] **TS-01** — `"strict": true` in `tsconfig.json`
- [ ] **TS-02** — No `any` casts in application code (test files excepted)
- [ ] **TS-03** — `tsc --noEmit` exits 0 — zero type errors
- [ ] **TS-04** — No `@ts-ignore` or `@ts-expect-error` without an inline explanation

---

## 7. Error Handling

- [ ] **ERR-01** — A global error boundary exists (`app/error.tsx`) — crashes don't show a blank screen
- [ ] **ERR-02** — A `not-found.tsx` (404) page exists and renders something meaningful
- [ ] **ERR-03** — API routes return structured error responses (`{ error: string }`) with correct HTTP status codes — never raw JS errors
- [ ] **ERR-04** — Client-side fetch calls handle non-2xx responses explicitly — no silent failures

---

## 8. Test Coverage

- [ ] **TEST-01** — A test runner is configured and `npm test` exits 0
- [ ] **TEST-02** — Core business logic (store actions, trade lifecycle, item calculations) has unit tests
- [ ] **TEST-03** — At least one integration or E2E smoke test covers the happy path (load app → interact → expected state)
- [ ] **TEST-04** — No skipped or `.todo` tests in CI paths

---

## 9. Build & Bundle Health

- [ ] **BUILD-01** — `next build` exits 0 with no errors
- [ ] **BUILD-02** — No unused dependencies in `package.json` that meaningfully inflate bundle size
- [ ] **BUILD-03** — Images use `next/image` (not raw `<img>`) for automatic optimization
- [ ] **BUILD-04** — Dynamic imports used for heavy non-critical components where measurably beneficial

---

## 10. Accessibility (baseline)

- [ ] **A11Y-01** — Interactive elements (buttons, inputs) have accessible labels (text content or `aria-label`)
- [ ] **A11Y-02** — Color is not the only way information is conveyed (e.g., error states have text too)
- [ ] **A11Y-03** — Keyboard navigation reaches all interactive elements without a mouse

---

## Scoring

| Grade | Criteria |
|-------|----------|
| **Ship** | All MUST items pass; ≥80% of total pass |
| **Ship w/ tickets** | All MUST items pass; 60–79% total pass |
| **Do not ship** | Any MUST item fails |

**MUST items (blocking):** ENV-03, ENV-04, CI-04, SEC-01–SEC-06, TS-03, ERR-01, BUILD-01
