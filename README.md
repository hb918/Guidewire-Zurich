# Guidewire and OrangeHRM Playwright Tests

This project uses Playwright Test for both Guidewire PolicyCenter and
OrangeHRM. `playwright.config.ts` is the single source of truth for worker
count, parallel execution, browser projects, headed/headless mode, and reports.

## Install

```cmd
npm ci
npx playwright install chromium
```

## Configure execution

Edit `playwright.config.ts` to control `workers`, `fullyParallel`, browser
projects, reporting, and the default `headless` setting. By default, the suite
uses two workers, runs tests fully parallel, and opens browsers in headed mode.
Set `headless: true` there for headless mode or `headless: false` for headed
mode. GitHub Actions and Linux Jenkins agents use Xvfb so headed execution
works on headless runners.

## Run by spec filename

Run either spec separately:

```cmd
npx playwright test tests/guidewire/policycenter.spec.ts
npx playwright test tests/orangehrm/orangehrm.spec.ts
```

Run both specs together. Playwright applies the same config settings to both:

```cmd
npx playwright test tests/guidewire/policycenter.spec.ts tests/orangehrm/orangehrm.spec.ts
```

Use forward slashes in spec paths, even in Windows Command Prompt. Playwright
matches file arguments as regular expressions, so Windows backslashes can make
the path fail to match.

The default config uses two workers, `fullyParallel: true`, and headed
execution (`headless: false`). Edit those values in `playwright.config.ts`;
there is no separate runner or worker script.

## Tags and suites

Tags are part of each Playwright test title. Use `--grep` to select a suite:

```cmd
npm run test:smoke
npm run test:sanity
npm run test:regression
npm run test:e2e
npm run test:orangehrm
```

`npm test` runs all specs in the configured Chromium project. Cross-browser
execution is currently disabled; add another browser project in
`playwright.config.ts` before using it.

The built-in HTML report combines results from all specs in that run. It is
written to `playwright-report/`:

```cmd
npx playwright show-report
```

## Test environments

OrangeHRM uses the public demo login page unless `ORANGEHRM_URL` is set.
Guidewire requires a local `.env` file containing the approved `POLICYCENTER_URL`.
The submission test also requires `POLICYCENTER_USERNAME`,
`POLICYCENTER_PASSWORD`, `POLICYCENTER_TEST_COMPANY`, and
`POLICYCENTER_TEST_ACCOUNT_NUMBER`. Keep credentials and test account data out
of source control. The submission flow runs only in Chromium to avoid creating
duplicate submissions. Current local and scheduled executions use Chromium.

To run only Guidewire smoke coverage:

```cmd
npx playwright test tests/guidewire/policycenter.spec.ts --grep "@Smoke"
```

GitHub Actions and Jenkins run the Playwright specs and archive the built-in
HTML report. The Smoke suite runs on schedule; manual runs can select a suite.
