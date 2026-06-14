# Production Readiness Rubric

> Written before opening or auditing the project. These are the standards the project will be judged against.

---

## 1. Environment Configuration

* [ ] **ENV-01** — All required environment variables are documented in `.env.example`
* [ ] **ENV-02** — `.env.example` is committed and `.env` is ignored by Git
* [ ] **ENV-03** — The app fails loudly on boot when required environment variables are missing
* [ ] **ENV-04** — No secrets, API keys, tokens, passwords, or private credentials are hardcoded in source files
* [ ] **ENV-05** — Environment variable names are clear and match the values used in config files
* [ ] **ENV-06** — README explains which environment variables must be filled in before running the app

---

## 2. CI Pipeline

* [ ] **CI-01** — A CI workflow exists in `.github/workflows/ci.yml`
* [ ] **CI-02** — CI runs Laravel Pint in test mode: `./vendor/bin/pint --test`
* [ ] **CI-03** — CI runs PHPStan at level 5: `./vendor/bin/phpstan analyse --level=5`
* [ ] **CI-04** — CI runs the test suite: `php artisan test`
* [ ] **CI-05** — CI runs on every push and pull request
* [ ] **CI-06** — CI fails when formatting, static analysis, or tests fail
* [ ] **CI-07** — No secrets are hardcoded in the workflow file

---

## 3. Logging

* [ ] **LOG-01** — Production code does not use `dump()`, `dd()`, or unnecessary debug logging
* [ ] **LOG-02** — Logs do not expose sensitive data such as passwords, tokens, full payloads, or private user data
* [ ] **LOG-03** — Caught exceptions are logged with useful context, but without leaking raw user data
* [ ] **LOG-04** — API responses return sanitized error messages instead of raw exception details
* [ ] **LOG-05** — Logging uses Laravel logging helpers instead of temporary debug output

---

## 4. Security Headers

* [ ] **SEC-01** — `X-Content-Type-Options: nosniff` is added to responses
* [ ] **SEC-02** — `X-Frame-Options: SAMEORIGIN` is added to responses
* [ ] **SEC-03** — `X-XSS-Protection: 1; mode=block` is added to responses
* [ ] **SEC-04** — Security headers are applied globally through middleware
* [ ] **SEC-05** — The security middleware is registered globally in `Kernel.php`
* [ ] **SEC-06** — Endpoints that return user data do not use unsafe wildcard CORS rules

---

## 5. README / Developer Onboarding

* [ ] **DOC-01** — README explains what the app does in one short paragraph
* [ ] **DOC-02** — README lists required software versions, including PHP, Composer, database, and Laravel version
* [ ] **DOC-03** — README has a fresh-clone setup guide that can be copied and followed
* [ ] **DOC-04** — README explains how to create and configure `.env`
* [ ] **DOC-05** — README explains how to run migrations
* [ ] **DOC-06** — README explains how to run the test suite
* [ ] **DOC-07** — README explains how to run Pint and PHPStan
* [ ] **DOC-08** — README explains how to start the local development server

---

## 6. Static Analysis / Type Safety

* [ ] **PHP-01** — PHPStan is installed and configured
* [ ] **PHP-02** — `./vendor/bin/phpstan analyse --level=5` exits successfully
* [ ] **PHP-03** — Application code avoids unnecessary mixed types
* [ ] **PHP-04** — Models, services, controllers, and jobs use clear return types where practical
* [ ] **PHP-05** — No ignored PHPStan errors exist without a written explanation

---

## 7. Error Handling

* [ ] **ERR-01** — API routes return structured JSON errors where appropriate
* [ ] **ERR-02** — Validation failures return correct 422 responses
* [ ] **ERR-03** — Unauthorized or forbidden actions return correct 401 or 403 responses
* [ ] **ERR-04** — Missing resources return correct 404 responses
* [ ] **ERR-05** — Raw exception messages are not exposed to users in production

---

## 8. Test Coverage

* [ ] **TEST-01** — `php artisan test` exits successfully
* [ ] **TEST-02** — Core business logic has feature or unit tests
* [ ] **TEST-03** — Main API happy path is covered by tests
* [ ] **TEST-04** — Validation failure paths are tested
* [ ] **TEST-05** — Authorization or ownership rules are tested where relevant
* [ ] **TEST-06** — No skipped tests are required for CI to pass

---

## 9. Build / Runtime Health

* [ ] **RUN-01** — `composer install` succeeds from a fresh clone
* [ ] **RUN-02** — `php artisan key:generate` works after copying `.env.example`
* [ ] **RUN-03** — `php artisan migrate` works from a clean database
* [ ] **RUN-04** — `php artisan test` works on a fresh clone
* [ ] **RUN-05** — The app can start locally with `php artisan serve`
* [ ] **RUN-06** — No unused packages meaningfully increase maintenance risk

---

## Scoring

| Grade                 | Criteria                                                 |
| --------------------- | -------------------------------------------------------- |
| **Ship**              | All MUST items pass and at least 80% of total items pass |
| **Ship with tickets** | All MUST items pass and 60–79% of total items pass       |
| **Do not ship**       | Any MUST item fails                                      |

---

## MUST Items

The following items block release if they fail:

* ENV-03
* ENV-04
* CI-01
* CI-02
* CI-03
* CI-04
* SEC-01
* SEC-02
* SEC-03
* SEC-04
* SEC-05
* PHP-02
* TEST-01
* RUN-03
* RUN-04
