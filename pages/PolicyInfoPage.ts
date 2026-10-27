const { GuidewirePage } = require('./GuidewirePage');

class PolicyInfoPage extends GuidewirePage {

  async enterPolicyInfo() {
    const correspondenceLanguageSelect = this.page.locator('select:has(option[value="en_US"])');
    await correspondenceLanguageSelect.waitFor({ state: 'visible', timeout: this.timeout });
    await correspondenceLanguageSelect.selectOption({ value: 'en_US' });

    const legalFormSelect = this.page.locator(
      'select[name="SubmissionWizard-LOBWizardStepGroup-SubmissionWizard_PolicyInfoScreen-SubmissionWizard_PolicyInfoDV-AccountInfoInputSet-CommercialInputSet-SwissLegalForm_Ext"]'
    );
    await legalFormSelect.waitFor({ state: 'visible', timeout: this.timeout });
    await legalFormSelect.selectOption({ value: 'Verein' });
    await this.click('xpath=//div[text()="Next"]', 'Next');
  }
}

module.exports = { PolicyInfoPage };
