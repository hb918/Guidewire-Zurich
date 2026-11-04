const { test } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { AccountSelectionPage } = require('../../pages/AccountSelectionPage');
const { NewSubmissionPage } = require('../../pages/NewSubmissionPage');
const { PolicyInfoPage } = require('../../pages/PolicyInfoPage');
const { RiskDetailsPage } = require('../../pages/RiskDetailsPage');
const { PricingPage } = require('../../pages/PricingPage');
const { CommercialLiabilityPage } = require('../../pages/CommercialLiabilityPage');
const { RiskAnalysisPage } = require('../../pages/RiskAnalysisPage');
const { requiredEnvironmentVariable } = require('../../helper/environment');

test('[@Smoke @Sanity] PolicyCenter login page is available', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.launchApplication();
  await loginPage.assertLoginPageDisplayed();
});

test('[@Regression @EndToEnd] create and quote a configured commercial submission', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Run the submission flow once to avoid duplicate test submissions.');
  test.setTimeout(120000);

  const loginPage = new LoginPage(page);
  const accountPage = new AccountSelectionPage(page);
  const submissionPage = new NewSubmissionPage(page);
  const policyInfoPage = new PolicyInfoPage(page);
  const riskDetailsPage = new RiskDetailsPage(page);
  const pricingPage = new PricingPage(page);
  const riskAnalysisPage = new RiskAnalysisPage(page);
  const liabilityPage = new CommercialLiabilityPage(page);

  await loginPage.launchApplication();
  await loginPage.loginFromJson();
  await accountPage.openActions();
  await accountPage.openNewAccount();
  await accountPage.searchCompany(requiredEnvironmentVariable('POLICYCENTER_TEST_COMPANY'));
  await accountPage.openAccount(requiredEnvironmentVariable('POLICYCENTER_TEST_ACCOUNT_NUMBER'));
  await accountPage.startNewSubmission();
  await submissionPage.selectZurichCommercial();
  await policyInfoPage.enterPolicyInfo();
  await riskDetailsPage.completeRiskDetails();
  await pricingPage.clickNext();
  await riskAnalysisPage.clickHazardAndExposureTab();
  await riskAnalysisPage.clickAssessLink();
  await riskAnalysisPage.assertAssessedStatus();
  await liabilityPage.requestQuote();
  await liabilityPage.assertQuotedSubmissionPage();
});
