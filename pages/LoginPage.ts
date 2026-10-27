const { GuidewirePage } = require('./GuidewirePage');
const { requiredEnvironmentVariable } = require('../helper/environment');

class LoginPage extends GuidewirePage {
  constructor(page) {
    super(page);
    this.username = 'input[name="Login-LoginScreen-LoginDV-username"], input[name*="username"]';
    this.password = 'input[name="Login-LoginScreen-LoginDV-password"], input[name*="password"]';
    this.loginButton = '#Login-LoginScreen-LoginDV-submit, button[type="submit"]';
  }

  async launchApplication() {
    const url = requiredEnvironmentVariable('POLICYCENTER_URL');
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async loginFromJson() {
    const username = requiredEnvironmentVariable('POLICYCENTER_USERNAME');
    const password = requiredEnvironmentVariable('POLICYCENTER_PASSWORD');
    await this.fill(this.username, username, 'Username field');
    await this.fill(this.password, password, 'Password field');
    await this.click(this.loginButton, 'Login button');
  }

  async assertLoginPageDisplayed() {
    await this.page.locator(this.loginButton).waitFor({ state: 'visible' });
  }
}

module.exports = { LoginPage };
