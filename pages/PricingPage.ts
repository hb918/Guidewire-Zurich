const { GuidewirePage } = require('./GuidewirePage');

class PricingPage extends GuidewirePage {
  async clickNext() {
    await this.click('xpath=//div[text()="Next"]', 'Next button on Pricing page');
  }
}

module.exports = { PricingPage };
