const { GuidewirePage } = require('./GuidewirePage');

class NewSubmissionPage extends GuidewirePage {
  async selectZurichCommercial() {
    await this.click('xpath=//div[text()="Visualized Products"]', 'Visualized Products');
    await this.click('#NewSubmission-NewSubmissionScreen-_ListPaging-last', 'Last product page');
    await this.click('xpath=//div[@id="NewSubmission-NewSubmissionScreen-8-addSubmission"]', 'Zurich CH Commercial');
  }
}

module.exports = { NewSubmissionPage };
