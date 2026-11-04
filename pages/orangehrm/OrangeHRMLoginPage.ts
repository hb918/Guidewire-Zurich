const { expect } = require('@playwright/test');
import type { Locator, Page } from '@playwright/test';

class OrangeHRMLoginPage {
  page: Page;
  username: Locator;
  password: Locator;
  loginButton: Locator;

  constructor(page) {
    this.page = page;
    this.username = page.locator('input[name="username"]');
    this.password = page.locator('input[name="password"]');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  async open() {
    const url = process.env.ORANGEHRM_URL?.trim()
      || 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login';
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async assertLoginFormVisible() {
    await expect(this.page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(this.username).toBeVisible();
    await expect(this.password).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async submitInvalidCredentials() {
    await this.username.fill('invalid-orangehrm-user');
    await this.password.fill('invalid-orangehrm-password');
    await this.loginButton.click();
  }

  async assertInvalidCredentialsMessage() {
    await expect(this.page.getByText('Invalid credentials', { exact: true })).toBeVisible();
  }
}

module.exports = { OrangeHRMLoginPage };
