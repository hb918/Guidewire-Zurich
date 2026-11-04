const { test } = require('@playwright/test');
const { OrangeHRMLoginPage } = require('../../pages/orangehrm/OrangeHRMLoginPage');

test('[@OrangeHRM @Smoke] login page is available', async ({ page }) => {
  const loginPage = new OrangeHRMLoginPage(page);

  await loginPage.open();
  await loginPage.assertLoginFormVisible();
});

test('[@OrangeHRM @Smoke] invalid credentials are rejected', async ({ page }) => {
  const loginPage = new OrangeHRMLoginPage(page);

  await loginPage.open();
  await loginPage.submitInvalidCredentials();
  await loginPage.assertInvalidCredentialsMessage();
});
