const { Before, After, BeforeStep, AfterStep, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, firefox } = require('playwright');
const path = require('path');
const { HTMLReporter } = require('../report/html-reporter');
const { ScreenshotHelper } = require('../report/screenshot-helper');

setDefaultTimeout(60000);

const browserName = (process.env.BROWSER || 'chromium').trim().toLowerCase();
const browserTypes = { chromium, firefox };
const browserType = browserTypes[browserName];

if (!browserType) {
  throw new Error(`Unsupported BROWSER "${browserName}". Use "chromium" or "firefox".`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Before – launch browser + initialise HTML reporter
// ─────────────────────────────────────────────────────────────────────────────
Before(async function (scenario) {
  // Browser / page setup — record video into reports/videos/
  const videosDir = path.resolve(process.cwd(), 'reports', 'videos');
  const fs = require('fs');
  if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

  this.browser = await browserType.launch({ headless: Boolean(process.env.CI) });
  this.context = await this.browser.newContext({
    viewport: null,
    recordVideo: {
      dir: videosDir,
      size: { width: 1280, height: 720 }
    }
  });
  this.page = await this.context.newPage();

  // ── HTML Reporter setup ───────────────────────────────────────────────────
  // Derive the feature file path from the scenario's URI so the report gets
  // named after the feature file (e.g. reports/HTML Reports/001-PolicyCenter.html)
  const featureUri  = scenario.gherkinDocument?.uri || '';
  const featureFile = featureUri
    ? path.basename(featureUri)
    : 'test';

  // Feature name (title line of the feature file)
  const featureName = scenario.gherkinDocument?.feature?.name || featureFile;

  this.htmlReporter = new HTMLReporter(featureFile);
  this.htmlReporter.setFeatureName(featureName);
  this.htmlReporter.setScenarioName(scenario.pickle?.name || '');
  this.htmlReporter.setStartTime(new Date());
});

// ─────────────────────────────────────────────────────────────────────────────
// BeforeStep – record step start (so we know which Gherkin step is running)
// ─────────────────────────────────────────────────────────────────────────────
BeforeStep(async function ({ pickleStep }) {
  // Store current Gherkin step text on the world so AfterStep can use it
  this.currentStepText = pickleStep?.text || '';
});

// ─────────────────────────────────────────────────────────────────────────────
// AfterStep – record every Gherkin step result + screenshot into the HTML report
// ─────────────────────────────────────────────────────────────────────────────
AfterStep(async function ({ result, pickleStep }) {
  if (!this.htmlReporter) return;

  const stepText = pickleStep?.text || this.currentStepText || 'Unknown step';
  const status   = result?.status === 'PASSED' ? 'PASSED' : 'FAILED';

  // Extract inline quoted values from step text (e.g. the user enters "value")
  let value = '';
  try {
    const quoted = [...stepText.matchAll(/"([^"]+)"/g)].map(match => match[1]);
    if (quoted.length > 0) value = quoted.join(', ');
  } catch (_) { /* ignore */ }

  // Record the step first (screenshot will be attached to this entry below)
  const comment = status === 'FAILED' ? (result?.message?.split('\n')[0] || 'Step failed') : '';
  this.htmlReporter.addStep(stepText, status, 'step', value, comment);

  // ── Capture screenshot for EVERY step (passed or failed) ──────────────────
  if (this.page) {
    try {
      const screenshotBuffer = await this.page.screenshot({ type: 'png', fullPage: true });
      this.htmlReporter.addScreenshotToLastStep(screenshotBuffer.toString('base64'));
    } catch (e) {
      console.error('[hooks] Screenshot capture failed:', e.message);
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// After – save HTML report + close browser
// ─────────────────────────────────────────────────────────────────────────────
After(async function (scenario) {
  // Take a final screenshot on failure (saved to reports/screenshots/)
  if (scenario.result?.status === 'FAILED' && this.page) {
    try {
      const fs = require('fs');
      const failDir = path.resolve(process.cwd(), 'reports', 'screenshots');
      if (!fs.existsSync(failDir)) fs.mkdirSync(failDir, { recursive: true });
      await this.page.screenshot({
        path: path.join(failDir, `${Date.now()}-failure.png`),
        fullPage: true
      });
    } catch (_) { /* ignore */ }
  }

  // ── Stop recording and hand video path to the reporter ───────────────────
  let videoPath = '';
  try {
    // page.video() is available when recordVideo was set on the context
    if (this.page && this.page.video()) {
      // Context must be closed first so Playwright finalises the .webm file
      await this.context.close();
      videoPath = await this.page.video().path();
      console.log(`[hooks] Video saved → ${videoPath}`);
    }
  } catch (e) {
    console.error('[hooks] Could not retrieve video path:', e.message);
  }

  // Finalise and save the HTML report
  if (this.htmlReporter) {
    this.htmlReporter.setEndTime(new Date());
    if (videoPath) this.htmlReporter.setRecordingPath(videoPath);
    await this.htmlReporter.saveReport();
  }

  // Close the browser (context already closed above if video was recorded)
  try { await this.browser?.close(); } catch (_) { /* ignore */ }
});
