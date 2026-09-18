import { type Locator, type Page } from '@playwright/test';

export class ConfirmationPage {
  readonly heading: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.heading = page.getByRole('heading', { name: 'Thank you for your order!' });
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }
}
