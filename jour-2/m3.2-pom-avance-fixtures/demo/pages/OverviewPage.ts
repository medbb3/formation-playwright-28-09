import { type Locator, type Page } from '@playwright/test';

export class OverviewPage {
  readonly subtotal: Locator;
  readonly total: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.subtotal = page.getByTestId('subtotal-label');
    this.total = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });
  }

  async finish() {
    await this.finishButton.click();
  }
}
