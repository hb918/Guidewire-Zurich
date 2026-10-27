const { GuidewirePage } = require('./GuidewirePage');
const { requiredEnvironmentVariable } = require('../helper/environment');

class AccountSelectionPage extends GuidewirePage {
  async openActions() {
    await this.click('xpath=//div[@role="button" and @aria-label="Actions"]', 'Actions menu');
  }

  async openNewAccount() {
    await this.click('xpath=(//*[@role="menuitem" and .//*[normalize-space(text())="New Account"]])[1]', 'New Account');
  }

  async searchCompany(companyName) {
    await this.fill('xpath=//input[contains(@name,"GlobalContactNameInputSet-Name")]', companyName, 'Company name');
    await this.click('xpath=//div[contains(@id,"SearchLinksInputSet-Search")]', 'Account search');
    const accountNumber = requiredEnvironmentVariable('POLICYCENTER_TEST_ACCOUNT_NUMBER');
    await this.locator(`xpath=//div[text()="${accountNumber}"]`).waitFor({ state: 'visible', timeout: this.timeout });
  }

  async openAccount(accountNumber) {
    await this.click(`xpath=//div[text()="${accountNumber}"]`, `Account ${accountNumber}`);
  }

  async startNewSubmission() {
    await this.click('xpath=(//div[text()="New Submission"])[2]', 'New Submission');
  }
}

module.exports = { AccountSelectionPage };
