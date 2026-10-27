const { GuidewirePage } = require('./GuidewirePage');

class RiskDetailsPage extends GuidewirePage {
  async completeRiskDetails() {
    await this.click('xpath=//div[text()="Next"]', 'Next on Risk Details page');
  }
}

module.exports = { RiskDetailsPage };
