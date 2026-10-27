import type { Page } from '@playwright/test';

class GuidewirePage {
  page: Page;
  timeout: number;

  constructor(page: Page) {
    this.page = page;
    this.timeout = 30000;
  }

  locator(selector) {
    return this.page.locator(selector);
  }

  async click(selector, name) {
    const element = this.locator(selector);
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.scrollIntoViewIfNeeded();
    await element.click({ timeout: this.timeout });
  }

  async fill(selector, value, name) {
    const element = this.locator(selector);
    await element.waitFor({ state: 'visible', timeout: this.timeout });
    await element.scrollIntoViewIfNeeded();
    await element.fill(value);
  }

  async selectValue(selector, value, name) {
    // If the selector targets an <option> element directly (text-based XPath),
    // traverse up to the parent <select> and select by the option's visible label
    if (selector.includes('//option[')) {
      const optionLocator = this.locator(selector);
      await optionLocator.waitFor({ state: 'attached', timeout: this.timeout });
      const optionText = await optionLocator.textContent();
      if (optionText === null) {
        throw new Error(`selectValue: option has no text for selector "${selector}"`);
      }
      const selectLocator = optionLocator.locator('xpath=..');
      await selectLocator.waitFor({ state: 'visible', timeout: this.timeout });
      await selectLocator.selectOption({ label: optionText.trim() });
      return;
    }

    const element = this.locator(selector);
    await element.waitFor({ state: 'visible', timeout: this.timeout });

    // Try selecting by value attribute first
    try {
      await element.selectOption({ value }, { timeout: 5000 });
      return;
    } catch { /* fall through to label */ }

    // Try selecting by visible label text
    try {
      await element.selectOption({ label: value }, { timeout: 5000 });
      return;
    } catch { /* fall through to DOM evaluation */ }

    // Last resort: use JS evaluation to select by value directly in the DOM,
    // bypassing Playwright's strict option-matching
    const selected = await this.page.evaluate(({ sel, val }: { sel: string; val: string }) => {
      // Resolve XPath selector
      const xpath = sel.replace(/^xpath=/, '');
      const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
      const el = result.singleNodeValue;
      if (!(el instanceof HTMLSelectElement)) return false;
      for (const opt of Array.from(el.options)) {
        if (opt.value === val || opt.text.trim() === val) {
          el.value = opt.value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, { sel: selector, val: value });

    if (!selected) {
      throw new Error(`selectValue: could not find option "${value}" for "${name}" using selector "${selector}"`);
    }
  }

  async waitForText(selector, text) {
    await this.locator(selector).filter({ hasText: text }).waitFor({
      state: 'visible',
      timeout: this.timeout
    });
  }
}

module.exports = { GuidewirePage };
