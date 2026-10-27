# Guidewire Zurich UI Automation

Playwright browser automation with Cucumber feature files for validating
Guidewire PolicyCenter workflows.

## Run locally

Install dependencies and the Chromium browser:

```sh
npm ci
npx playwright install chromium
```

Set `POLICYCENTER_URL` to the approved test login page, then run the
availability check:

```sh
npm run test:smoke
```

The login flow also requires `POLICYCENTER_USERNAME` and
`POLICYCENTER_PASSWORD`. Submission scenarios additionally require
`POLICYCENTER_TEST_COMPANY` and `POLICYCENTER_TEST_ACCOUNT_NUMBER`. Supply
these values through a secure environment or CI secret store; do not commit
credentials, account data, or generated reports.

Available suites:

| Command | Scenarios |
| --- | --- |
| `npm run test:smoke` | `@Smoke` |
| `npm run test:sanity` | `@Sanity` |
| `npm run test:regression` | `@Regression` |
| `npm run test:e2e` | `@EndToEnd` |
| `npm run test:bdd` | All Cucumber scenarios |

## Continuous execution

- GitHub Actions schedule, manual suite selection, and setup:
  [Scheduled test execution](docs/SCHEDULED_TEST_EXECUTION.md)
- Jenkins Pipeline definition: [Jenkinsfile](Jenkinsfile)

The Smoke suite checks the login page only. Other suites may create test
submissions; run them only against an approved non-production environment.
