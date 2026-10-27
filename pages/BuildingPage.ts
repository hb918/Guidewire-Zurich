const { GuidewirePage } = require('./GuidewirePage');

class BuildingPage extends GuidewirePage {
  field(index) {
    return `xpath=//input[contains(@name,"riskFieldsLeft-${index}-value-APDDataFieldValue-value")]`;
  }

  dropdown(index) {
    return `xpath=(//select[contains(@name,"APDDataFieldValue-DropDownCode")])[${index}]`;
  }

  async completeBuilding() {
    await this.radio('Active', 'Yes');
    await this.fill(this.field(1), 'Production unit', 'Building description');
    await this.selectValue('xpath=//option[text()="Masonry / Concrete"]', 'APDDropdownEntry:18321', 'Construction class');
    await this.fill(this.field(3), '2023', 'Year built');
    await this.fill(this.field(4), '4', 'Storeys above ground');
    await this.fill(this.field(5), '4500', 'Floor area');
    await this.selectValue('xpath=//option[text()="Heat pump"]', 'APDDropdownEntry:18326', 'Heating type');
    await this.radio('Photovoltaic installation', 'Yes');
    await this.radio('Renovated since 2015', 'No');
    await this.radio('Special hazard - commercial cooking', 'No');
    await this.radio('Special hazard - hot works', 'No');
    await this.radio('Special hazard - flammable liquid', 'No');
    await this.selectValue('xpath=//option[text()="Workshop"]', 'APDDropdownEntry:18333', 'Occupancy type');
    await this.radio('Vacancy > 30 days', 'No');
    await this.selectValue('xpath=//option[text()="Local Alarm"]', 'APDDropdownEntry:18338', 'Fire alarm type');
    await this.selectValue('xpath=//option[text()="Full"]', 'APDDropdownEntry:18342', 'Sprinkler coverage');
    await this.selectValue('xpath=//option[text()="Local"]', 'APDDropdownEntry:18344', 'Burglar alarm type');
    await this.radio('Safe Indicator', 'Yes');
    await this.radio('Distance to watercourse < 100 m', 'Yes');
    await this.selectValue('xpath=(//option[text()="None"])[4]', 'APDDropdownEntry:18346', 'Neighbouring hazardous occupancy');
    await this.click('xpath=//div[text()="Standard Coverages"]', 'Standard Coverages tab');
  }

  async completeStandardCoverages() {
    await this.click('xpath=//div[@data-gw-getset="checkbox"]', 'Property change');
    await this.selectValue('xpath=//option[text()="All Risk"]', 'APDDropdownEntry:18349', 'Peril option');
    await this.fill('xpath=//input[contains(@name,"RiskTermsLV-1-value-APDDataFieldValue-value")]', '300', 'Building SI');
    await this.fill('xpath=//input[contains(@name,"RiskTermsLV-2-value-APDDataFieldValue-value")]', '25', 'Inventory SI');
    await this.fill('xpath=//input[contains(@name,"RiskTermsLV-3-value-APDDataFieldValue-value")]', '20', 'Third party SI');
    await this.selectValue('xpath=//option[text()="2500"]', 'APDDropdownEntry:18353', 'Deductible');
    await this.fill('xpath=//input[contains(@name,"RiskTermsLV-5-value-APDDataFieldValue-value")]', '28.000', 'Business Interruption SI');
    await this.selectValue('xpath=//option[text()="18"]', 'APDDropdownEntry:18356', 'Indemnity months');
    await this.selectValue('xpath=//option[text()="2"]', 'APDDropdownEntry:18358', 'Waiting days');
    await this.clickOkButton();
    await this.clickOkButton();
    await this.clickAndWaitFor('xpath=//div[@aria-label="Add"]', 'xpath=//div[@aria-label="Add Commercial Liability"]', 'Add risk object');
    await this.clickAndWaitFor('xpath=//div[@aria-label="Add Commercial Liability"]', 'xpath=//div[@role="button" and contains(normalize-space(.),"Commercial Liability")]', 'Add Commercial Liability');
    await this.clickAndWaitFor('xpath=//div[text()="2: Commercial Liability: <New>"]', 'xpath=//input[contains(@name,"riskFieldsLeft-0-value-APDDataFieldValue-value")]', 'Commercial Liability');
  }

  async clickOkButton() {
    await this.click('xpath=(//div[@aria-label="OK"])[last()]', 'OK');
  }

  async clickAndWaitFor(selector, nextSelector, name) {
    await this.click(selector, name);
    await this.locator(nextSelector).waitFor({ state: 'visible', timeout: 60000 });
  }

  async radio(question, answer) {
    await this.click(`xpath=//div[normalize-space(text())="${question}"]/ancestor::tr[1]//*[@role="radio" and @aria-label="${answer}"]`, `${question} - ${answer}`);
  }
}

module.exports = { BuildingPage };
