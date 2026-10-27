// Run predefined suites with `npm run test:smoke`, `test:regression`,
// `test:sanity`, or `test:e2e`. Scenarios are selected by matching tags.
// BROWSER selects chromium or firefox and defaults to chromium.
const sharedConfig = {
  requireModule: ['ts-node/register'],
  require: ['helper/hooks/**/*.ts', 'step-definitions/**/*.ts'],
  timeout: 60000,
  format: [
    'progress',
    'json:reports/cucumber.json',
    'html:reports/cucumber-report.html'
  ],
  publishQuiet: true
};

module.exports = {
  default: sharedConfig,
  smoke: {
    ...sharedConfig,
    tags: '@Smoke'
  },
  regression: {
    ...sharedConfig,
    tags: '@Regression'
  },
  sanity: {
    ...sharedConfig,
    tags: '@Sanity'
  },
  e2e: {
    ...sharedConfig,
    tags: '@EndToEnd'
  },
};
// NOTE: The custom per-scenario HTML reports are written to
//       reports/HTML Reports/<feature-name>.html  by HTMLReporter (helper/report/html-reporter.ts).
// Run  `npm run report:html`  after tests to regenerate the index page.
