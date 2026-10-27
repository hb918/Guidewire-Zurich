const { Given, When, Then } = require('@cucumber/cucumber');
const { requiredEnvironmentVariable } = require('../helper/environment');
const { LoginPage } = require('../pages/LoginPage');
const { AccountSelectionPage } = require('../pages/AccountSelectionPage');
const { NewSubmissionPage } = require('../pages/NewSubmissionPage');
const { PolicyInfoPage } = require('../pages/PolicyInfoPage');
const { RiskDetailsPage } = require('../pages/RiskDetailsPage');
const { PricingPage } = require('../pages/PricingPage');
const { BuildingPage } = require('../pages/BuildingPage');
const { CommercialLiabilityPage } = require('../pages/CommercialLiabilityPage');
const { RiskAnalysisPage } = require('../pages/RiskAnalysisPage');

function pages(world) {
  return {
    login: new LoginPage(world.page),
    account: new AccountSelectionPage(world.page),
    submission: new NewSubmissionPage(world.page),
    policyInfo: new PolicyInfoPage(world.page),
    riskDetails: new RiskDetailsPage(world.page),
    pricing: new PricingPage(world.page),
    building: new BuildingPage(world.page),
    liability: new CommercialLiabilityPage(world.page),
    riskAnalysis: new RiskAnalysisPage(world.page)
  };
}

Given('the user launches Guidewire PolicyCenter', async function () {
  this.pages = pages(this);
  await this.pages.login.launchApplication();
});

Given('the user logs into PolicyCenter using valid credentials', async function () {
  await this.pages.login.loginFromJson();
});

Then('the PolicyCenter login page should be displayed', async function () {
  await this.pages.login.assertLoginPageDisplayed();
});

When('the user navigates to {string} from the sidebar', async function (menu) {
  if (menu.toLowerCase() === 'actions') await this.pages.account.openActions();
});

When('the user selects {string}', async function (option) {
  if (option.toLowerCase() === 'new account') await this.pages.account.openNewAccount();
});

When('the user searches for the configured test company', async function () {
  await this.pages.account.searchCompany(requiredEnvironmentVariable('POLICYCENTER_TEST_COMPANY'));
});

When('the user opens the configured test account', async function () {
  await this.pages.account.openAccount(requiredEnvironmentVariable('POLICYCENTER_TEST_ACCOUNT_NUMBER'));
});

When('the user starts a new submission', async function () {
  await this.pages.account.startNewSubmission();
});

When('the user selects the Zurich CH Commercial product', async function () {
  await this.pages.submission.selectZurichCommercial();
});

When('the user enters the values on the Policy Info page', async function () {
  await this.pages.policyInfo.enterPolicyInfo();
});

When('the user completes the risk details', async function () {
  await this.pages.riskDetails.completeRiskDetails();
  await this.pages.pricing.clickNext();
});

When('the user adds the Production unit building', async function () {
  await this.pages.building.completeBuilding();
});

When('the user completes standard coverages', async function () {
  await this.pages.building.completeStandardCoverages();
});

When('the user requests a quote', async function () {
  await this.pages.liability.requestQuote();
});

Then('the quoted submission page displays the submission number', async function () {
  await this.pages.liability.assertQuotedSubmissionPage();
});

When('the user clicks on the Hazard & Exposure tab', async function () {
  await this.pages.riskAnalysis.clickHazardAndExposureTab();
});

When('the user clicks the Assess link', async function () {
  await this.pages.riskAnalysis.clickAssessLink();
});

Then('the status should display Assessed', async function () {
  await this.pages.riskAnalysis.assertAssessedStatus();
});
