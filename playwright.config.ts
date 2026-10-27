/// <reference types="node" />
import { defineConfig, devices } from '@playwright/test';

/*
 * SUITE-BASED EXECUTION (CUCUMBER)
 * --------------------------------
 * Tag each scenario in a .feature file with its suite name. The Cucumber
 * profiles in cucumber.js filter by tag; npm scripts in package.json run them:
 *   npm run test:smoke       Selects @Smoke scenarios (availability check)
 *   npm run test:sanity      Selects @Sanity scenarios (basic checks)
 *   npm run test:regression  Selects @Regression scenarios (regression flows)
 *   npm run test:e2e         Selects @EndToEnd scenarios (complete user flows)
 *   npm run test:bdd         Runs all scenarios, regardless of suite tag
 *
 * Choose a browser with BROWSER=chromium or BROWSER=firefox; default is
 * Chromium. Example commands:
 *   PowerShell: $env:BROWSER='firefox'; npm run test:smoke
 *   cmd.exe:    set "BROWSER=firefox" && npm run test:smoke
 *
 * CI can run these same npm scripts after browser installation and configuration
 * of the required PolicyCenter environment variables/secrets. These comments
 * document Cucumber suite execution; profiles are configured in cucumber.js,
 * not in this Playwright Test config. Suite coverage depends on the tags
 * assigned to scenarios in the feature files.
 */

/*
 * TAG-BASED EXECUTION (CUCUMBER)
 * -----------------------------
 * Tags label scenarios by purpose. Add one or more tags (for example,
 * @Smoke, @Regression, @Sanity, @EndToEnd, @Critical, or @Feature) above a
 * scenario in a .feature file. A scenario carrying multiple tags is selected
 * by any suite profile whose tag it includes.
 *
 * Use the suite commands above to select scenarios by @Smoke, @Regression,
 * @Sanity, or @EndToEnd. A scenario can carry multiple suite tags and will be
 * included in each matching suite. `npm run test:bdd` runs all scenarios.
 * Suite profiles and their tag filters are configured in cucumber.js. This
 * execution is managed by Cucumber, not Playwright Test.
 */

/* ============================================================
 *  PLAYWRIGHT CONFIG — GLOBAL PRODUCTION
 * ============================================================
 *
 * One config, three environments: local, CI, pipeline.
 * Every environment-dependent value branches automatically.
 *
 * KEY DECISIONS
 * -------------
 * - test files run in parallel across worker processes
 * - tests inside a file can also run in parallel (fullyParallel)
 * - retries: 0 locally (honest), 1 on CI (stable)
 * - reporters: list + html everywhere, + junit on CI
 * - failure artifacts (trace, screenshot, video) everywhere
 * ============================================================ */

// Detect the environment once

const CI = !!process.env.CI;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',

  /*
   * Per-test timeout
   * 30s is a safe value for both local and CI.
   */
  timeout: 30 * 1000,

  /*
   * Per-assertion timeout
   */
  expect: {
    timeout: 5_000,
  },

    /*
   * workers — the main throughput lever
   * ------------------------------
   * Each worker is an isolated OS process running test files in parallel.
   *
   * CI: 2 workers (conservative — CI runners share limited CPU)
   * Local: 4 workers (good balance on a 4-8 core machine)
   *
   * Override per run: --workers=8
   */
   workers: process.env.CI ? 2 : 4,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

   /*
   * WHY: fullyParallel
   * ------------------
   * By default:
   *   - test files run in parallel
   *   - tests inside one file run in order
   *
   * Setting `fullyParallel: true` makes all tests run in parallel,
   * including tests inside the same file.
   *
   * Use this only when every test is fully independent:
   *   - no shared login session
   *   - no shared database row
   *   - no shared file or port
   *   - no test depends on another test finishing first
   *
   * If tests share state, keep this `false` and use per-suite parallel mode instead.
   */
  fullyParallel: true,

   /*
   * retries
   * -------
   * Local: 0 — keeps failures honest and visible.
   * CI: 1 — absorbs timing flakes exposed by parallel runs.
   */
    retries: process.env.CI ? 1 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    // Change to true for headless execution
    // Change to false for headed execution
    // Headless = true  -> Executes tests in the background without launching the browser UI.
    // Headless = false -> Launches the browser UI, useful for debugging and observing test execution.
    // This setting can be controlled from the configuration file or overridden through environment variables
    // based on local debugging or CI/CD pipeline requirements.
    headless: false,
  // headless: process.env.HEADLESS !== 'false',
  },

  /* Configure projects for major browsers */
  /**
 * Cross-Browser Execution Configuration
 *
 * Purpose:
 * Ensures application functionality is validated across all
 * major browser engines supported by Playwright.
 *
 * Browsers Covered:
 * 1. Chromium (Chrome / Edge)
 * 2. Firefox
 * 3. WebKit (Safari)
 *
 * Benefits:
 * - Detects browser-specific UI issues.
 * - Verifies consistent behavior across platforms.
 * - Increases application reliability and compatibility.
 *
 * Execution:
 * Run `npx playwright test`
 * to execute the complete test suite in all configured browsers.
 * # Run tests only on Chromium browser
npx playwright test --project=Chromium

# Run tests only on Firefox browser
npx playwright test --project=Firefox

# Run tests only on WebKit (Safari) browser
npx playwright test --project=WebKit

# Run tests across all configured browsers (Chromium, Firefox, and WebKit)
npx playwright test
 */

//cmd to run tests in a specific browser: npx playwright test --project=chromium

  projects: [
    // Executes the test suite on Chromium-based browsers
    // Covers Google Chrome and Microsoft Edge rendering engines
    // Used to validate application behavior for the majority of users
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // Executes the test suite on Mozilla Firefox
    // Helps identify browser-specific UI, CSS, and functional issues
    // Ensures consistent user experience for Firefox users
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

   /* {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
