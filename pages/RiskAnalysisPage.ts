const { expect } = require('@playwright/test');
const { GuidewirePage } = require('./GuidewirePage');

class RiskAnalysisPage extends GuidewirePage {
  async clickHazardAndExposureTab() {
    await this.click("xpath=//div[@role='tab']//div[text()='Hazard & Exposure']", 'Hazard & Exposure tab');
  }

  async clickAssessLink() {
    await this.click("xpath=//div[contains(@id,'AssessRow_Ext_button')]", 'Assess link');
  }

  async assertAssessedStatus() {
    const assessedElement = this.locator("xpath=//div[@data-gw-value='Assessed']");
    await assessedElement.waitFor({ state: 'visible', timeout: this.timeout });
    await expect(assessedElement).toBeVisible();
    const statusText = await assessedElement.textContent();
    await expect(statusText.trim()).toBe('Assessed');
  }
}

module.exports = { RiskAnalysisPage };
