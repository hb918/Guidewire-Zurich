# Scheduled PolicyCenter Test Execution

## Client overview

The Guidewire PolicyCenter automated checks can run in GitHub Actions or Jenkins
and publish test evidence for each run. Both scheduled configurations run the
Smoke suite daily at approximately **06:00 UTC (11:30 India Standard Time)**.
This short availability check confirms that the configured PolicyCenter login
page can be reached. It does not create a policy submission.

The GitHub Actions workflow runs Smoke for pushes to `main` or `master`. It
does not execute PolicyCenter tests for pull requests, so untrusted pull request
code cannot access the test environment or secrets. Jenkins scheduled builds
use the Smoke default; users can start a build manually and select Smoke,
Sanity, Regression, End-to-End, or All scenarios. Regression and End-to-End
scenarios can create submissions; run them only against an approved
non-production test environment.

## Jenkins setup

1. Commit the root-level `Jenkinsfile` to the project repository.
2. Configure a Jenkins agent with Linux, Node.js 22, npm, and permission to
   reach the PolicyCenter test environment.
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
   Chromium, access the test environment, and archive the `reports/` artifacts.

The Jenkinsfile polls daily using `H 6 * * *`, which chooses a stable,
Jenkins-distributed minute during the 06:00 hour according to the Jenkins
controller's timezone. Set the controller timezone to UTC for the approximate
11:30 India Standard Time schedule described above. Jenkins cron scheduling
requires the job to be enabled and the Jenkins controller to be running.

Scheduled builds use the default Smoke suite. Use **Build with Parameters** to
select another suite. All builds require the Jenkins URL credential; non-Smoke
builds also require the account credentials and test fixture values. The
Jenkins pipeline archives all files under `reports/`, even if the test stage
fails, so the build page can be used to inspect available evidence.

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

All suites require `POLICYCENTER_URL`. Full suites also require the username,
password, test company, and test account secrets. The Smoke suite only checks
that the login page is available; full suites may create a submission and must
use an approved non-production test account.

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

To run a suite on demand, open **Actions → Scheduled PolicyCenter Tests →
Run workflow**, choose a branch and suite, then start the workflow:

| Selection | What it runs |
| --- | --- |
| Smoke | Login-page availability check |
| Sanity | Scenarios tagged `@Sanity` |
| Regression | Scenarios tagged `@Regression` |
| End-to-End | Scenarios tagged `@EndToEnd` |
| All | All scenarios in the Cucumber suite |

Scheduled triggers and pushes run Smoke. Pull requests do not run against the
PolicyCenter environment.

## Results and evidence

Open the completed workflow run in the repository's **Actions** tab to review
the pass/fail status and logs. Download the
`policycenter-test-evidence-<run number>` artifact for the Cucumber JSON/HTML
reports and generated screenshots/videos under `reports/`. Evidence is retained
for 30 days by default; adjust `retention-days` in the workflow to match the
client's retention requirements.

Reports and browser evidence may contain customer, policy, or account
information. Limit repository and artifact access to authorized users, use
non-production test data, and apply the client's data-retention policy.

## Operational notes

- The workflow installs Node.js 22, project dependencies, and the Chromium
  browser on each run.
- Browser execution is headless in CI.
- The daily scheduled Smoke check does not replace the full regression suite.
- Configure GitHub notifications or repository rules to alert the responsible
  team when a scheduled run fails.
- GitHub Actions requires a GitHub-hosted or appropriately configured
  self-hosted runner with access to the PolicyCenter test environment.
