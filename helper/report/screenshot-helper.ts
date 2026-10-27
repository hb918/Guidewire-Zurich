const fs   = require('fs');
const path = require('path');

/**
 * ScreenshotHelper – captures a screenshot from a Playwright Page and
 * optionally attaches it to an HTMLReporter step.
 */
class ScreenshotHelper {
  /**
   * Take a screenshot and attach it to the current HTML report step.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('./html-reporter').HTMLReporter|undefined} reporter
   * @param {string} stepName   - label used for the file name
   * @param {string} [comment]  - optional comment stored in the report
   * @param {boolean} [saveToFile=true] - whether to persist the PNG to disk
   */
  static async takeScreenshot(page, reporter, stepName, comment = '', saveToFile = true) {
    if (!page) return;

    try {
      const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: true });

      if (saveToFile) {
        const screenshotDir = path.resolve(process.cwd(), 'reports', 'screenshots');
        if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

        const safeName = stepName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        const filename  = `${Date.now()}-${safeName}.png`;
        fs.writeFileSync(path.join(screenshotDir, filename), screenshotBuffer);
      }

      if (reporter) {
        // Attach to the most-recently recorded step
        reporter.addScreenshotToLastStep(screenshotBuffer.toString('base64'));
      }
    } catch (err) {
      console.error('[ScreenshotHelper] Failed to take screenshot:', err);
    }
  }

  /**
   * Take a failure screenshot and attach it to the report as a FAILED step.
   *
   * @param {import('@playwright/test').Page} page
   * @param {import('./html-reporter').HTMLReporter|undefined} reporter
   * @param {string} [errorMessage]
   */
  static async takeFailureScreenshot(page, reporter, errorMessage = 'Test step failed') {
    if (!page) return;

    try {
      const screenshotDir = path.resolve(process.cwd(), 'reports', 'screenshots');
      if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

      const filename       = `${Date.now()}-failure.png`;
      const screenshotPath = path.join(screenshotDir, filename);
      const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: true });

      fs.writeFileSync(screenshotPath, screenshotBuffer);
      console.log(`[ScreenshotHelper] Failure screenshot saved → ${screenshotPath}`);

      if (reporter) {
        reporter.addScreenshotToLastStep(screenshotBuffer.toString('base64'));
        reporter.addCommentToLastStep(errorMessage);
      }
    } catch (err) {
      console.error('[ScreenshotHelper] Failed to take failure screenshot:', err);
    }
  }
}

module.exports = { ScreenshotHelper };
