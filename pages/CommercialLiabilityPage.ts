const { expect } = require('@playwright/test');
const { GuidewirePage } = require('./GuidewirePage');

class CommercialLiabilityPage extends GuidewirePage {
  async requestQuote() {
    const quote = this.locator('xpath=//div[@role="button" and .//*[@aria-label="Quote"]]');
    await quote.waitFor({ state: 'visible', timeout: this.timeout });
    await quote.scrollIntoViewIfNeeded();
    await quote.click();
    await expect(quote).toBeHidden({ timeout: 15000 }).catch(async () => {
      await this.click('xpath=//div[@role="button" and .//*[@aria-label="Quote"]]', 'Quote');
    });
  }

  async assertQuotedSubmissionPage() {
    const header = this.locator('xpath=//div[@role="heading" and starts-with(normalize-space(.), "Submission ")]');
    await expect(header).toHaveText(/^Submission \d+$/, { timeout: 30000 });
  }
}

module.exports = { CommercialLiabilityPage };
