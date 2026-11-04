# Scheduled Playwright Test Execution

## Client overview

The Guidewire PolicyCenter and OrangeHRM Playwright checks can run in GitHub
Actions or Jenkins and publish test evidence for each run. Both scheduled
configurations run the Smoke suite in Chromium daily at
approximately **06:00 UTC (11:30 India Standard Time)**. The suite checks the
configured PolicyCenter login page and OrangeHRM demo login page. It does not
create a policy submission.

The GitHub Actions workflow runs Smoke for pushes to `main` or `master`. It
does not execute tests for pull requests, so untrusted pull request code cannot
access the test environment or secrets. Jenkins scheduled builds use the Smoke
default; users can start a build manually and select a suite. Regression,
End-to-End, and All include the submission flow; run them only against an
approved non-production environment.

## Jenkins setup

1. Commit the root-level `Jenkinsfile` to the project repository.
2. Configure a Jenkins agent with Node.js 22, npm, and permission to reach the
   PolicyCenter test environment. The Jenkinsfile supports both Linux and
   Windows agents. Linux agents install Chromium's browser dependencies with
   `--with-deps`; Windows agents install Chromium without the Linux-only option.
3. In **Manage Jenkins → Credentials**, create credentials in the appropriate
   folder or global scope:
   - ID `policycenter-url`, type **Secret text**, containing the approved
     PolicyCenter login URL.
   - ID `policycenter-credentials`, type **Username with password**, containing
     the automation account username and password.
   - ID `policycenter-test-company`, type **Secret text**, containing the
     approved non-production test company.
   - ID `policycenter-test-account-number`, type **Secret text**, containing
     the matching test account number.
4. Create a **Pipeline** job, select **Pipeline script from SCM**, configure the
   Git repository and branch, and set **Script Path** to `Jenkinsfile`.
5. Run the job once and confirm it can check out the repository, install
   Chromium, access the test environment, and archive the Playwright reports.
   On Windows, ensure the Jenkins service account can find `node`, `npm`, and
   `npx` on its PATH; a PATH configured only in your interactive terminal may
   not be visible to the Jenkins service.

The Jenkinsfile polls daily using `H 6 * * *`, which chooses a stable,
Jenkins-distributed minute during the 06:00 hour according to the Jenkins
controller's timezone. Set the controller timezone to UTC for the approximate
11:30 India Standard Time schedule described above. Jenkins cron scheduling
requires the job to be enabled and the Jenkins controller to be running.

Scheduled builds use the default Smoke suite in Chromium. Use **Build with
Parameters** to select another suite. Suites that include the
Guidewire smoke test require the Jenkins URL credential; Regression,
End-to-End, and All also require account credentials and test fixture values.
Jenkins archives the Playwright HTML report and test results, even if the test
stage fails.

## One-time repository setup

1. Add the workflow to the repository at `.github/workflows/playwright.yml`.
2. In GitHub, open **Settings → Secrets and variables → Actions** and create
   these repository secrets:
   - `POLICYCENTER_URL` — full login page URL for the approved test environment.
   - `POLICYCENTER_USERNAME` — automation account username.
   - `POLICYCENTER_PASSWORD` — automation account password.
   - `POLICYCENTER_TEST_COMPANY` — approved non-production test company.
   - `POLICYCENTER_TEST_ACCOUNT_NUMBER` — account number for that test company.
3. Protect the automation account and target environment according to the
   client's access-control policy. Do not put credentials in source files or
   workflow logs.
4. Confirm Actions are enabled for the repository and that the default branch
   contains this workflow. GitHub scheduled workflows run from the default
   branch.

Suites that include Guidewire tests require `POLICYCENTER_URL`. Regression,
End-to-End, and All also require the username, password, test company, and test
account secrets. These suites may create a submission and must use an approved
non-production test account.

The OrangeHRM suite runs only the OrangeHRM spec and does not require
PolicyCenter secrets. The All selection runs all Playwright specs.
All current tests run in Chromium. Cross-browser execution is disabled until
additional browser projects are enabled in `playwright.config.ts`.

## Schedule and suite controls

The schedule is configured in UTC in the workflow using this cron expression:

```text
0 6 * * *
```

To change the interval, update the `schedule` cron expression in
`.github/workflows/playwright.yml`. For example, `0 6 * * 1-5` runs weekdays at
06:00 UTC. GitHub Actions cron schedules use UTC; adjust the expression for
local time and daylight-saving changes. Scheduled runs may start later during
high GitHub Actions demand, and GitHub may disable schedules in inactive public
repositories.

To run a suite on demand, open **Actions → Scheduled Browser Tests →
Run workflow**, choose a branch and suite, then start the workflow:

| Selection | What it runs |
| --- | --- |
| Smoke | Guidewire and OrangeHRM login-page availability checks |
| OrangeHRM | OrangeHRM login smoke scenarios |
| Sanity | Scenarios tagged `@Sanity` |
| Regression | Scenarios tagged `@Regression` |
| End-to-End | Scenarios tagged `@EndToEnd` |
| All | All Playwright specs |

Scheduled triggers and pushes run Smoke. Pull requests do not run against the
PolicyCenter environment.

## Results and evidence

Open the completed workflow run in the repository's **Actions** tab to review
the pass/fail status and logs. Download the
`browser-test-evidence-<run number>` artifact for the Playwright HTML
report and test results. The HTML report contains results from all specs in
that run. Evidence is retained for 30 days by default; adjust `retention-days`
in the workflow to match the client's retention requirements.

Reports and browser evidence may contain customer, policy, or account
information. Limit repository and artifact access to authorized users, use
non-production test data, and apply the client's data-retention policy.

## Operational notes

- The workflow installs Node.js 22, project dependencies, and Chromium on each
  run.
- On Ubuntu, CI uses Xvfb so the Playwright config's headed browser setting
  works without a physical display.
- The daily scheduled Smoke check does not replace the full regression suite.
- Configure GitHub notifications or repository rules to alert the responsible
  team when a scheduled run fails.
- GitHub Actions requires a GitHub-hosted or appropriately configured
  self-hosted runner with access to the PolicyCenter test environment.
